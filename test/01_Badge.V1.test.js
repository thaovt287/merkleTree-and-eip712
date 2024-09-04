require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
const ethers = require("ethers");
const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { log } = require("console");
const { init } = require("./fixture.V1");
const { signData, getBadgeData } = require("../scripts/claimBadge/sign");
const { BlockHelper } = require("./blockHelper");

describe("Swap contract", () => {
    let badgeContract,
        contractAdmin,
        badgeSetter,
        verifyAddress,
        verifyAddressSetter,
        addrs,
        badgeProxyAddress;
    const badgeNames = ["ARC Crew", "Connector", "Champion"];
    const signerPk =
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6";
    async function deployContracts() {
        const {
            accounts,
            badgeProxyAddress,
            badgeContract,
        } = await init();

        [contractAdmin, badgeSetter,verifyAddress, verifyAddressSetter,...addrs] =
            accounts;

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
        await badgeContract.connect(badgeSetter).setBadges(badgeNames )
        await badgeContract.connect(badgeSetter).setBadge("Connoisseur")

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

        it("Should return 0 for a badge that is not setted", async () => {
            const badgeNameHash = await badgeContract.hashBadgeName("test")
            expect(await badgeContract.getTokenId(badgeNameHash)).to.be.deep.eq(0);
        });

        it("Should set a badge", async () => {
            let badgeSetTx = await badgeContract
                .connect(badgeSetter).setBadge("Co-creator");
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
    describe("mint NFT", () => {
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
            const badgeNameFromContract = await badgeContract.getBadgeNames();
            const badgeName = badgeNameFromContract[0];

            for (let i = 0; i <100; i++) {
                const mintData = await signData(signerPk, badgeContract, {
                    adminWallet: verifyAddress.address,
                    to: user1.address,
                    badgeId: i,
                    badgeName: badgeName,
                });
        
                await badgeContract
                    .connect(user2)
                    .mint(mintData)
                    .then((tx) => {
                        tx.wait();
                    });
            }
    
            // expect(
            //     await badgeContract.balanceOf(user2.address, mintData.tokenId),
            // ).to.be.deep.eq(0);
            // expect(
            //     await badgeContract.balanceOf(user1.address, mintData.tokenId),
            // ).to.be.deep.eq(1);
        });
    
        it("Mint 2 NFTs with the same tokenId", async function () {
            const badgeNameFromContract = await badgeContract.getBadgeNames();
            const badgeName = badgeNameFromContract[2];
            const mintData = await signData(signerPk, badgeContract, {
                adminWallet: verifyAddress.address,
                to: user1.address,
                badgeId: 100,
                badgeName: badgeName,
            });
    
            await badgeContract
                .connect(user2)
                .mint(mintData)
                .then((tx) => {
                    tx.wait();
                });
    
            const mintData2 = await signData(signerPk, badgeContract, {
                adminWallet: verifyAddress.address,
                to: user1.address,
                badgeId: 101,
                badgeName: badgeName,
            });
    
    
            await badgeContract
                .connect(user2)
                .mint(mintData2)
                .then((tx) => {
                    tx.wait();
                });
    
            // expect(
            //     await badgeContract.balanceOf(user2.address, mintData.tokenId),
            // ).to.be.deep.eq(0);
            // expect(
            //     await badgeContract.balanceOf(user1.address, mintData.tokenId),
            // ).to.be.deep.eq(3);
    
        });
    
        it("Should revert when minting 2 NFTs with 1 signature", async function () {
            const badgeNameFromContract = await badgeContract.getBadgeNames();
            const badgeName = badgeNameFromContract[1];
            const mintData = await signData(signerPk, badgeContract, {
                adminWallet: verifyAddress.address,
                to: user1.address,
                badgeId: 1,
                badgeName: badgeName,
            });

    
            await badgeContract
                .connect(user2)
                .mint(mintData)
                .then((tx) => {
                    tx.wait();
                });
    
    
            // expect(
            //     await badgeContract.balanceOf(user2.address, mintData.tokenId),
            // ).to.be.deep.eq(0);
            // expect(
            //     await badgeContract.balanceOf(user1.address, mintData.tokenId),
            // ).to.be.deep.eq(4);
    
    
            await expect(badgeContract
                .connect(user2)
                .mint(mintData)).to.revertedWithCustomError(
                    badgeContract,
                    "BadgeMinted",
                );
        });
    
        it("Should revert when minting NFTs if badgeName is not in the badgeNames", async function () {
            const badgeName = "Tesst";
            const mintData = await signData(signerPk, badgeContract, {
                adminWallet: verifyAddress.address,
                to: user1.address,
                badgeId: 5,
                badgeName: badgeName,
            });
    
            await expect(badgeContract
                .connect(user2)
                .mint(mintData)).to.revertedWithCustomError(
                    badgeContract,
                    "InvalidTokenId",
                );
        });
    })
})