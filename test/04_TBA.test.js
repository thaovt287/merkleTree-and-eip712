require("dotenv").config();
const hre = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("TBA contract", () => {
    async function deployContracts() {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const ERC6551RegistryContact =
            await hre.ethers.deployContract("ERC6551Registry");
        const ERC6551AccountContact =
            await hre.ethers.deployContract("ERC6551Account");

        const myERC721TokenFactory =
            await hre.ethers.getContractFactory("MyERC721Token");
        const myERC721TokenContact = await hre.upgrades.deployProxy(
            myERC721TokenFactory,
            [owner.address],
        );
        const ERC6551AccountContactAddress =
            await ERC6551AccountContact.getAddress();

        // Fixtures can return anything you consider useful for your tests
        return {
            myERC721TokenContact,
            ERC6551RegistryContact,
            ERC6551AccountContact,
            ERC6551AccountContactAddress,
            myERC721TokenContactAddess: myERC721TokenContact.target,
            owner,
            addr1,
            addr2,
        };
    }

    it("Should create a Token Bound Account", async function () {
        const {
            myERC721TokenContact,
            ERC6551RegistryContact,
            ERC6551AccountContact,
            myERC721TokenContactAddess,
            ERC6551AccountContactAddress,
            owner,
            addr1,
            addr2,
        } = await loadFixture(deployContracts);
        await myERC721TokenContact.safeMint(addr1);

        const erc721OwnerBalance = await myERC721TokenContact.balanceOf(
            addr1.address,
        );
        expect(erc721OwnerBalance).to.equal(1);
        const chainId = await hre.network.provider.send("eth_chainId");
        const tokenId = 0;
        const salt = 0;
        const initData = "0x";

        const transaction = await ERC6551RegistryContact.createAccount(
            ERC6551AccountContactAddress,
            chainId,
            myERC721TokenContactAddess,
            tokenId,
            salt,
            initData,
        );
        await transaction.wait();
        // console.log("Transaction: ", transaction);
        const tokenBoundAccount = await ERC6551RegistryContact.account(
            ERC6551AccountContactAddress,
            chainId,
            myERC721TokenContactAddess,
            tokenId,
            salt,
        );
        console.log("Token Bound Account: ", tokenBoundAccount);
    });
});
