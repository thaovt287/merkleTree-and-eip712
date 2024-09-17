require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
const ethers = require("ethers");
const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { log } = require("console");
const { init } = require("./fixture.V2.2");
const {
    signData,
    genPointId,
    genBadgeId,
} = require("../scripts/claimBadge/signV2");
const { BlockHelper } = require("./blockHelper");
const BADGE_TYPE = {
    POINT: 0,
    BADGE: 1,
};

describe("Swap contract", () => {
    let badgeContract,
        contractAdmin,
        badgeSetter,
        verifyAddress,
        verifyAddressSetter,
        addrs,
        badgeProxyAddress;
    const badgeNames = [
        "ARC Crew",
        "Connector",
        "Champion",
        "Connoisseur",
        "Co-creator",
        "Champion+",
        "Connector+",
        "Connoisseur+",
        "Co-creator+",
    ];
    const eligiblePoins = [10, 20, 2, 30, 5, 20, 30, 12, 20];
    const signerPk =
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6";
    async function deployContracts() {
        const { accounts, badgeProxyAddress, badgeContract } = await init();

        [
            contractAdmin,
            badgeSetter,
            verifyAddress,
            verifyAddressSetter,
            ...addrs
        ] = accounts;

        return {
            badgeProxyAddress,
            badgeContract,
            contractAdmin,
            badgeSetter,
            verifyAddress,
            verifyAddressSetter,
            addrs,
        };
    }

    async function deployAndSetup() {
        const {
            badgeContract,
            contractAdmin,
            badgeSetter,
            verifyAddressSetter,
            verifyAddress,
        } = await loadFixture(deployContracts);
        // grant BADGE_SETTER role to badgeSetter
        await badgeContract.grantRole(
            await badgeContract.BADGE_SETTER(),
            badgeSetter.address,
        );

        // set badges and eligible points
        const badgeIds = [];
        for (let index = 0; index < badgeNames.length; index++) {
            // console.log(badgeNames[index]);
            badgeIds.push(genBadgeId(badgeProxyAddress, badgeNames[index]));
        }
        await badgeContract
            .connect(badgeSetter)
            .setEligiblePointBadges(badgeIds, eligiblePoins);

        await badgeContract
            .connect(badgeSetter)
            .setEligiblePointBadge(
                genBadgeId(badgeProxyAddress, "Connoisseur"),
                12,
            );

        const user1 = addrs[0][0];
        const user2 = addrs[0][1];
        const user3 = addrs[0][2];

        return {
            badgeContract,
            contractAdmin,
            badgeSetter,
            verifyAddress,
            user1,
            user2,
            user3,
        };
    }

    describe("Deployment", () => {
        before(async () => {
            const {
                badgeProxyAddress: _badgeProxyAddress,
                badgeContract: _badgeContract,
                contractAdmin: _contractAdmin,
                badgeSetter: _badgeSetter,
                verifyAddressSetter: _verifyAddressSetter,
            } = await loadFixture(deployContracts);

            badgeContract = _badgeContract;
            badgeProxyAddress = _badgeProxyAddress;
            contractAdmin = _contractAdmin;
            badgeSetter = _badgeSetter;
            verifyAddressSetter = _verifyAddressSetter;
        });

        it("Should deploy the Badge contract", async () => {
            expect(badgeContract.address).to.not.equal(0);
        });

        it("The deployer should have the DEFAULT_ADMIN_ROLE", async () => {
            expect(
                await badgeContract.hasRole(
                    await badgeContract.DEFAULT_ADMIN_ROLE(),
                    contractAdmin.address,
                ),
            ).to.be.true;
        });

        it("The deployer should have the UPGRADER role", async () => {
            expect(
                await badgeContract.hasRole(
                    await badgeContract.UPGRADER(),
                    contractAdmin.address,
                ),
            ).to.be.true;
        });

        it("The deployer should have the PAUSER role", async () => {
            expect(
                await badgeContract.hasRole(
                    await badgeContract.PAUSER(),
                    contractAdmin.address,
                ),
            ).to.be.true;
        });

        it("The deployer should not have the BADGE_SETTER role", async () => {
            expect(
                await badgeContract.hasRole(
                    await badgeContract.BADGE_SETTER(),
                    contractAdmin.address,
                ),
            ).to.be.false;
        });

        it("The deployer should not have the VERIFY_ADDRESS_SETTER role", async () => {
            expect(
                await badgeContract.hasRole(
                    await badgeContract.VERIFY_ADDRESS_SETTER(),
                    contractAdmin.address,
                ),
            ).to.be.false;
        });
    });
    describe("Badge Setting", () => {
        it("Should grant the BADGE_SETTER role to the badge setter wallet", async () => {
            await badgeContract.grantRole(
                await badgeContract.BADGE_SETTER(),
                badgeSetter.address,
            );

            expect(
                await badgeContract.hasRole(
                    await badgeContract.BADGE_SETTER(),
                    badgeSetter.address,
                ),
            ).to.be.true;
        });

        it("Should set a badge", async () => {
            let badgeId = genBadgeId(badgeProxyAddress, badgeNames[0]);
            let badgeSetTx = await badgeContract
                .connect(badgeSetter)
                .setEligiblePointBadge(badgeId, 12);
            let badgeSetTxReceipt = await badgeSetTx.wait();
            let badgeSetTxTimestamp =
                await BlockHelper.getBlockTimestamp(badgeSetTxReceipt);

            let events = await badgeContract.queryFilter(
                "BadgeSet",
                badgeSetTxReceipt.blockNumber,
                badgeSetTxReceipt.blockNumber,
            );

            expect(events[0].args.caller).to.be.equal(badgeSetter.address);
            expect(events[0].args.timestamp).to.be.equal(badgeSetTxTimestamp);
        });
    });
    describe("mint pointNFT", () => {
        let user1, user2, user3;

        before(async () => {
            const {
                badgeProxyAddress: _badgeProxyAddress,
                badgeContract: _badgeContract,
                contractAdmin: _contractAdmin,
                badgeSetter: _badgeSetter,
                verifyAddressSetter: _verifyAddressSetter,
                user1: _user1,
                user2: _user2,
                user3: _user3,
            } = await loadFixture(deployAndSetup);

            badgeContract = _badgeContract;
            badgeProxyAddress = _badgeProxyAddress;
            contractAdmin = _contractAdmin;
            badgeSetter = _badgeSetter;
            verifyAddressSetter = _verifyAddressSetter;
            user1 = _user1;
            user2 = _user2;
            user3 = _user3;
        });
        it("mint a NFT", async function () {
            const badgeName = badgeNames[0];

            // for (let i = 0; i < 100; i++) {
            //     const mintData = await signData(signerPk, badgeContract, {
            //         badgeName: badgeName,
            //         point: 50,
            //         badgeType: 1,
            //     });

            //     await badgeContract
            //         .connect(user2)
            //         .mint(mintData)
            //         .then((tx) => {
            //             tx.wait();
            //         });
            // }
            const mintData = await signData(signerPk, badgeContract, {
                to: user1.address,
                badgeName: badgeName,
                point: 50,
                badgeType: BADGE_TYPE.POINT,
            });

            await badgeContract
                .connect(user2)
                .mintPoint(mintData)
                .then((tx) => {
                    tx.wait();
                });
            expect(
                await badgeContract.balanceOf(user1.address, mintData.pointId),
            ).to.be.deep.eq(50);

            const badgeId = genBadgeId(badgeContract.target, badgeName);
            const mintBadgeData = {
                to: user1.address,
                pointId: genPointId(badgeContract.target, badgeName),
                badgeId,
            };

            // console.log(user2);
            await badgeContract
                .connect(user2)
                .mintBadge(mintBadgeData)
                .then((tx) => {
                    tx.wait();
                });

            expect(
                await badgeContract.balanceOf(user1.address, mintData.pointId),
            ).to.be.deep.eq(40);
            expect(
                await badgeContract.balanceOf(user1.address, badgeId),
            ).to.be.deep.eq(1);
        });

        // it("Mint 2 NFTs with the same tokenId", async function () {
        //     const badgeNameFromContract = await badgeContract.getBadgeNames();
        //     const badgeName = badgeNameFromContract[2];
        //     const mintData = await signData(signerPk, badgeContract, {
        //         verifyAddress: verifyAddress.address,
        //         to: user1.address,
        //         badgeId: 100,
        //         badgeName: badgeName,
        //     });

        //     await badgeContract
        //         .connect(user2)
        //         .mint(mintData)
        //         .then((tx) => {
        //             tx.wait();
        //         });

        //     const mintData2 = await signData(signerPk, badgeContract, {
        //         verifyAddress: verifyAddress.address,
        //         to: user1.address,
        //         badgeId: 101,
        //         badgeName: badgeName,
        //     });

        //     await badgeContract
        //         .connect(user2)
        //         .mint(mintData2)
        //         .then((tx) => {
        //             tx.wait();
        //         });

        //     // expect(
        //     //     await badgeContract.balanceOf(user2.address, mintData.tokenId),
        //     // ).to.be.deep.eq(0);
        //     // expect(
        //     //     await badgeContract.balanceOf(user1.address, mintData.tokenId),
        //     // ).to.be.deep.eq(3);
        // });

        // it("Should revert when minting 2 NFTs with 1 signature", async function () {
        //     const badgeNameFromContract = await badgeContract.getBadgeNames();
        //     const badgeName = badgeNameFromContract[1];
        //     const mintData = await signData(signerPk, badgeContract, {
        //         verifyAddress: verifyAddress.address,
        //         to: user1.address,
        //         badgeId: 1001,
        //         badgeName: badgeName,
        //     });

        //     await badgeContract
        //         .connect(user2)
        //         .mint(mintData)
        //         .then((tx) => {
        //             tx.wait();
        //         });

        //     // expect(
        //     //     await badgeContract.balanceOf(user2.address, mintData.tokenId),
        //     // ).to.be.deep.eq(0);
        //     // expect(
        //     //     await badgeContract.balanceOf(user1.address, mintData.tokenId),
        //     // ).to.be.deep.eq(4);

        //     await expect(
        //         badgeContract.connect(user2).mint(mintData),
        //     ).to.revertedWithCustomError(badgeContract, "BadgeMinted");
        // });

        // it("Should revert when minting NFTs if badgeName is not in the badgeNames", async function () {
        //     const badgeName = "Tesst";
        //     const mintData = await signData(signerPk, badgeContract, {
        //         verifyAddress: verifyAddress.address,
        //         to: user1.address,
        //         badgeId: 5,
        //         badgeName: badgeName,
        //     });

        //     await expect(
        //         badgeContract.connect(user2).mint(mintData),
        //     ).to.revertedWithCustomError(badgeContract, "InvalidTokenId");
        // });
    });
});
