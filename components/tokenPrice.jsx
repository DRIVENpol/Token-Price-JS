// Imports
import { React, useState, useEffect } from "react"

import { ethers } from "ethers";

const tokenPrice = () => {

    // Token1 details
    const [totalSupply0, setTotalSupply0] = useState("");
    const [decimals0, setDecimals0] = useState("");
    const [name0, setName0] = useState("");

    // Token2 details
    const [totalSupply1, setTotalSupply1] = useState("");
    const [decimals1, setDecimals1] = useState("");
    const [name1, setName1] = useState("");

    // Pair address
    const [pairAddress, setPairAddress] = useState("");

    // Prices
    const [tokenPrice, setTokenPrice] = useState("");
    const [bnbTokenPrice, setBnbTokenPrice] = useState("");
    const [bnbPrice, setBnbPrice] = useState("");

    // This address should be for wBnb, wEth, USDT, USDC, BUSD
    // Depending for which pair you want to get the price
    // In this case, we will find the USD price for DVX-BNB
    const wbnbAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

    // Main token address (DVX)
    const dvxAddress = "0x6db3972c6a5535708e7A4F7Ad52F24d178D9A93e";

    // Pancakeswap Factory address
    const pancakeFactory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";

    // Get the details of token 1 - optional
    const getTokenDetails1 = async (address) => {
        const iProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org");

        const abi = ["function totalSupply() public view returns (uint)",
                    "function decimals() public view returns (uint8)",
                    "function name() public view returns (string memory)"];
        const connectedContract = new ethers.Contract(address, abi, iProvider);

        const totalSupply = await connectedContract.totalSupply();
        const decimals = await connectedContract.decimals();
        const name = await connectedContract.name();

        // console.log("Name: " + name);
        // console.log("Supply: " + totalSupply);
        // console.log("Decimals: " + decimals);

        setTotalSupply0(String(totalSupply));
        setDecimals0(decimals);
        setName0(name);
    }

    // Get the details of token 2 - optional
    const getTokenDetails2 = async (address) => {
        const iProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org");

        const abi = ["function totalSupply() public view returns (uint)",
                    "function decimals() public view returns (uint8)",
                    "function name() public view returns (string memory)"];
        const connectedContract = new ethers.Contract(address, abi, iProvider);

        const totalSupply = await connectedContract.totalSupply();
        const decimals = await connectedContract.decimals();
        const name = await connectedContract.name();

        // console.log("Name: " + name);
        // console.log("Supply: " + totalSupply);
        // console.log("Decimals: " + decimals);

        setTotalSupply1(String(totalSupply));
        setDecimals1(decimals);
        setName1(name);
    }

    // GET PRICE FUNCTION ========================================================================

    // In this function we will:
    // - Fetch the pair address from the PancakeSwap Factory Smart Contract
    // - We will fetch the wBNB price, in USD, using CoinGeko's API
    // - We will fetch the token (DVX) price in BNB
    // - We will convert the token price from BNB to BUSD

    const getTokenPrice = async (address1, address2) => {
        // Connect to BSC's provider
        const iProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org");

        // PancakeSwap Factory ABI - only for "getPair" function
        const abi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];

        // Connect to the smart contract
        const connectedContract = new ethers.Contract(pancakeFactory, abi, iProvider);

        // Feth the pair address
        const pairAddress = await connectedContract.getPair(address1, address2);

        // console.log("Pair: " + pairAddress);

        setPairAddress(pairAddress);

        // DVX-BNB pair's ABI
        const abiPair = ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
                        "function token0() external view returns (address)"];

        // Connect to the smart contract
        const pairSc = new ethers.Contract(pairAddress, abiPair, iProvider);

        // Fetch the reserves of tokens
        const [reserves0, reserves1, ] = await pairSc.getReserves();

        // Fetch the address of token) from the pair smart contract
        // This step is very important because we really need that address - read line 122
        const token0 = await pairSc.token0();

        let tokenPriceInBnb = 0;

        // For some reasons, token0 is not always the wBNB address in a pair smart contract
        // Sometimes you will have token0 = token and token1 = wBNB and sometimes you will have token0 = wBNB and token1 = token
        // In order to get the proper price, we will use the following if statement
        if(token0 == wbnbAddress) {
          tokenPriceInBnb = reserves0 / reserves1;
        } else {
            tokenPriceInBnb = reserves1 / reserves0;
        }

        setBnbTokenPrice(tokenPriceInBnb);

        // Fethc wBNB's price in USD, from CoinGeko
        let url = new URL(`https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`);
        let response = await fetch(url);
        let result = await response.json();
        let bnbPrice = result.market_data.current_price.usd;

        setBnbPrice(bnbPrice);

        // Token's price in BNB => token's price in USD
        const finalPrice = tokenPriceInBnb * bnbPrice;

        setTokenPrice(finalPrice);
    }

    useEffect(() => {
        getTokenDetails1(dvxAddress);
        getTokenDetails2(wbnbAddress);
        getTokenPrice(dvxAddress, wbnbAddress);
    }, [])
    
  // Display data
  return (<>
      <div>  Token 0</div><br />
      <div>  Name: {name0}</div><br />
      <div>  Total Supply: {totalSupply0}</div><br />
      <div>  Decimals: {decimals0}</div><br /><br />
      <div>  ============== </div><br /><br />

      <div>  Token 1</div><br />
      <div>  Name: {name1}</div><br />
      <div>  Total Supply: {totalSupply1}</div><br />
      <div>  Decimals: {decimals1}</div><br /><br />
      <div>  ============== </div><br /><br />

      <div>  Pair: {pairAddress}</div><br />
      <div>  Price in BNB: {bnbTokenPrice} BNB / token</div><br />
      <div>  Price in USD: {tokenPrice} USD / token</div><br />
      <div>  BNB price: {bnbPrice} USD / token</div><br />
    </>
  )
}

export default tokenPrice