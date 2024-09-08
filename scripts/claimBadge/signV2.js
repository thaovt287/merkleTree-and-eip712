const { ethers } = require("ethers");
const { getDomain } = require("../helpers/eip712");

const buildTypedData = async (contract, data) => {
    const domain = await getDomain(contract);
    const tokenId = await contract.getPointId(data.badgeName);
    return {
        types: {
            MintPointData: [
                {
                    name: "to",
                    type: "address",
                },
                {
                    name: "tokenId",
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
            tokenId: tokenId,
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
        console.log("signer", data);
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
    // console.log("signatureResultEthers", {
    //     to: data.to,
    //     tokenId: dataSign.message.tokenId,
    //     amount: dataSign.message.amount,
    //     badgeType: data.badgeType,
    //     badgeName: data.badgeName,
    //     signature: signatureResultEthers,
    // });
    return {
        to: data.to,
        tokenId: dataSign.message.tokenId,
        badgeName: data.badgeName,
        badgeType: data.badgeType,
        amount: dataSign.message.amount,
        signature: signatureResultEthers,
    };
};

module.exports = {
    signData,
};
