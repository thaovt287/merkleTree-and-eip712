// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Base} from "./base/Base.sol";
import {Validation, BoolUtils} from "./libs/Utils.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

contract BadgeV22 is
    ERC1155Upgradeable,
    ERC1155PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    EIP712Upgradeable,
    Base
{
    using ECDSA for bytes32;

    bytes32 internal constant _MINT_POINT_DATA_TYPEHASH =
        keccak256("MintPointData(address to,uint256 tokenId,unit256 amount)");

    /** Role definintions */
    bytes32 public constant VERIFY_ADDRESS_SETTER =
        keccak256("VERIFY_ADDRESS_SETTER");
    bytes32 public constant BADGE_SETTER = keccak256("BADGE_SETTER");
    enum BadgeType {
        POINT,
        BADGE
    }

    struct MintPointData {
        address to;
        uint256 tokenId;
        string badgeName;
        uint256 amount;
        bytes signature;
    }
    struct MintBadgeData {
        address to;
        string badgeName;
    }
    struct BadgeToken {
        string badgeName;
        uint256 badgeId;
    }

    /** Storage */
    /// @custom:storage-location erc7201:BadgeV22.storage.BadgeStorage
    struct BadgeStorage {
        address _verifyAddress;
        string[] badgeNames;
        //badgeId - eligiblePoint
        mapping(uint256 => uint256) eligiblePoints;
    }

    // keccak256(abi.encode(uint256(keccak256("BadgeV22.storage.BadgeStorage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BadgeStorageSlot =
        0x123f94731b450aef36d5d894248e507baa0b51137bf4257bc9fad58c51fbce00;

    function _getBadgeStorage() internal pure returns (BadgeStorage storage $) {
        assembly {
            $.slot := BadgeStorageSlot
        }
    }

    /** Events */
    event NFTMint(
        address indexed caller,
        uint256 tokenId,
        uint256 amount,
        address to,
        BadgeType badgeType,
        uint256 timestamp
    );
    event BadgeSet(
        address indexed caller,
        string badgeName,
        uint256 badgeId,
        uint256 eligiblePoint,
        uint256 timestamp
    );

    /**
     * @dev
     */
    error NoZeroBytes32(bytes32 rootHash);
    error NotSetmerkleRoot(bytes32 rootHash);
    error EmptyList();
    error InvalidMintPointData(MintPointData mintData);
    error NotSetBadge(uint256 badgeId);
    error NotEnoughPoint(address to, uint256 point, uint256 eligiblePoint);
    error InvalidSetBadgeList(
        uint256 badgeNamesLength,
        uint256 eligiblePoinsLength
    );
    error InvalidTokenId(
        BadgeType badgeType,
        uint256 tokenId,
        uint256 mintDataTokenId
    );
    error InvalidSigner(
        address signer,
        address verifyAddress,
        MintPointData mintData
    );

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

    function mintPoint(MintPointData calldata mintData) public whenNotPaused {
        _mintPoint(mintData);
        emit NFTMint(
            _msgSender(),
            mintData.tokenId,
            mintData.amount,
            mintData.to,
            BadgeType.POINT,
            block.timestamp
        );
    }

    function mintBadge(MintBadgeData calldata mintData) public whenNotPaused {
        uint256 badgeId = _mintBadge(mintData);
        emit NFTMint(
            _msgSender(),
            badgeId,
            1,
            mintData.to,
            BadgeType.BADGE,
            block.timestamp
        );
    }

    function _mintPoint(MintPointData calldata mintData) internal {
        (
            bool signerMatch,
            address signer,
            address verifyAddress,
            uint256 pointId
        ) = _validateMintPoint(mintData);
        if (pointId != mintData.tokenId || pointId == 0) {
            revert InvalidTokenId(BadgeType.POINT, pointId, mintData.tokenId);
        }
        if (!signerMatch) {
            revert InvalidSigner(signer, verifyAddress, mintData);
        }
        _mint(mintData.to, mintData.tokenId, mintData.amount, "");
    }

    function _mintBadge(
        MintBadgeData calldata mintData
    ) internal returns (uint256 _badgeId) {
        uint256 badgeId = _genbadgeId(mintData.badgeName);
        uint256 eligiblePoint = getEligiblePoint(mintData.badgeName);
        if (eligiblePoint == 0) {
            revert NotSetBadge(badgeId);
        }
        uint256 pointId = _genPointId(mintData.badgeName);
        uint256 point = balanceOf(mintData.to, pointId);
        if (point < eligiblePoint) {
            revert NotEnoughPoint(mintData.to, point, eligiblePoint);
        }
        _burn(mintData.to, pointId, eligiblePoint);
        _mint(mintData.to, badgeId, 1, "");
        return badgeId;
    }

    //-------------- setBadge --------------

    function setBadge(
        string calldata badgeName,
        uint256 eligiblePoint
    ) external onlyRole(BADGE_SETTER) {
        _setBadge(badgeName, eligiblePoint);
    }
    function setBadges(
        string[] calldata badgeNames,
        uint256[] calldata eligiblePoins
    ) external onlyRole(BADGE_SETTER) {
        if (
            badgeNames.length == 0 || badgeNames.length != eligiblePoins.length
        ) {
            revert InvalidSetBadgeList(badgeNames.length, eligiblePoins.length);
        }
        for (uint256 i = 0; i < badgeNames.length; i++) {
            _setBadge(badgeNames[i], eligiblePoins[i]);
        }
    }
    function _setBadge(
        string calldata badgeName,
        uint256 eligiblePoint
    ) internal {
        uint256 badgeId = _genbadgeId(badgeName);
        BadgeStorage storage $ = _getBadgeStorage();
        $.eligiblePoints[badgeId] = eligiblePoint;
        $.badgeNames.push(badgeName);
        emit BadgeSet(
            _msgSender(),
            badgeName,
            badgeId,
            eligiblePoint,
            block.timestamp
        );
    }

    function getBadgeNames() public view returns (string[] memory badgeNames) {
        return _getBadgeStorage().badgeNames;
    }

    function getBadgeId(
        string memory badgeName
    ) external view returns (uint256) {
        return _genbadgeId(badgeName);
    }

    function getPointId(
        string memory badgeName
    ) external view returns (uint256) {
        return _genPointId(badgeName);
    }

    function getBadgeIds() external view returns (BadgeToken[] memory) {
        string[] memory badgeNames = getBadgeNames();
        BadgeToken[] memory badgeIds = new BadgeToken[](badgeNames.length);

        for (uint256 i = 0; i < badgeNames.length; i++) {
            badgeIds[i] = BadgeToken(badgeNames[i], _genbadgeId(badgeNames[i]));
        }

        return badgeIds;
    }

    function getEligiblePoint(
        string calldata badgeName
    ) public view returns (uint256) {
        uint256 badgeId = _genbadgeId(badgeName);
        BadgeStorage storage $ = _getBadgeStorage();
        return $.eligiblePoints[badgeId];
    }

    function _genbadgeId(
        string memory badgeName
    ) internal view returns (uint256) {
        bytes memory nameHash10Bytes = stringToBytes(badgeName, 10);
        bytes memory badgeID2bytes = stringToBytes("Badge", 2);
        return
            uint256(
                bytes32(
                    bytes.concat(
                        nameHash10Bytes,
                        badgeID2bytes,
                        bytes20(address(this))
                    )
                )
            );
    }

    function _genPointId(
        string memory badgeName
    ) internal view returns (uint256) {
        bytes memory nameHash10Bytes = stringToBytes(badgeName, 10);
        bytes memory pointId2bytes = stringToBytes("Point", 2);
        return
            uint256(
                bytes32(
                    bytes.concat(
                        nameHash10Bytes,
                        pointId2bytes,
                        bytes20(address(this))
                    )
                )
            );
    }

    function _validateMintPoint(
        MintPointData calldata mintData
    )
        internal
        view
        virtual
        returns (
            bool signerMatch,
            address signer,
            address verifyAddress,
            uint256 pointId
        )
    {
        uint256 _pointId = _genPointId(mintData.badgeName);
        address _verifyAddress = getVerifyAddress();
        address recovered = _recoverSigner(mintData);

        return (
            recovered == _verifyAddress,
            recovered,
            _verifyAddress,
            _pointId
        );
    }
    function getVerifyAddress() internal view returns (address) {
        return _getBadgeStorage()._verifyAddress;
    }

    function _recoverSigner(
        MintPointData calldata mintData
    ) internal view virtual returns (address recovered) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _MINT_POINT_DATA_TYPEHASH,
                    mintData.to,
                    mintData.tokenId,
                    mintData.amount
                )
            )
        );

        return ECDSA.recover(digest, mintData.signature);
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
