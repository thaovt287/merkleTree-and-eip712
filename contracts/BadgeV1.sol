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
        keccak256("MintBadgeData(address to,uint256 badgeId,uint256 tokenId)");

    /** Role definintions */
    bytes32 public constant BADGE_SETTER = keccak256("BADGE_SETTER");
    bytes32 public constant VERIFY_ADDRESS_SETTER =
        keccak256("VERIFY_ADDRESS_SETTER");

    /** Datatypes */
    struct MintBadgeData {
        address to;
        uint256 badgeId;
        uint256 tokenId;
        bytes signature;
    }

    /** Storage */
    /// @custom:storage-location erc7201:BadgeV1.storage.BadgeStorage
    struct BadgeStorage {
        address _verifyAddress;
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
        uint256 badgeId,
        uint256 tokenId,
        address to,
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
        (bool signerMatch, address signer, address verifyAddress) = _validate(
            mintData
        );
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

    function getVerifyAddress() internal view returns (address) {
        return _getBadgeStorage()._verifyAddress;
    }

    function _validate(
        MintBadgeData calldata mintData
    )
        internal
        view
        virtual
        returns (bool signerMatch, address signer, address verifyAddress)
    {
        BadgeStorage storage $ = _getBadgeStorage();
        address _verifyAddress = getVerifyAddress();
        address recovered = _recoverSigner(mintData);

        return (recovered == _verifyAddress, recovered, _verifyAddress);
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
                    mintData.tokenId
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
