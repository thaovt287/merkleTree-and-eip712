const hre = require("hardhat");

async function advanceBlockToTimestamp(timestamp) {
    await hre.ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
    await hre.ethers.provider.send("evm_mine");
}

async function getBlockTimestamp(receipt) {
    const block = await hre.ethers.provider.getBlock(receipt.blockNumber);

    return block.timestamp;
}

async function getLastestBlockTimestamp() {
    const block = await hre.ethers.provider.getBlock("latest");
    return block.timestamp;
}

module.exports = {
    BlockHelper: {
        advanceBlockToTimestamp,
        getBlockTimestamp,
        getLastestBlockTimestamp,
    },
};
