# NFT SC & Staking

## Getting started

Recommended Node version is 21.1.0.

```bash
yarn
yarn compile
yarn test
```

## Project structure

- The hardhat-based typescript project
- Hardhat-deploy lib is used for deployments
- Solidity version - `0.8.18`
- Openzeppelin version - `4.9.6`

## Tests

Tests can be found in the `./test` folder.

To run tests

```bash
yarn test
```

To run coverage

```bash
yarn coverage
```

## Deploy

Deploy scripts can be found in the `./deploy` folder.

Generate `.env` file

```bash
cp .env.example .env
```

Add the private key of the deployer account

```
PRIVATE_TEST=
```

Add API key for verifying contract on the scanner

```
BSC_API=
```

To deploy contracts on BNB Chain Testnet

1. Fill in the constructor parameters in the `./deploy/testnet/NFT.deploy.ts` file:
```typescript
export const DEFAULT_COLLECTION_NAME = 'Крипто$лоня₽ы Collection'
export const DEFAULT_COLLECTION_SYMBOL = 'KC'
export const DEFAULT_BASE_URI = 'https://ipfs.io/ipfs/' 
```

2. Run deploy script
```bash
yarn deploy --network bsc_testnet
```

3. If you want to verify the deployed contract on scanner run
```bash
yarn verify --network bsc_testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMS>
```

Admin role for NFT minting will be given to the deployer at the time of deployment automatically.

## Deployments

Deployments are stored in the `./deployments` folder.

## Tests coverage

```
  NFT & Staking tests
    ✔ Constructor + setup should work correctly (110ms)
    ✔ Constructor should revert (115ms)
    ✔ Should correctly create new NFTs (197ms)
    ✔ Should correctly burn NFTs (222ms)
    ✔ Should correctly change base URI (160ms)
    ✔ Should not allow to transfer NFT (75ms)
    ✔ Should correctly supports interface (75ms)
    ✔ Should correctly mint reward tokens through staking (120ms)

  Reward token additional tests
    ✔ Constructor + setup should work correctly (110ms)
    ✔ Constructor should revert (101ms)
    ✔ Mint from not staking should revert (78ms)

  Staking additional tests
    ✔ Constructor + setup should work correctly (89ms)
    ✔ Constructor should revert (75ms)
    ✔ Stake/Unstake from not NFT should revert (66ms)


  14 passing (2s)

------------------|----------|----------|----------|----------|----------------|
File              |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------|----------|----------|----------|----------|----------------|
 contracts/       |      100 |      100 |      100 |      100 |                |
  NFT.sol         |      100 |      100 |      100 |      100 |                |
  RewardToken.sol |      100 |      100 |      100 |      100 |                |
  Staking.sol     |      100 |      100 |      100 |      100 |                |
------------------|----------|----------|----------|----------|----------------|
All files         |      100 |      100 |      100 |      100 |                |
------------------|----------|----------|----------|----------|----------------|
```
