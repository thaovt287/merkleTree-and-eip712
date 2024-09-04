require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
const ethers = require("ethers");
const hre = require("hardhat");
const { log } = require("console");

async function init(printOutput = true) {
    const [
        contractAdmin,
        badgeSetter,
        adminAddress,
        rootSetter,
         ...addrs] =
        await hre.ethers.getSigners();

    // deploy CardProduct
    const BadgeFactory = await hre.ethers.getContractFactory("BadgeV2");
    const badgeContract = await hre.upgrades.deployProxy(BadgeFactory, [
        contractAdmin.address,
    ]);
    await badgeContract.waitForDeployment();
    const badgeProxyAddress = await badgeContract.getAddress();


    if (printOutput) {
        log("Swap contract proxy address:", badgeProxyAddress);
        log("Contract admin:", contractAdmin.address);
        log("Badge setter:", badgeSetter.address);
        log("Badge root setter:", rootSetter.address);

        log("ROOT_SETTER role:", await badgeContract.ROOT_SETTER());
        log("BADGE_SETTER role:", await badgeContract.BADGE_SETTER());
    }

    return {
        accounts: [
            contractAdmin,
            rootSetter,
            badgeSetter,
            addrs,
        ],
        badgeProxyAddress,
        badgeContract,
    };
}

module.exports = { init };
