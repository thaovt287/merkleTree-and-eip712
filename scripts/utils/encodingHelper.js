const ethers = require("ethers");

const stringToBytes = (str, length) => {
    // console.log("stringToBytes", str, length);
    const badgeHash = ethers.keccak256(ethers.toUtf8Bytes(str)); // 32-byte hash
    // console.log(
    //     "badgeHash",
    //     str,
    //     badgeHash,
    //     badgeHash.length,
    //     badgeHash.slice(0, (length + 1) * 2),
    // );
    return badgeHash.slice(0, (length + 1) * 2); // First length bytes in hex (length*2 hex characters + '0x')
};

const firstBytes = (str, length) => {
    // Get the first x bytes of the contract address
    const contractAddress20Bytes = str.slice(0, (length + 1) * 2); // Full length-byte address in hex is (length * 2) characters + '0x'
    return contractAddress20Bytes.slice(2); // Remove '0x' from the contract address
};

module.exports = {
    stringToBytes,
    firstBytes,
};
