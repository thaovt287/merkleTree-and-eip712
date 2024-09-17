const { ethers } = require("ethers");
const { getDomain } = require("../helpers/eip712");
const { stringToBytes, firstBytes } = require("../utils/encodingHelper");

const genTokenId = (contractAddress, badgeName) => {
    const badgeHash12Bytes = stringToBytes(badgeName, 12);

    //Concatenate the 12-byte name hash and the 20-byte contract address
    const tokenIdHex = badgeHash12Bytes + firstBytes(contractAddress, 20);
    // console.log("genTokenId", tokenIdHex, tokenIdHex.length);
    // Convert to a BigNumber
    return BigInt(tokenIdHex);
};

const buildTypedData = async (contract, data) => {
    const domain = await getDomain(contract);
    const tokenId = genTokenId(contract.target, data.badgeName);

    return {
        types: {
            MintBadgeData: [
                {
                    name: "to",
                    type: "address",
                },
                {
                    name: "badgeId",
                    type: "uint256",
                },
                {
                    name: "tokenId",
                    type: "uint256",
                },
            ],
        },
        domain,
        message: {
            to: data.to,
            badgeId: data.badgeId,
            tokenId,
        },
    };
};
async function _signData(signer, data) {
    // If signer is a private key, use it to sign
    let signature;
    // console.log("signing", data);
    if (typeof signer === "string") {
        const signerWallet = new ethers.Wallet(signer);
        // console.log("signer", data.message);
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
    genTokenId,
};
