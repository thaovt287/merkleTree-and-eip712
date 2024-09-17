require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
const ethers = require("ethers");
const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { log } = require("console");
const { init } = require("./fixture.V1");
const { signData } = require("../scripts/claimBadge/sign");
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
            const badgeName = badgeNames[0];

            for (let i = 0; i < 100; i++) {
                const mintData = await signData(signerPk, badgeContract, {
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
            const badgeName = badgeNames[2];
            const mintData = await signData(signerPk, badgeContract, {
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
            const badgeName = badgeNames[1];
            const mintData = await signData(signerPk, badgeContract, {
                to: user1.address,
                badgeId: 1001,
                badgeName: badgeName,
            });

            await badgeContract
                .connect(user2)
                .mint(mintData)
                .then((tx) => {
                    tx.wait();
                });

            await expect(
                badgeContract.connect(user2).mint(mintData),
            ).to.revertedWithCustomError(badgeContract, "BadgeMinted");
        });
    });
});
