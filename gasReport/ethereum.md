## Methods
| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|    **◯**   | Execution gas for this method does not include intrinsic gas overhead                    |
|    **△**   | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                                                |    Min |     Max |     Avg | Calls | usd avg |
| :------------------------------------------------------------- | -----: | ------: | ------: | ----: | ------: |
| **BadgeV1**                                                    |        |         |         |       |         |
|        *grantRole(bytes32,address)*                            |      - |       - |  56,647 |     2 | 0.40402 |
|        *mint((address,address,uint256,uint256,bytes32,bytes))* | 84,720 | 101,832 |  85,077 |   204 | 0.60679 |
|        *setBadge(string)*                                      | 82,763 |  99,851 |  94,155 |     3 | 0.67154 |
|        *setBadges(string[])*                                   |      - |       - | 199,252 |     1 | 1.42112 |
| **BadgeV2**                                                    |        |         |         |       |         |
|        *grantRole(bytes32,address)*                            |      - |       - |  56,625 |     2 | 0.40386 |
|        *mint((address,uint256,uint256,bytes32[]))*             | 91,367 |  94,806 |  93,777 |    72 | 0.66884 |
|        *setBadge(string,uint256)*                              |      - |       - |  65,813 |     1 | 0.46940 |
|        *setBadges(string[],uint256[])*                         |      - |       - | 498,007 |     1 | 3.55192 |
|        *setMerkleRoot(bytes32)*                                |      - |       - |  51,281 |     1 | 0.36575 |

## Deployments
|             | Min | Max  |       Avg | Block % |  usd avg |
| :---------- | --: | ---: | --------: | ------: | -------: |
| **BadgeV1** |   - |    - | 3,266,875 |  10.9 % | 23.30020 |
| **BadgeV2** |   - |    - | 3,049,904 |  10.2 % | 21.75271 |

## Solidity and Network Config
| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L1 Gas Price        | 3 gwei          |
| Token Price         | 2377.42 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |

