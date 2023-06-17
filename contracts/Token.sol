// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Token {
    string public name = "DappToken";
    string public symbol = "Dapp";
    uint256 public decimal = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address from, address to, uint256 amount);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        totalSupply = 1000000 * (10 ** decimal);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(_to != address(0)); // burn address
        require(balanceOf[msg.sender]>=_amount);
        _transfer(msg.sender,_to,_amount);
        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal returns (bool) {
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function allow(address spender, uint256 _amount) public returns (bool) {
        require(spender != address(0));
        allowance[msg.sender][spender] = _amount;
        emit Approval(msg.sender, spender, _amount);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        require(balanceOf[_from]>=_amount);
        require(allowance[_from][msg.sender]>=_amount);
        allowance[_from][msg.sender]-=_amount;
        _transfer(_from,_to,_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }
}
