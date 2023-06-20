// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import './Token.sol';

contract Exchange {
    address public feeAccount ;
    uint256 public feePercentage;
    mapping (address=>mapping (address => uint256) ) public tokens;
    mapping (uint256=>bool) public cancelledOrders;
    event _Order (
        uint256 id , 
        address user ,
        address tokenGet ,
        uint256 amountGet ,
        address tokenGive ,
        uint256 amountGive ,
        uint256 timestamp 
    );
    event _Cancel (
        uint256 id , 
        address user ,
        address tokenGet ,
        uint256 amountGet ,
        address tokenGive ,
        uint256 amountGive ,
        uint256 timestamp 
    );

    struct Order {
        uint256 id ; 
        address user ;
        address tokenGet ;
        uint256 amountGet ;
        address tokenGive ;
        uint256 amountGive ;
        uint256 timestamp ;
    }
    mapping(uint256 => Order) public orders ;
    uint256 public orderCount ;
    event Deposit (
        address token , 
        address user , 
        uint256 amount ,
        uint256 balances 
    );

    event Withdraw(
        address token , 
        address user , 
        uint256 amount ,
        uint256 balances 
    );

    constructor(address _feeAccount , uint256 _feepercentage){
        feeAccount = _feeAccount;
        feePercentage = _feepercentage;
    }

    function depositTokens(address _token ,  uint256 _amount ) public {
        require(Token(_token).transferFrom(msg.sender,address(this),_amount));
        tokens[_token][msg.sender]+=_amount;
        emit Deposit(_token, msg.sender , _amount , tokens[_token][msg.sender]);
    }

    function checkBalances(address _token , address user) public view returns (uint256){
        return tokens[_token][user];
    }

    function withdrawTokens (address _token , uint256 _amount) public {
        require(tokens[_token][msg.sender]>=_amount);
        Token(_token).transfer(msg.sender,_amount);
        tokens[_token][msg.sender]-=_amount;
        emit Withdraw(_token, msg.sender , _amount , tokens[_token][msg.sender]);
    }

    function makeorder (address _tokenGet , uint256 _amountGet , address _tokenGive , uint256 _amountGive ) public {
        //user has insufficient tokens 
        require(tokens[_tokenGive][msg.sender]>=_amountGive);


        orderCount+=1;
        // instantiate new order

        orders[orderCount]=Order(
         orderCount ,
         msg.sender,
         _tokenGet ,
         _amountGet ,
         _tokenGive ,
         _amountGive ,
         block.timestamp
        );

        // emit event 
        emit _Order (
         orderCount ,
         msg.sender,
         _tokenGet ,
         _amountGet ,
         _tokenGive ,
         _amountGive ,
         block.timestamp 
        );
    }

    function cancelOrder(uint256 _id) public {
       
        Order storage order= orders[_id];
        require(address(order.user)==msg.sender);
        require(order.id==_id);
        cancelledOrders[_id]=true ;
        emit _Cancel (
         order.id ,
         msg.sender,
         order.tokenGet ,
         order.amountGet ,
         order.tokenGive ,
         order.amountGive ,
         block.timestamp 
        );
    }

}
