const { assert } = require('chai');

require('chai')
    .use(require('chai-as-promised'))
    .should()

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

function tokens(n){
    return web3.utils.toWei(n,'ether')
}
contract('EthSwap',([deployer, investor])=>{
    let token, ethSwap
    before(async ()=>{
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address,tokens('1000000'))
    })

    describe('Token deployment',async ()=>{
        it('contract has a name?', async ()=> {
            const name = await token.name()
            assert.equal(name,'ANTE Token')
        })
    })

    describe('EthSwap deployment',async ()=>{
        it('contract has a name?', async ()=> {
            const name = await ethSwap.name()
            assert.equal(name,'EthSwap Instant Exchange')
        })

        it('contract has tokens?', async()=>{
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(),tokens('1000000'))
        })
        
    })

    describe('buyTokens()',async()=>{

        let result

        before(async ()=>{
            //purchase tokens before each example
            result = await ethSwap.buyTokens({from:investor, value: web3.utils.toWei('1','ether')})
        })

        it('Allows users to purchase tokens from tradeth for against a fixed rate', async()=>{
            //Check investor token balance after purchase
            let investorbalance = await token.balanceOf(investor)
            assert.equal(investorbalance.toString(),tokens('100'))

            //Check Tradeth balance after purchase
            let tradethbalance_ante = await token.balanceOf(ethSwap.address)
            assert.equal(tradethbalance_ante.toString(),tokens('999900'))
            let tradethbalance_eth = await web3.eth.getBalance(ethSwap.address)
            assert.equal(tradethbalance_eth.toString(),web3.utils.toWei('1','ether') )

            //Check logs to see if the event was updated with the correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.Token, token.address)
            assert.equal(event.amount.toString(), tokens('100'))
            assert.equal(event.rate, '100')
            
        })
    })

    describe('sellTokens()',async()=>{

        let result

        before(async ()=>{
            //purchase tokens before each example
            await token.approve(ethSwap.address, tokens('100'),{from:investor})
            result = await ethSwap.sellTokens(tokens('100'),{from:investor})
        })

        it('Allows users to sell tokens to tradeth against a fixed rate', async()=>{
            let investorbalance = await token.balanceOf( investor)
            assert.equal(investorbalance.toString(),'0')

            //Check Tradeth balance after purchase
            let tradethbalance_ante = await token.balanceOf(ethSwap.address)
            assert.equal(tradethbalance_ante.toString(),tokens('1000000'))
            let tradethbalance_eth = await web3.eth.getBalance(ethSwap.address)
            assert.equal(tradethbalance_eth.toString(),web3.utils.toWei('0','ether') )

            //Check logs to see if the event was updated with the correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.Token, token.address)
            assert.equal(event.amount.toString(), tokens('100'))
            assert.equal(event.rate, '100')

            //FAILURE: Investor cant sell more than they have
            await ethSwap.sellTokens(tokens('500'),{from:investor}).should.be.rejected;
        })
    })
})