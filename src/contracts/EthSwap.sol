pragma solidity ^0.5.0;

import './Token.sol';

contract EthSwap{
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint rate = 100;

    event TokensPurchased(
        address account,
        address Token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address Token,
        uint amount,
        uint rate
    );
    constructor(Token _token) public{
        token = _token;
    }

    function buyTokens() public payable{

        //Calculate the total qty of the token to buy for the Ethereum spent
        uint totalQty = msg.value * rate;

        require(token.balanceOf(address(this))>=totalQty);
        //Transfer the tokens to the buyer
        token.transfer(msg.sender, totalQty);

        //emit an event
        emit TokensPurchased(msg.sender, address(token), totalQty, rate);
    }

    function sellTokens(uint _qty) public{

        //Calculate the total qty of the token to buy for the Ethereum spent
        uint totalEtherQty =  _qty / rate;

        require(token.balanceOf(msg.sender)>=_qty, "Insufficient Balance");
        require (address(this).balance >=totalEtherQty, "Insufficient Balance at the exchange");
        //Transfer the tokens to the buyer
        token.transferFrom( msg.sender,address(this), _qty);
        msg.sender.transfer(totalEtherQty);

        //emit an event
        emit TokensSold(msg.sender, address(token), _qty, rate);
    }
}