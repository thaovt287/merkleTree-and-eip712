## Methods
| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|    **◯**   | Execution gas for this method does not include intrinsic gas overhead                    |
|    **△**   | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                                                       |    Min |    Max |     Avg | Calls | usd avg |
| :-------------------------------------------------------------------- | -----: | -----: | ------: | ----: | ------: |
| **BadgeV1**                                                           |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,559 |     1 | 0.01292 |
|        *mint((address,uint256,uint256,bytes))*                        | 81,308 | 98,444 |  81,827 |   206 | 0.01869 |
| **BadgeV2**                                                           |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,625 |     2 | 0.01293 |
|        *mint((address,uint256,uint256,bytes32[]))*                    | 91,252 | 94,643 |  93,760 |    90 | 0.02142 |
|        *setEligiblePointBadge(uint256,uint256)*                       |      - |      - |  36,478 |     1 | 0.00833 |
|        *setEligiblePointBadges(uint256[],uint256[])*                  |      - |      - | 255,709 |     1 | 0.05841 |
|        *setMerkleRoot(bytes32)*                                       |      - |      - |  51,315 |     1 | 0.01172 |
| **BadgeV22**                                                          |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,559 |     2 | 0.01292 |
|        *mintBadge((address,uint256,uint256))*                         |      - |      - |  73,877 |     2 | 0.01687 |
|        *mintPoint((address,uint256,uint256,bytes))*                   |      - |      - |  76,404 |     2 | 0.01745 |
|        *setEligiblePointBadge(uint256,uint256)*                       | 36,457 | 53,557 |  47,857 |     3 | 0.01093 |
|        *setEligiblePointBadges(uint256[],uint256[])*                  |      - |      - | 255,498 |     1 | 0.05836 |
| **ERC6551Registry**                                                   |        |        |         |       |         |
|        *createAccount(address,uint256,address,uint256,uint256,bytes)* |      - |      - |  96,669 |     2 | 0.02208 |
| **MyERC721Token**                                                     |        |        |         |       |         |
|        *safeMint(address)*                                            |      - |      - | 101,070 |     1 | 0.02309 |

## Deployments
|                     | Min | Max  |       Avg | Block % | usd avg |
| :------------------ | --: | ---: | --------: | ------: | ------: |
| **BadgeV1**         |   - |    - | 2,856,590 |   9.5 % | 0.65249 |
| **BadgeV2**         |   - |    - | 2,618,583 |   8.7 % | 0.59812 |
| **BadgeV22**        |   - |    - | 3,079,340 |  10.3 % | 0.70336 |
| **ERC6551Account**  |   - |    - |   641,463 |   2.1 % | 0.14652 |
| **ERC6551Registry** |   - |    - |   327,080 |   1.1 % | 0.07471 |
| **MyERC721Token**   |   - |    - | 1,406,121 |   4.7 % | 0.32118 |

## Solidity and Network Config
| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L2 Gas Price        | 0.10000 gwei    |
| Token Price         | 2284.14 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |

