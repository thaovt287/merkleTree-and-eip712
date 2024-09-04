const { ethers } = require("ethers");
const {  getDomain } = require("../helpers/eip712");

const getBadgeData = async (contract, badgeName)=>{
    const badgeNameHash = await contract.hashBadgeName(badgeName);
    const tokenId = await contract.getTokenId(badgeNameHash);
    return {
        badgeNameHash,
        tokenId
    }
}

const buildTypedData = async (contract, data) => {
    const domain = await getDomain(contract);
    const { badgeNameHash, tokenId } = await getBadgeData(contract,data.badgeName);
    return {
        types: {
            MintBadgeData: [
                {
                    name: "adminWallet",
                    type: "address",
                },
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
                {
                    name: "badgeNameHash",
                    type: "bytes32",
                },
            ],
        },
        domain,
        message: {
            adminWallet: data.adminWallet,
            to: data.to,
            badgeId: data.badgeId,
            tokenId,
            badgeNameHash,
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
    getBadgeData,
};
