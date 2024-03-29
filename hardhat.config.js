require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.17",
//   networks:{
//     localhost:{}
//   }
// };

// require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || ""
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts",
  async (taskArgs, hre) => {
    const accounts = await hre.ethers.getsigners();
    for (const account of accounts) {
      console.Log(account.address);
    }
  });
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
@type import('hardhat/config'). HardhatUserConfig
*/
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {},
    goerli: {
      url:
        `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: privateKeys.split(",")
    }
  },
};

