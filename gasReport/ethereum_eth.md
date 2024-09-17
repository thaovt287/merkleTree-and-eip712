## Methods
| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|    **◯**   | Execution gas for this method does not include intrinsic gas overhead                    |
|    **△**   | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                                                       |    Min |    Max |     Avg | Calls | usd avg |
| :-------------------------------------------------------------------- | -----: | -----: | ------: | ----: | ------: |
| **BadgeV1**                                                           |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,559 |     1 | 0.38762 |
|        *mint((address,uint256,uint256,bytes))*                        | 81,308 | 98,444 |  81,827 |   206 | 0.56078 |
| **BadgeV2**                                                           |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,625 |     2 | 0.38807 |
|        *mint((address,uint256,uint256,bytes32[]))*                    | 91,252 | 94,667 |  93,756 |    90 | 0.64254 |
|        *setEligiblePointBadge(uint256,uint256)*                       |      - |      - |  36,478 |     1 | 0.24999 |
|        *setEligiblePointBadges(uint256[],uint256[])*                  |      - |      - | 255,709 |     1 | 1.75245 |
|        *setMerkleRoot(bytes32)*                                       |      - |      - |  51,303 |     1 | 0.35159 |
| **BadgeV22**                                                          |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,559 |     2 | 0.38762 |
|        *mintBadge((address,uint256,uint256))*                         |      - |      - |  73,877 |     2 | 0.50630 |
|        *mintPoint((address,uint256,uint256,bytes))*                   |      - |      - |  76,404 |     2 | 0.52362 |
|        *setEligiblePointBadge(uint256,uint256)*                       | 36,457 | 53,557 |  47,857 |     3 | 0.32798 |
|        *setEligiblePointBadges(uint256[],uint256[])*                  |      - |      - | 255,498 |     1 | 1.75100 |
| **ERC6551Registry**                                                   |        |        |         |       |         |
|        *createAccount(address,uint256,address,uint256,uint256,bytes)* |      - |      - |  96,669 |     2 | 0.66250 |
| **MyERC721Token**                                                     |        |        |         |       |         |
|        *safeMint(address)*                                            |      - |      - | 101,070 |     1 | 0.69266 |

## Deployments
|                     | Min | Max  |       Avg | Block % |  usd avg |
| :------------------ | --: | ---: | --------: | ------: | -------: |
| **BadgeV1**         |   - |    - | 2,856,590 |   9.5 % | 19.57704 |
| **BadgeV2**         |   - |    - | 2,618,583 |   8.7 % | 17.94591 |
| **BadgeV22**        |   - |    - | 3,079,340 |  10.3 % | 21.10361 |
| **ERC6551Account**  |   - |    - |   641,463 |   2.1 % |  4.39613 |
| **ERC6551Registry** |   - |    - |   327,080 |   1.1 % |  2.24157 |
| **MyERC721Token**   |   - |    - | 1,406,121 |   4.7 % |  9.63655 |

## Solidity and Network Config
| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L1 Gas Price        | 3 gwei          |
| Token Price         | 2284.43 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |

