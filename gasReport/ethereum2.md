## Methods

| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|   **◯**    | Execution gas for this method does not include intrinsic gas overhead                    |
|   **△**    | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                                                |     Min |     Max |     Avg | Calls | usd avg |
| :------------------------------------------------------------- | ------: | ------: | ------: | ----: | ------: |
| **BadgeV1**                                                    |         |         |         |       |         |
|        *grantRole(bytes32,address)*                            |       - |       - |  56,559 |     2 | 0.38767 |
|        *mint((address,address,uint256,uint256,bytes32,bytes))* |  84,742 | 101,854 |  85,099 |   204 | 0.58328 |
|        *setEligiblePointBadge(string)*                         |  82,818 |  99,906 |  94,210 |     3 | 0.64573 |
|        *setEligiblePointBadges(string[])*                      | 122,485 | 199,285 | 160,885 |     2 | 1.10274 |
|        *setEligiblePointBadges2(string[])*                     |  83,557 | 122,486 | 109,510 |     3 | 0.75060 |
| **BadgeV2**                                                    |         |         |         |       |         |
|        *grantRole(bytes32,address)*                            |       - |       - |  56,625 |     2 | 0.38812 |
|        *mint((address,uint256,uint256,bytes32[]))*             |  91,379 |  94,782 |  93,492 |    48 | 0.64081 |
|        *setEligiblePointBadge(string,uint256)*                 |       - |       - |  65,813 |     1 | 0.45109 |
|        *setEligiblePointBadges(string[],uint256[])*            |       - |       - | 498,007 |     1 | 3.41343 |
|        *setMerkleRoot(bytes32)*                                |       - |       - |  51,293 |     1 | 0.35157 |

## Deployments

|             | Min | Max |       Avg | Block % |  usd avg |
| :---------- | --: | --: | --------: | ------: | -------: |
| **BadgeV1** |   - |   - | 3,424,282 |  11.4 % | 23.47068 |
| **BadgeV2** |   - |   - | 3,049,904 |  10.2 % | 20.90462 |

## Solidity and Network Config

| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L1 Gas Price        | 3 gwei          |
| Token Price         | 2284.73 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |
