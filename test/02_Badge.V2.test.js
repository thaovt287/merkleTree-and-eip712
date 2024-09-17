require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
const ethers = require("ethers");
const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { log } = require("console");
const { init } = require("./fixture.V2");
const pointDemoes = require("./pointDemoes.json");
const { genTokenId } = require("../scripts/claimBadge/sign");
const {
    genRootMerkleTree,
    genProof,
    verifyMerkleTree,
} = require("../scripts/claimBadge/merkleTree");

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
    let pointDatas = [];
    let tokenIds = {};
    let mintDatas;
    let merkleRoot;

    async function deployContracts() {
        const { accounts, badgeProxyAddress, badgeContract } = await init();

        [contractAdmin, rootSetter, badgeSetter, ...addrs] = accounts;

        return {
            badgeProxyAddress,
            badgeContract,
            contractAdmin,
            badgeSetter,
            rootSetter,
            addrs,
        };
    }

    async function deployAndSetup() {
        const {
            badgeProxyAddress,
            badgeContract,
            contractAdmin,
            badgeSetter,
            rootSetter,
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
            badgeIds.push(genTokenId(badgeProxyAddress, badgeNames[index]));
        }
        await badgeContract
            .connect(badgeSetter)
            .setEligiblePointBadges(badgeIds, eligiblePoins);

        await badgeContract
            .connect(badgeSetter)
            .setEligiblePointBadge(
                genTokenId(badgeContract.target, "Connoisseur"),
                20,
            );

        // grant ROOT_SETTER role to rootSetter
        await badgeContract.grantRole(
            await badgeContract.ROOT_SETTER(),
            rootSetter.address,
        );
        // console.log(tokenIds)
        mintDatas = pointDemoes.map((data) => {
            const tokenId = genTokenId(badgeContract.target, data.badgeName);
            pointDatas.push([data.to, tokenId, data.point]);
            return {
                to: data.to,
                tokenId: tokenId,
                point: data.point,
            };
        });
        // console.log("pointDatas", pointDatas);
        merkleRoot = genRootMerkleTree(pointDatas);
        await badgeContract.connect(rootSetter).setMerkleRoot(merkleRoot);

        const user1 = addrs[0][0];
        const user2 = addrs[0][1];
        const user3 = addrs[0][2];

        return {
            badgeProxyAddress,
            badgeContract,
            contractAdmin,
            badgeSetter,
            rootSetter,
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
                rootSetter: _rootSetter,
            } = await loadFixture(deployContracts);

            badgeContract = _badgeContract;
            badgeProxyAddress = _badgeProxyAddress;
            contractAdmin = _contractAdmin;
            badgeSetter = _badgeSetter;
            rootSetter = _rootSetter;
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

        it("The deployer should not have the ROOT_SETTER role", async () => {
            expect(
                await badgeContract.hasRole(
                    await badgeContract.ROOT_SETTER(),
                    contractAdmin.address,
                ),
            ).to.be.false;
        });
    });

    describe("Mint NFT", () => {
        let user1, user2, user3;

        before(async () => {
            const {
                badgeProxyAddress: _badgeProxyAddress,
                badgeContract: _badgeContract,
                contractAdmin: _contractAdmin,
                badgeSetter: _badgeSetter,
                rootSetter: _rootSetter,
                user1: _user1,
                user2: _user2,
                user3: _user3,
            } = await loadFixture(deployAndSetup);

            badgeContract = _badgeContract;
            badgeProxyAddress = _badgeProxyAddress;
            contractAdmin = _contractAdmin;
            badgeSetter = _badgeSetter;
            rootSetter = _rootSetter;
            user1 = _user1;
            user2 = _user2;
            user3 = _user3;
        });

        it("mint a NFT", async function () {
            // console.log("tokenIds");
            const badgeName = badgeNames[0];
            const mintData = mintDatas[0];
            delete mintData.badgeName;
            mintData.merkleProof = genProof(
                pointDatas,
                mintData.to,
                mintData.tokenId,
            );
            await badgeContract
                .connect(user2)
                .mint(mintData)
                .then((tx) => {
                    tx.wait();
                });
        });

        it("Mint NFTs with the same tokenId", async function () {
            // console.log("pointDatas", pointDatas);
            for (let i = 1; i < mintDatas.length; i++) {
                const mintData = mintDatas[i];
                delete mintData.badgeName;
                mintData.merkleProof = genProof(
                    pointDatas,
                    mintData.to,
                    mintData.tokenId,
                );

                // console.log(
                //     "verifyMerkleTree",
                //     pointDatas.length,
                //     i,
                //     verifyMerkleTree(
                //         mintData.to,
                //         mintData.tokenId,
                //         mintData.point,
                //         merkleRoot,
                //         mintData.merkleProof,
                //     ),
                // );
                await badgeContract
                    .connect(user2)
                    .mint(mintData)
                    .then((tx) => {
                        tx.wait();
                    });
            }
        });
    });
});
