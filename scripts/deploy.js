// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const Exchange= await hre.ethers.getContractFactory("Exchange");
  const accounts = await  ethers.getSigners();

  const dapp = await Token.deploy("Dapp","Dapp","1000000");
  const mEth = await Token.deploy("mETH","mETH","1000000");
  const mDai = await Token.deploy("mDAI","mDAI","1000000");

 
  // mEth deployed to 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  // mDai deployed to 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  
  const exchange = await Exchange.deploy(accounts[1].address,10);
  // exchange deployed to 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9


}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
