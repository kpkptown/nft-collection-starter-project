import myEpicNft from "./utils/MyEpicNFT.json";
import { ethers } from "ethers";
import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import raribleLogo from './assets/rarible-logo.svg';

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'mugi_web3';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

// コントラクトアドレスをCONTRACT_ADDRESS変数に格納
const CONTRACT_ADDRESS = "0x11Cd9AF7921a95650f3f79699284fF9e04C53b1E";

const App = () => {
  const [mintCount,setMintCount] =useState(0);
  const [minting,setMinting] =useState(false);
  /* ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。*/
  const [currentAccount, setCurrentAccount] = useState("");
  /* この段階でcurrentAccountの中身は空 */
  console.log("currentAccount: ", currentAccount);
/* ユーザーがMetaMaskを持っているか確認します。 */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /*
    * ユーザーが認証可能なウォレットアドレスを持っている場合は、
    * ユーザーに対してウォレットへのアクセス許可を求める。
    * 許可されれば、ユーザーの最初のウォレットアドレスを
    * accounts に格納する。
    */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // **** イベントリスナーをここで設定 ****
      // この時点で、ユーザーはウォレット接続が済んでいます。
      setupEventListener();
      setupMintCount();
      checkChainId();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
  * connectWallet メソッドを実装します。
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /* ウォレットアドレスに対してアクセスをリクエストしています。*/
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /* ウォレットアドレスを currentAccount に紐付けます。*/
      setCurrentAccount(accounts[0]);
      // **** イベントリスナーをここで設定 ****
      setupEventListener();
      setupMintCount();
      checkChainId();
    } catch (error) {
      console.log(error);
    }
  };

  const setupMintCount = async() => {
    try {
      const { ethereum } = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFT が発行されます。
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        const number =  await connectedContract.TotalMintCount();
        console.log(number)
        setMintCount(number.toNumber());
        console.log("Setup mint count");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // setupEventListener 関数を定義します。
  // MyEpicNFT.sol の中で event が　emit された時に、
  // 情報を受け取ります。
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFT が発行されます。
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object dosen't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ユーザーのネットワークのチェック実装
  const checkChainId = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        let chainId =await ethereum.request({method: 'eth_chainId'});
        console.log("connected to chain" +chainId);
        // 0x4 は　Rinkeby の ID です。
        const rinkebyChainId = "0x4";
        if(chainId !== rinkebyChainId){
          alert("You are not connected to the Rinkeby Test Network");
        }
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch (error){
      console.log(error)
    }
  }
  
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setMinting(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFT が発行されます。
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setMinting(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button 
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );
  /*
  * ページがロードされたときに useEffect()内の関数が呼び出されます。
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>
          {
            currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : (
              <button onClick={askContractToMintNft} className="cta-button mint-button">
                Mint NFT
              </button>
            )
          }
          {
            minting? (
              <p className="communicate-text">minting... <br/> しばらくお待ち下さい。</p>
            ):(
              <p className="communicate-text">これまでに発行されたNFTの数{mintCount}/{TOTAL_MINT_COUNT}</p>
            )
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
          <img alt="Rarible Logo" className="rarible-logo" src={raribleLogo} />
          <a 
            className='footer-text' 
            href={`https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}/items`}
            target="_blank"
            rel="noreferrer"
          >raribleでコレクションを表示</a>
        </div>
      </div>
    </div>
  );
};

export default App;
