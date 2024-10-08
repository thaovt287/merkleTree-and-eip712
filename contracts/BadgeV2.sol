// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Base} from "./base/Base.sol";
import {Validation, BoolUtils} from "./libs/Utils.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract BadgeV2 is
    ERC1155Upgradeable,
    ERC1155PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    Base
{
    /** Role definintions */
    bytes32 public constant ROOT_SETTER = keccak256("ROOT_SETTER");
    bytes32 public constant BADGE_SETTER = keccak256("BADGE_SETTER");

    struct MintBadgeData {
        address to;
        uint256 point;
        uint256 tokenId;
        bytes32[] merkleProof;
    }
    struct BadgeToken {
        string badgeName;
        uint256 tokenId;
    }

    /** Storage */
    /// @custom:storage-location erc7201:BadgeV2.storage.BadgeStorage
    struct BadgeStorage {
        //TokenId - eligiblePoint
        mapping(uint256 => uint256) eligiblePoints;
        bytes32 merkleRoot;
        //to - tokenId - BoolUtils.toBytes32(true/false)
        mapping(address => mapping(uint256 => bytes32)) minted;
    }

    // keccak256(abi.encode(uint256(keccak256("BadgeV2.storage.BadgeStorage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BadgeStorageSlot =
        0xcad405e946207826a21d04de3afd627666f1d0076931204b76c314f1f0307d00;

    function _getBadgeStorage() internal pure returns (BadgeStorage storage $) {
        assembly {
            $.slot := BadgeStorageSlot
        }
    }

    /** Events */
    event MintBadgeAdded(
        address indexed caller,
        uint256 tokenId,
        address to,
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
    error BadgeMinted(address to, uint256 tokenId);
    error EmptyList();
    error InvalidMintData(MintBadgeData mintData);
    error NotsetEligiblePointBadge(uint256 tokenId);
    error NotEnoughPoint(address to, uint256 point, uint256 eligiblePoint);
    error InvalidsetEligiblePointBadgeList(
        uint256 badgeIdsLength,
        uint256 eligiblePoinsLength
    );

    function initialize(address initialAdmin) external initializer {
        Validation.noZeroAddress(initialAdmin);

        __Base_init(initialAdmin);
    }

    function mint(MintBadgeData calldata mintData) public whenNotPaused {
        (
            bytes32 merkleRoot,
            bool isVerifyMerkleValid,
            bool isEnoughPoint,
            uint256 eligiblePoint
        ) = _validate(mintData);
        if (merkleRoot == bytes32(0)) {
            revert NotSetmerkleRoot(merkleRoot);
        }
        if (!isVerifyMerkleValid) {
            revert InvalidMintData(mintData);
        }
        if (eligiblePoint <= 0) {
            revert NotsetEligiblePointBadge(mintData.tokenId);
        }
        if (!isEnoughPoint) {
            revert NotEnoughPoint(mintData.to, mintData.point, eligiblePoint);
        }
        addMinted(mintData.to, mintData.tokenId);
        _mint(mintData.to, mintData.tokenId, 1, "");

        emit MintBadgeAdded(
            _msgSender(),
            mintData.tokenId,
            mintData.to,
            block.timestamp
        );
    }

    //-------------- setMerkleRoot --------------
    function setMerkleRoot(bytes32 rootHash) external onlyRole(ROOT_SETTER) {
        if (rootHash == bytes32(0)) {
            revert NoZeroBytes32(rootHash);
        }
        _getBadgeStorage().merkleRoot = rootHash;
    }
    //-------------- setEligiblePointBadge --------------

    function setEligiblePointBadge(
        uint256 badgeId,
        uint256 eligiblePoint
    ) external onlyRole(BADGE_SETTER) {
        _setEligiblePointBadge(badgeId, eligiblePoint);
    }
    function setEligiblePointBadges(
        uint256[] calldata badgeId,
        uint256[] calldata eligiblePoins
    ) external onlyRole(BADGE_SETTER) {
        if (badgeId.length == 0 || badgeId.length != eligiblePoins.length) {
            revert InvalidsetEligiblePointBadgeList(
                badgeId.length,
                eligiblePoins.length
            );
        }
        for (uint256 i = 0; i < badgeId.length; i++) {
            _setEligiblePointBadge(badgeId[i], eligiblePoins[i]);
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

    function getEligiblePoint(uint256 badgeId) public view returns (uint256) {
        BadgeStorage storage $ = _getBadgeStorage();
        return $.eligiblePoints[badgeId];
    }

    function _validate(
        MintBadgeData calldata mintData
    )
        internal
        view
        virtual
        returns (
            bytes32 merkleRoot,
            bool isVerifyMerkleValid,
            bool isEnoughPoint,
            uint256 eligiblePoint
        )
    {
        BadgeStorage storage $ = _getBadgeStorage();
        bool _isVerifyMerkleValid = verifyMerkle(mintData);
        uint256 _eligiblePoint = $.eligiblePoints[mintData.tokenId];

        return (
            _getBadgeStorage().merkleRoot,
            _isVerifyMerkleValid,
            _eligiblePoint < mintData.point,
            _eligiblePoint
        );
    }

    function verifyMerkle(
        MintBadgeData calldata mintData
    ) internal view virtual returns (bool isVerifyMerkleValid) {
        bytes32 leaf = keccak256(
            bytes.concat(
                keccak256(
                    abi.encode(mintData.to, mintData.tokenId, mintData.point)
                )
            )
        );

        return
            MerkleProof.verify(
                mintData.merkleProof,
                _getBadgeStorage().merkleRoot,
                leaf
            );
    }

    function addMinted(address to, uint256 tokenId) internal {
        BadgeStorage storage $ = _getBadgeStorage();
        if (BoolUtils.bytes32ToBool($.minted[to][tokenId])) {
            revert BadgeMinted(to, tokenId);
        }
        $.minted[to][tokenId] = BoolUtils.toBytes32(true);
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
