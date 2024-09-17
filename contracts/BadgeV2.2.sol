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
        keccak256("MintPointData(address to,uint256 pointId,uint256 amount)");

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
        uint256 pointId;
        uint256 amount;
        bytes signature;
    }

    struct MintBadgeData {
        address to;
        uint256 badgeId;
        uint256 pointId;
    }

    /** Storage */
    /// @custom:storage-location erc7201:BadgeV22.storage.BadgeStorage
    struct BadgeStorage {
        address _verifyAddress;
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
    error NotsetEligiblePointBadge(uint256 badgeId);
    error NotEnoughPoint(
        address to,
        uint256 badgeId,
        uint256 point,
        uint256 eligiblePoint
    );
    error InvalidsetEligiblePointBadgeList(
        uint256 badgeNamesLength,
        uint256 eligiblePoinsLength
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
            mintData.pointId,
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
        _validateMintPoint(mintData);

        _mint(mintData.to, mintData.pointId, mintData.amount, "");
    }

    function _mintBadge(
        MintBadgeData calldata mintData
    ) internal returns (uint256 _badgeId) {
        uint256 eligiblePoint = getEligiblePoint(mintData.badgeId);
        if (eligiblePoint == 0) {
            revert NotsetEligiblePointBadge(mintData.badgeId);
        }
        uint256 point = balanceOf(mintData.to, mintData.pointId);
        if (point < eligiblePoint) {
            revert NotEnoughPoint(
                mintData.to,
                mintData.badgeId,
                point,
                eligiblePoint
            );
        }
        _burn(mintData.to, mintData.pointId, eligiblePoint);
        _mint(mintData.to, mintData.badgeId, 1, "");
        return mintData.badgeId;
    }

    function getEligiblePoint(uint256 badgeId) public view returns (uint256) {
        BadgeStorage storage $ = _getBadgeStorage();
        return $.eligiblePoints[badgeId];
    }

    function _validateMintPoint(
        MintPointData calldata mintData
    ) internal view virtual {
        address _verifyAddress = getVerifyAddress();
        address recovered = _recoverMintPointSigner(mintData);
        if (recovered != _verifyAddress) {
            revert InvalidSigner(recovered, _verifyAddress, mintData);
        }
    }

    //-------------- setEligiblePointBadge --------------

    function setEligiblePointBadge(
        uint256 badgeId,
        uint256 eligiblePoint
    ) external onlyRole(BADGE_SETTER) {
        _setEligiblePointBadge(badgeId, eligiblePoint);
    }
    function setEligiblePointBadges(
        uint256[] calldata badgeIds,
        uint256[] calldata eligiblePoins
    ) external onlyRole(BADGE_SETTER) {
        if (badgeIds.length == 0 || badgeIds.length != eligiblePoins.length) {
            revert InvalidsetEligiblePointBadgeList(
                badgeIds.length,
                eligiblePoins.length
            );
        }
        for (uint256 i = 0; i < badgeIds.length; i++) {
            _setEligiblePointBadge(badgeIds[i], eligiblePoins[i]);
        }
    }
    function _setEligiblePointBadge(
        uint256 badgeId,
        uint256 eligiblePoint
    ) internal {
        BadgeStorage storage $ = _getBadgeStorage();
        $.eligiblePoints[badgeId] = eligiblePoint;
        emit BadgeSet(_msgSender(), badgeId, eligiblePoint, block.timestamp);
    }

    function getVerifyAddress() internal view returns (address) {
        return _getBadgeStorage()._verifyAddress;
    }

    function _recoverMintPointSigner(
        MintPointData calldata mintData
    ) internal view virtual returns (address recovered) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _MINT_POINT_DATA_TYPEHASH,
                    mintData.to,
                    mintData.pointId,
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
