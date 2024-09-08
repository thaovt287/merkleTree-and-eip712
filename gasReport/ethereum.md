## Methods
| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|    **◯**   | Execution gas for this method does not include intrinsic gas overhead                    |
|    **△**   | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                                            |    Min |     Max |     Avg | Calls | usd avg |
| :--------------------------------------------------------- | -----: | ------: | ------: | ----: | ------: |
| **BadgeV1**                                                |        |         |         |       |         |
|        *grantRole(bytes32,address)*                        |      - |       - |  56,559 |     2 | 0.39090 |
|        *mint((address,uint256,uint256,bytes32,bytes))*     | 83,827 | 100,987 |  84,358 |   206 | 0.58302 |
|        *setBadge(string)*                                  | 89,273 | 105,857 | 100,329 |     3 | 0.69340 |
|        *setBadges(string[])*                               |      - |       - | 214,690 |     1 | 1.48379 |
| **BadgeV2**                                                |        |         |         |       |         |
|        *grantRole(bytes32,address)*                        |      - |       - |  56,625 |     2 | 0.39135 |
|        *mint((address,uint256,uint256,bytes32[]))*         | 91,391 |  94,782 |  93,732 |    72 | 0.64781 |
|        *setBadge(string,uint256)*                          |      - |       - |  65,813 |     1 | 0.45485 |
|        *setBadges(string[],uint256[])*                     |      - |       - | 498,007 |     1 | 3.44188 |
|        *setMerkleRoot(bytes32)*                            |      - |       - |  51,293 |     1 | 0.35450 |
| **BadgeV22**                                               |        |         |         |       |         |
|        *grantRole(bytes32,address)*                        |      - |       - |  56,647 |     2 | 0.39150 |
|        *mintBadge((address,string))*                       |      - |       - |  86,035 |     2 | 0.59461 |
|        *mintPoint((address,uint256,string,uint256,bytes))* |      - |       - |  81,196 |     2 | 0.56117 |
|        *setBadge(string,uint256)*                          | 66,982 | 103,970 |  91,641 |     3 | 0.63336 |
|        *setBadges(string[],uint256[])*                     |      - |       - | 487,688 |     1 | 3.37056 |

## Deployments
|              | Min | Max  |       Avg | Block % |  usd avg |
| :----------- | --: | ---: | --------: | ------: | -------: |
| **BadgeV1**  |   - |    - | 3,315,016 |  11.1 % | 22.91110 |
| **BadgeV2**  |   - |    - | 2,996,724 |    10 % | 20.71129 |
| **BadgeV22** |   - |    - | 3,549,485 |  11.8 % | 24.53159 |

## Solidity and Network Config
| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L1 Gas Price        | 3 gwei          |
| Token Price         | 2303.77 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |

