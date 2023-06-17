const { ethers } = require("hardhat");
 
// lsof -i :8545 used to find the pid 
// kill -9 31649(pid) used to kill the node
const interact=async ()=>{

    const tokeninstance = await ethers.getContractAt("Token","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"); // after deployment  i.e instance is created 
    const instanceforDeployement = await ethers.getContractFactory("Token");   // before deployement 
    // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    // console.log(token.address);
    const signers = await ethers.getSigners();
    const  name = await tokeninstance.name();
    const transaction = await tokeninstance.connect(signers[1]).transfer(signers[1].address,100);
    const result = await transaction;
    console.log(transaction);
    console.log(result);
    // console.log(signers[1].address);
    // console.log(name);
    // console.log(await tokeninstance.totalSupply().value());
}
interact();