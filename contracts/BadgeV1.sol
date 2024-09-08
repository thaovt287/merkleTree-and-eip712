// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Base} from "./base/Base.sol";
import {Validation, BoolUtils} from "./libs/Utils.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

// EIP712,
contract BadgeV1 is
    ERC1155Upgradeable,
    ERC1155PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    EIP712Upgradeable,
    Base
{
    using ECDSA for bytes32;

    bytes32 internal constant _MINT_DATA_TYPEHASH =
        keccak256(
            "MintBadgeData(address to,uint256 badgeId,uint256 tokenId,bytes32 badgeNameHash)"
        );

    /** Role definintions */
    bytes32 public constant BADGE_SETTER = keccak256("BADGE_SETTER");
    bytes32 public constant VERIFY_ADDRESS_SETTER =
        keccak256("VERIFY_ADDRESS_SETTER");

    /** Datatypes */
    struct MintBadgeData {
        address to;
        uint256 badgeId;
        uint256 tokenId;
        bytes32 badgeNameHash;
        bytes signature;
    }

    /** Storage */
    /// @custom:storage-location erc7201:BadgeV1.storage.BadgeStorage
    struct BadgeStorage {
        address _verifyAddress;
        string[] badgeNames;
        //badgeNameHash -tokenId
        mapping(bytes32 => uint256) tokenIds;
        //badgeId-tokenId - BoolUtils.toBytes32(true/false)
        mapping(uint256 => bytes32) minted;
    }

    // keccak256(abi.encode(uint256(keccak256("BadgeV1.storage.BadgeStorage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BadgeStorageSlot =
        0x5121b58330e090f31e5cc4b70911e0a32e9c93fc2278ddf4c965432a42163a00;

    function _getBadgeStorage() internal pure returns (BadgeStorage storage $) {
        assembly {
            $.slot := BadgeStorageSlot
        }
    }

    /** Events */
    event MintBadgeAdded(
        address indexed caller,
        uint256 idBadge,
        uint256 tokenId,
        address to,
        uint256 timestamp
    );
    event BadgeSet(
        address indexed caller,
        string badgeName,
        bytes32 badgeNameHash,
        uint256 tokenId,
        uint256 timestamp
    );

    event VerifyAddressSet(
        address indexed caller,
        address oldVerifyAddress,
        address newVerifyAddress,
        uint256 timestamp
    );

    /**
     * @dev The mintData `verifyAddress` doesn't match with the recovered `signer`.
     */
    error InvalidSigner(address signer, address verifyAddress);
    error BadgeMinted(uint256 badgeId, uint256 tokenId);
    error EmptyList();
    error InvalidTokenId(uint256 tokenId, uint256 mintDataTokenId);

    function initialize(
        address initialAdmin,
        address verifyAddress,
        string calldata domainName,
        string calldata domainVersion
    ) external initializer {
        Validation.noZeroAddress(initialAdmin);
        Validation.noZeroAddress(verifyAddress);

        __Base_init(initialAdmin);
        __EIP712_init(domainName, domainVersion);

        BadgeStorage storage $ = _getBadgeStorage();
        $._verifyAddress = verifyAddress;
    }

    function mint(MintBadgeData calldata mintData) public whenNotPaused {
        (
            bool signerMatch,
            address signer,
            address verifyAddress,
            uint256 tokenId
        ) = _validate(mintData);
        if (tokenId != mintData.tokenId || tokenId == 0) {
            revert InvalidTokenId(tokenId, mintData.tokenId);
        }
        if (!signerMatch) {
            revert InvalidSigner(signer, verifyAddress);
        }
        addMinted(mintData.badgeId, mintData.tokenId);
        _mint(mintData.to, mintData.tokenId, 1, "");

        emit MintBadgeAdded(
            _msgSender(),
            mintData.badgeId,
            mintData.tokenId,
            mintData.to,
            block.timestamp
        );
    }

    function setVerifyAddress(
        address newVerifyAddress
    ) external onlyRole(VERIFY_ADDRESS_SETTER) {
        Validation.noZeroAddress(newVerifyAddress);
        address oldVerifyAddress = getVerifyAddress();
        BadgeStorage storage $ = _getBadgeStorage();
        $._verifyAddress = newVerifyAddress;
        emit VerifyAddressSet(
            _msgSender(),
            oldVerifyAddress,
            newVerifyAddress,
            block.timestamp
        );
    }

    function setBadge(
        string calldata badgeName
    ) external onlyRole(BADGE_SETTER) {
        _setBadge(badgeName);
    }
    function setBadges(
        string[] calldata badgeNames
    ) external onlyRole(BADGE_SETTER) {
        if (badgeNames.length == 0) {
            revert EmptyList();
        }
        for (uint256 i = 0; i < badgeNames.length; i++) {
            _setBadge(badgeNames[i]);
        }
    }
    function _setBadge(string calldata badgeName) internal {
        uint256 tokenId = _genTokenId(badgeName);
        bytes32 _badgeNameHash = hashBadgeName(badgeName);
        BadgeStorage storage $ = _getBadgeStorage();
        $.tokenIds[_badgeNameHash] = tokenId;
        $.badgeNames.push(badgeName);
        emit BadgeSet(
            _msgSender(),
            badgeName,
            _badgeNameHash,
            tokenId,
            block.timestamp
        );
    }

    function getBadgeNames() public view returns (string[] memory badgeNames) {
        return _getBadgeStorage().badgeNames;
    }

    function getTokenId(bytes32 badgeNameHash) public view returns (uint256) {
        return _getBadgeStorage().tokenIds[badgeNameHash];
    }

    function hashBadgeName(
        string calldata badgeName
    ) public pure returns (bytes32) {
        return bytes32(stringToBytes(badgeName, 32));
    }

    function _genTokenId(
        string calldata badgeName
    ) internal view returns (uint256) {
        bytes memory nameHash12Bytes = stringToBytes(badgeName, 12);
        return
            uint256(
                bytes32(bytes.concat(nameHash12Bytes, bytes20(address(this))))
            );
    }

    function getVerifyAddress() internal view returns (address) {
        return _getBadgeStorage()._verifyAddress;
    }

    function _validate(
        MintBadgeData calldata mintData
    )
        internal
        view
        virtual
        returns (
            bool signerMatch,
            address signer,
            address verifyAddress,
            uint256 tokenId
        )
    {
        BadgeStorage storage $ = _getBadgeStorage();
        uint256 _tokenId = $.tokenIds[mintData.badgeNameHash];
        address _verifyAddress = getVerifyAddress();
        address recovered = _recoverSigner(mintData);

        return (
            recovered == _verifyAddress,
            recovered,
            _verifyAddress,
            _tokenId
        );
    }

    function _recoverSigner(
        MintBadgeData calldata mintData
    ) internal view virtual returns (address recovered) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _MINT_DATA_TYPEHASH,
                    mintData.to,
                    mintData.badgeId,
                    mintData.tokenId,
                    mintData.badgeNameHash
                )
            )
        );

        return ECDSA.recover(digest, mintData.signature);
    }

    function addMinted(uint256 badgeId, uint256 tokenId) internal {
        BadgeStorage storage $ = _getBadgeStorage();
        if (BoolUtils.bytes32ToBool($.minted[badgeId])) {
            revert BadgeMinted(badgeId, tokenId);
        }
        $.minted[badgeId] = BoolUtils.toBytes32(true);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(Base, ERC1155Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    )
        internal
        virtual
        override(ERC1155Upgradeable, ERC1155PausableUpgradeable)
        whenNotPaused
    {
        super._update(from, to, ids, values);
    }

    function stringToBytes(
        string memory input,
        uint256 length
    ) public pure returns (bytes memory) {
        bytes memory inputBytes = bytes(input);
        bytes memory result = new bytes(length);
        uint256 minLength = inputBytes.length < length
            ? inputBytes.length
            : length;

        // Copy only the necessary bytes
        for (uint256 i = 0; i < minLength; i++) {
            result[i] = inputBytes[i];
        }

        return result;
    }

    // not tranferable
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        revert("Transfers are disabled for this token.");
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        revert("Batch transfers are disabled for this token.");
    }
}
