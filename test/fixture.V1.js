require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
const ethers = require("ethers");
const hre = require("hardhat");
const { log } = require("console");

async function init(printOutput = true) {
    const [
        contractAdmin,
        badgeSetter,
        verifyAddressSetter,
        verifyAddress, 
        ...addrs
    ] = await hre.ethers.getSigners();

    // deploy CardProduct
    const BadgeFactory = await hre.ethers.getContractFactory("BadgeV1");
    const badgeContract = await hre.upgrades.deployProxy(BadgeFactory, [
        contractAdmin.address,
        verifyAddress.address,
        "BadgeV1",
        "1",
    ]);
    await badgeContract.waitForDeployment();
    const badgeProxyAddress = await badgeContract.getAddress();


    if (printOutput) {
        log("Swap contract proxy address:", badgeProxyAddress);
        log("Contract admin:", contractAdmin.address);
        log("Verify Address:", verifyAddress.address);
        log("Badge setter:", badgeSetter.address);
        log("Verify Address setter:", verifyAddressSetter.address);

        log("BADGE_SETTER role:", await badgeContract.BADGE_SETTER());
        log("VERIFY_ADDRESS_SETTER role:", await badgeContract.VERIFY_ADDRESS_SETTER());
    }

    return {
        accounts: [
            contractAdmin,
            verifyAddress,
            badgeSetter,
            verifyAddressSetter,
            addrs,
        ],
        badgeProxyAddress,
        badgeContract,
    };
}

module.exports = { init };
