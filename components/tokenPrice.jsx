import { React, useState, useEffect } from "react"

import { ethers } from "ethers";

const tokenPrice = () => {

    const [totalSupply0, setTotalSupply0] = useState("");
    const [decimals0, setDecimals0] = useState("");
    const [name0, setName0] = useState("");

    const [totalSupply1, setTotalSupply1] = useState("");
    const [decimals1, setDecimals1] = useState("");
    const [name1, setName1] = useState("");

    const [pairAddress, setPairAddress] = useState("");

    const [tokenPrice, setTokenPrice] = useState("");
    const [bnbTokenPrice, setBnbTokenPrice] = useState("");
    const [bnbPrice, setBnbPrice] = useState("");

    const wbnbAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const dvxAddress = "0x6db3972c6a5535708e7A4F7Ad52F24d178D9A93e";
    const pancakeFactory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";

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

    const getTokenPrice = async (address1, address2) => {
        const iProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org");

        const abi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
        const connectedContract = new ethers.Contract(pancakeFactory, abi, iProvider);

        const pairAddress = await connectedContract.getPair(address1, address2);

        // console.log("Pair: " + pairAddress);

        setPairAddress(pairAddress);

        const abiPair = ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
                        "function token0() external view returns (address)"];

        const pairSc = new ethers.Contract(pairAddress, abiPair, iProvider);

        const [reserves0, reserves1, blockTimestamp] = await pairSc.getReserves();
        const token0 = await pairSc.token0();

        let tokenPriceInBnb = 0;

        if(token0 == dvxAddress) {
          tokenPriceInBnb = reserves1 / reserves0;
        } else {
            tokenPriceInBnb = reserves0 / reserves1;
        }

        setBnbTokenPrice(tokenPriceInBnb);


        let url = new URL(`https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`);
        let response = await fetch(url);
        let result = await response.json();
        let bnbPrice = result.market_data.current_price.usd;

        setBnbPrice(bnbPrice);

        const finalPrice = tokenPriceInBnb * bnbPrice;

        setTokenPrice(finalPrice);
    }

    useEffect(() => {
        getTokenDetails1(dvxAddress);
        getTokenDetails2(wbnbAddress);
        getTokenPrice(dvxAddress, wbnbAddress);
    }, [])
    

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