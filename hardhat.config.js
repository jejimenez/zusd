require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('dotenv').config()

/**
 @type import('hardhat/config').HardhatUserConfig
**/

module.exports = {
  etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
    }
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        enabled: true,
        url: process.env.RINKEBY_RPC_URL
      }
    },
    localhost: {},
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true
    }
  },
  solidity: '0.8.13'
}
