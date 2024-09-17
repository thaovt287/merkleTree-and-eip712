const { ethers } = require("ethers");
const { getDomain } = require("../helpers/eip712");
const { stringToBytes, firstBytes } = require("../utils/encodingHelper");

const genPointId = (contractAddress, badgeName) => {
    const badgeHash10Bytes = stringToBytes(badgeName, 10);
    const pointId2bytes = stringToBytes("Point", 2).slice(2);

    //Concatenate the 12-byte name hash and the 20-byte contract address
    const tokenIdHex =
        badgeHash10Bytes + pointId2bytes + firstBytes(contractAddress, 20);
    // console.log(
    //     "tokenIdHex",
    //     badgeName,
    //     badgeHash10Bytes,
    //     badgeHash10Bytes.length,
    //     pointId2bytes,
    //     pointId2bytes.length,
    //     firstBytes(contractAddress, 20).length,
    // );
    // console.log("tokenIdHex", tokenIdHex, tokenIdHex.length);
    // Convert to a BigNumber
    return BigInt(tokenIdHex);
};

const genBadgeId = (contractAddress, badgeName) => {
    const badgeHash10Bytes = stringToBytes(badgeName, 10);
    const pointId2bytes = stringToBytes("Badge", 2).slice(2);

    //Concatenate the 12-byte name hash and the 20-byte contract address
    const tokenIdHex =
        badgeHash10Bytes + pointId2bytes + firstBytes(contractAddress, 20);
    // console.log(
    //     "tokenIdHex",
    //     badgeHash10Bytes.length,
    //     pointId2bytes.length,
    //     pointId2bytes,
    //     firstBytes(contractAddress, 20).length,
    // );
    // console.log("tokenIdHex", tokenIdHex, tokenIdHex.length);
    // Convert to a BigNumber
    return BigInt(tokenIdHex);
};

const buildTypedData = async (contract, data) => {
    const domain = await getDomain(contract);
    const tokenId = genPointId(contract.target, data.badgeName);
    return {
        types: {
            MintPointData: [
                {
                    name: "to",
                    type: "address",
                },
                {
                    name: "pointId",
                    type: "uint256",
                },
                {
                    name: "amount",
                    type: "uint256",
                },
            ],
        },
        domain,
        message: {
            to: data.to,
            pointId: tokenId,
            amount: data.point,
        },
    };
};
async function _signData(signer, data) {
    // If signer is a private key, use it to sign
    let signature;
    // console.log("signing", data);
    if (typeof signer === "string") {
        const signerWallet = new ethers.Wallet(signer);
        // console.log("signer", data);
        signature = await signerWallet.signTypedData(
            data.domain,
            data.types,
            data.message,
        );
    } else {
        // console.log("data", data);
        const [method, argData] = [
            "eth_signTypedData_v4",
            JSON.stringify(data),
        ];

        // console.log("signer", signer);
        const from = await signer.address;
        // console.log("argData", argData, [from, argData]);
        signature = await signer.provider.send(method, [from, argData]);
    }

    return signature;
}

const signData = async (signer, badgeContact, data) => {
    const dataSign = await buildTypedData(badgeContact, data);
    const signatureResultEthers = await _signData(signer, dataSign);
    return {
        ...dataSign.message,
        signature: signatureResultEthers,
    };
};

module.exports = {
    signData,
    genPointId,
    genBadgeId,
};
