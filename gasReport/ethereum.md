## Methods
| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|    **◯**   | Execution gas for this method does not include intrinsic gas overhead                    |
|    **△**   | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                                                       |    Min |    Max |     Avg | Calls | usd avg |
| :-------------------------------------------------------------------- | -----: | -----: | ------: | ----: | ------: |
| **BadgeV1**                                                           |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,559 |     1 | 0.00013 |
|        *mint((address,uint256,uint256,bytes))*                        | 81,308 | 98,444 |  81,827 |   206 | 0.00019 |
| **BadgeV2**                                                           |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,625 |     2 | 0.00013 |
|        *mint((address,uint256,uint256,bytes32[]))*                    | 91,276 | 94,655 |  93,749 |    90 | 0.00021 |
|        *setEligiblePointBadge(uint256,uint256)*                       |      - |      - |  36,478 |     1 | 0.00008 |
|        *setEligiblePointBadges(uint256[],uint256[])*                  |      - |      - | 255,709 |     1 | 0.00058 |
|        *setMerkleRoot(bytes32)*                                       |      - |      - |  51,315 |     1 | 0.00012 |
| **BadgeV22**                                                          |        |        |         |       |         |
|        *grantRole(bytes32,address)*                                   |      - |      - |  56,559 |     2 | 0.00013 |
|        *mintBadge((address,uint256,uint256))*                         |      - |      - |  73,877 |     2 | 0.00017 |
|        *mintPoint((address,uint256,uint256,bytes))*                   |      - |      - |  76,404 |     2 | 0.00017 |
|        *setEligiblePointBadge(uint256,uint256)*                       | 36,457 | 53,557 |  47,857 |     3 | 0.00011 |
|        *setEligiblePointBadges(uint256[],uint256[])*                  |      - |      - | 255,498 |     1 | 0.00058 |
| **ERC6551Registry**                                                   |        |        |         |       |         |
|        *createAccount(address,uint256,address,uint256,uint256,bytes)* |      - |      - |  96,669 |     2 | 0.00022 |
| **MyERC721Token**                                                     |        |        |         |       |         |
|        *safeMint(address)*                                            |      - |      - | 101,070 |     1 | 0.00023 |

## Deployments
|                     | Min | Max  |       Avg | Block % | usd avg |
| :------------------ | --: | ---: | --------: | ------: | ------: |
| **BadgeV1**         |   - |    - | 2,856,590 |   9.5 % | 0.00652 |
| **BadgeV2**         |   - |    - | 2,618,583 |   8.7 % | 0.00598 |
| **BadgeV22**        |   - |    - | 3,079,340 |  10.3 % | 0.00703 |
| **ERC6551Account**  |   - |    - |   641,463 |   2.1 % | 0.00146 |
| **ERC6551Registry** |   - |    - |   327,080 |   1.1 % | 0.00075 |
| **MyERC721Token**   |   - |    - | 1,406,121 |   4.7 % | 0.00321 |

## Solidity and Network Config
| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L1 Gas Price        | 0.00100 gwei    |
| Token Price         | 2283.32 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |

