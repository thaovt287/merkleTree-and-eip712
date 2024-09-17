const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");

const LeaveData = ["address", "uint256", "uint256"];

const genMerkleTree = (values) => {
    // (1) Create a new Merkle Tree
    const tree = StandardMerkleTree.of(values, LeaveData);

    // (2) Write the Merkle Tree to a JSON file
    // fs.writeFileSync("tree.json", JSON.stringify(tree.dump(), null, 2));

    // (3) Log the Merkle Root
    // console.log('Merkle Root:', tree.root);
    return tree;
};

const genRootMerkleTree = (values) => {
    return genMerkleTree(values).root;
};

const genProof = (values, to, tokenId) => {
    const tree = genMerkleTree(values);
    for (const [i, v] of tree.entries()) {
        if (v[0] === to && v[1] === tokenId) {
            // (3)
            const proof = tree.getProof(i);
            //   console.log('Value:', v);
            //   console.log('Proof:', proof);
            return proof;
        }
    }
};

const verifyMerkleTree = (to, tokenId, point, root, proof) => {
    return StandardMerkleTree.verify(
        root,
        LeaveData,
        [to, tokenId, point],
        proof,
    );
};

module.exports = {
    genRootMerkleTree,
    genMerkleTree,
    genProof,
    verifyMerkleTree,
};
