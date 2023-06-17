const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
describe("Exchange", () => {
    let feeAccount, exchange, token;
    const feePercentage = 10;

    beforeEach(async () => {        // beforeEach is a hook 
        const Exchange = await ethers.getContractFactory("Exchange");
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("DappToken", "Dapp");
        signers = await ethers.getSigners();
        feeAccount = await signers[3];
        deployer = await signers[0];
        exchange = await Exchange.deploy(feeAccount.address, feePercentage); //instance creation 
        // now we dont have exchange contract so temperory 
        // console.log(await signers[0].getBalance());  balance reducing on every deployment 
    })

    describe('deployment', () => {
        it("has correct fee Account", async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        })
        it("tracks the fee percentage", async () => {
            expect(await exchange.feePercentage()).to.equal(feePercentage);
        })
    })
    describe("deposit", () => {
        let amount = tokens(10);
        let user;
        describe("success", async () => {
            beforeEach(async () => {
                user = await signers[4];
                transaction = await token.connect(deployer).transfer(user.address, amount);
                result = await transaction.wait();
                transaction = await token.connect(user).allow(exchange.address, amount);
                result = await transaction.wait();
                transaction = await exchange.connect(user).depositTokens(token.address, amount);
                result = await transaction.wait();
            })
            it("tracks the token deposit", async () => {
                expect(await token.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.tokens(token.address, user.address)).to.equal(amount);
                expect(await exchange.checkBalances(token.address, user.address)).to.equal(amount);
            })
            it('tracks the event ', async () => {
                const args = await result.events[2].args;
                expect(args.amount).to.equal(amount);
                expect(args.token).to.equal(token.address);
                expect(args.user).to.equal(user.address);
                expect(args.balances).to.equal(amount);
            })
        })
        describe("failure", async () => {
            it("fails when no tokens are approved", async () => {
                await expect(exchange.connect(user).depositTokens(token.address, amount)).to.be.reverted;
            })
        })
    })
    describe("withdraw", () => {
        let amount = tokens(10);
        let user;
        describe('success', () => {
            beforeEach(async () => {
                user = await signers[4];
                transaction = await token.connect(deployer).transfer(user.address, amount);
                result = await transaction.wait();
                transaction = await token.connect(user).allow(exchange.address, amount);
                result = await transaction.wait();
                transaction = await exchange.connect(user).depositTokens(token.address, amount);
                result = await transaction.wait();
                transaction = await exchange.connect(user).withdrawTokens(token.address, amount);
                result = await transaction.wait();
            })
            it('withdraw funds ', async () => {
                expect(await token.balanceOf(exchange.address)).to.equal(tokens(0));
                expect(await exchange.tokens(token.address, user.address)).to.equal(tokens(0));
                expect(await exchange.checkBalances(token.address, user.address)).to.equal(tokens(0));

            })
            it('tracks the withdraw event ', async () => {
                const args = await result.events[1].args;
                expect(args.amount).to.equal(amount);
                expect(args.token).to.equal(token.address);
                expect(args.user).to.equal(user.address);
                expect(args.balances).to.equal(0);
            })
        })
        describe('failure',()=>{
            
            it('reject if there is insufficient balance',async ()=>{
                await expect( exchange.connect(user).withdrawTokens(token.address, amount)).to.be.reverted;
            })

        })

    })
})
