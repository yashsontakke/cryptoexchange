const { expect } = require("chai");
const { ethers } = require("hardhat");
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
describe("Token", () => {
  let token, signers, deployer, receiver, exchange;

  beforeEach(async () => {        // beforeEach is a hook 
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("DappToken", "Dapp"); //instance creation 
    signers = await ethers.getSigners();
    deployer = await signers[0];
    receiver = await signers[1];
    exchange = await signers[2];     // now we dont have exchange contract so temperory 
    // console.log(await signers[0].getBalance());  balance reducing on every deployment 
  })
  // describe('hooks', function () {   these are 4 hooks 
  //   before(function () {
  //     // runs once before the first test in this block
  //   });

  //   after(function () {
  //     // runs once after the last test in this block
  //   });

  //   beforeEach(function () {
  //     // runs before each test in this block
  //   });

  //   afterEach(function () {
  //     // runs after each test in this block
  //   });

  //   // test cases
  // });
  describe('deployment', () => {
    const name = 'DappToken';
    const symbol = 'Dapp';
    const decimal = 18;
    const totalSupply = tokens(1000000);
    it("has correct name", async () => {
      expect(await token.name()).to.equal(name);
    })
    it("has correct symbol", async () => {
      expect(await token.symbol()).to.equal(symbol);
    })
    it("has correct decimal", async () => {
      expect(await token.decimal()).to.equal(decimal);
    })
    it("has correct totalSupply", async () => {
      expect(await token.totalSupply()).to.equal(totalSupply);
    })
    it("has correct deployer balance", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    })
  })
  describe('SendingTokens', () => {
    let transaction, amount, result;

    describe('success', () => {
      beforeEach(async () => {
        amount = tokens(100);
        transaction = await token.connect(deployer).transfer(receiver.address, amount);
        result = await transaction.wait();
      })

      it("transfer Token Balance", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      })
      it("emit transfer event", async () => {
        const event = result.events[0];
        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.amount).to.equal(amount);
      })
    })

    describe("failure", async () => {
      // reverted comes from waffle library
      it("reject insufficient balance", async () => {
        await expect(token.connect(deployer).transfer(receiver.address, tokens(10000000))).to.be.reverted;
      })
      it("reject invalid receipent", async () => {
        // got this burn address from bnbscan
        await expect(token.connect(deployer).transfer("0x0000000000000000000000000000000000000000", tokens(1000000))).to.be.reverted;
      })

    })
  })
  describe('allowing tokens to spend', () => {
    let amount, transaction, result;
    beforeEach(async () => {
      amount = tokens(10);
      transaction = await token.connect(deployer).allow(exchange.address, amount);
      result = await transaction.wait();
    })

    describe('success', () => {
      it('allows tokens to spend', async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount);
      })
      it("emitting approval event", () => {
        const event = result.events[0];
        const eventname = event.event;
        const args = event.args;
        expect(eventname).to.equal("Approval");
        expect(args.owner).to.equal(deployer.address);
        expect(args.spender).to.equal(exchange.address);
        expect(args.amount).to.equal(amount);
      })
    })
    describe("Failure", () => {
      it("reject invalid spender", async () => {
        // got this burn address from bnbscan that address didnt work here 
        await expect(token.connect(deployer).allow("0x0000000000000000000000000000000000000000", tokens(1000000))).to.be.reverted;
      })
    })
  })
  describe("delegated token Transfer" ,()=>{
    let amount , transaction , result ;
    beforeEach(async ()=>{
      amount = tokens(100);
      transaction = await token.connect(deployer).allow(exchange.address, amount);
      result = await transaction.wait();
    })
    describe("success", async ()=>{
      beforeEach(async ()=>{
        transaction = await token.connect(exchange).transferFrom(deployer.address,receiver.address, amount);
        result = await transaction.wait();
      })
      it("transfer Token Balance",async ()=>{
         expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
         expect(await token.balanceOf(receiver.address)).to.equal(amount);
      })

      it("resets the allowance" ,async ()=>{
        expect(await token.allowance(deployer.address,exchange.address)).to.equal(0);
      })
      it("emitting a transfer event", () => {
        const event = result.events[0];
        const eventname = event.event;
        const args = event.args;
        expect(eventname).to.equal("Transfer");
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.amount).to.equal(amount);
      })
    })
    describe("failure" , ()=>{
      it("transfering invalid amount ",async()=>{
        await expect(token.connect(exchange).transferFrom(deployer.address,receiver.address, tokens(10000000))).to.be.reverted;
      })
    })
  })

})
