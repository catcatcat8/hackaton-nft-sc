import { HardhatUserConfig } from 'hardhat/config'

import 'hardhat-deploy'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-etherscan'
import '@typechain/hardhat'

import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      tags: ['localhost'],
      deploy: ['deploy/localhost/'],
    },
    bsc_testnet: {
      tags: ['testnet'],
      deploy: ['deploy/testnet/'],
      url: 'https://bsc-testnet-rpc.publicnode.com',
      accounts: process.env.PRIVATE_TEST?.split(',') ?? [],
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSC_API!,
    },
  },
}
export default config
