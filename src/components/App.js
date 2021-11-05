import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import Navbar from './Navbar'
import EthSwap from '../abis/EthSwap.json'
import Token from '../abis/Token.json'
import Main from './Main'

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      account:'',
      ethBalance:'0',
      tokenBalance:'0',
      token:{},
      ethSwap:{},
      ethSwapBalance:'0',
      loading : true,
    }
  }

  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3 (){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3){
      window.web3 =new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Non Ethereum browser detected.')
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    
    this.setState({
      account: accounts[0],
    })

    const balance = await web3.eth.getBalance(this.state.account)
    this.setState({
      ethBalance: balance,
    })

    //Load Token
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if (tokenData){
      const token = new web3.eth.Contract(Token.abi,tokenData.address)
      this.setState({token})
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({
      tokenBalance:tokenBalance.toString()
      })
      
    }else{
      window.alert('Unable to deploy Token contract to the detected network')
    }

    //Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if (ethSwapData){
      const ethSwap = new web3.eth.Contract(EthSwap.abi,ethSwapData.address)
      this.setState({ethSwap})
    }else{
      window.alert('Unable to deploy Token contract to the detected network')
    }

    this.setState({ loading: false })
  }

  buyTokens= async (etherAmount)=>{
    this.setState({loading:true})
    await this.state.ethSwap.methods.buyTokens().send({from:this.state.account, value: etherAmount}).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
    
  }

  sellTokens= (tokenAmount)=>{
    this.setState({loading:true})
    this.state.token.methods.approve(this.state.ethSwap.address,tokenAmount).send({from:this.state.account,}).on('transactionHash',(hash)=>{
    this.state.ethSwap.methods.sellTokens(tokenAmount).send({from:this.state.account}).on('transactionHash',(hash)=>{
       this.setState({loading : false})
     }).on('error', function(error, receipt) {
        window.alert('Transaction was not successful')
  });
    })
    this.setState({loading : false})
  }
  
  render() {
    let content
    if (this.state.loading === true){
      content = <p id='loader' className = 'text-center'>Loading . . . </p>
    }else{
      content = <Main 
                ethBalance = {this.state.ethBalance} 
                tokenBalance = {this.state.tokenBalance} 
                buyTokens = {this.buyTokens}
                sellTokens = {this.sellTokens}/>
    }
    return (
      <div>
        <Navbar account = {this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth : '600px'}}>
              <div className="content mr-auto ml-auto">

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
 