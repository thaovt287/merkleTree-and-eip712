require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
// require("@nomicfoundation/hardhat-foundry");
require("@nomicfoundation/hardhat-verify");
require("@nomiclabs/hardhat-solhint");
require("@openzeppelin/hardhat-upgrades");

require("solidity-coverage");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("hardhat-extended-tasks");
const { Constants, CoinBase, log } = require("./scripts/utils");
const { OZResolver } = require("hardhat-gas-reporter/dist/lib/resolvers/oz");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        log(account.address);
    }
});

task("balance", "Prints an account's balance")
    .addParam("account", "The account's address")
    .setAction(async (taskArgs, hre) => {
        const balance = await ethers.provider.getBalance(taskArgs.account);

        log(ethers.utils.formatEther(balance), await CoinBase());
    });
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            accounts: {
                count: 100,
            },
        },
        local: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            accounts: [Constants.DEPLOYER_PK],
        },
        sepolia: {
            url: process.env.RPC_PROVIDER_DEV,
            chainId: 11155111,
            // gasPrice: GAS_PRICE * GAS_UNIT * 2,
            accounts: [Constants.DEPLOYER_PK],
            from: Constants.DEPLOYER_ADDR,
        },
        polygonAmoy: {
            url: process.env.OKLINK_PROVIDER_DEV,
            chainId: 80002,
            accounts: [Constants.DEPLOYER_PK],
            from: Constants.DEPLOYER_ADDR,
        },
        mainnet: {
            url: process.env.RPC_PROVIDER_PROD,
            chainId: 1,
            accounts: [Constants.DEPLOYER_PK],
            from: Constants.DEPLOYER_ADDR,
        },
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            sepolia: process.env.ETHERSCAN_API_KEY,
            polygon: process.env.POLYGONSCAN_API_KEY,
            polygonAmoy: process.env.OKLINK_API_KEY,
        },
        customChains: [
            {
                network: "polygonAmoy",
                chainId: 80002,
                urls: {
                    apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code",
                    browserURL: "https://www.oklink.com/polygonAmoy",
                },
            },
        ],
    },
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    mocha: {
        timeout: 600000,
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: true,
        runOnCompile: false,
        strict: true,
    },
    gasReporter: {
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        enabled: process.env.REPORT_GAS ? true : false,
        L1: "ethereum",
        L1Etherscan: `&apiKey=${process.env.ETHERSCAN_API_KEY}`,
        gasPrice: 3,
        currencyDisplayPrecision: 5,
        includeIntrinsicGas: true,
        proxyResolver: new OZResolver(),
        showTimeSpent: true,
        showMethodSig: true,
        token: "ETH",
        reportFormat: "markdown",
        outputFile: "./gasReport/ethereum.md",
        forceTerminalOutput: true,
        forceTerminalOutputFormat: "terminal",
    },
    sourcify: {
        enabled: false,
    },
};
