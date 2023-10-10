import React from "react";
import { Box ,Flex ,Text, Spinner } from '@chakra-ui/react';
//@ts-ignore
import { Pioneer } from "@pioneer-platform/pioneer-react";

import {
  usePioneer,
  AssetSelect,
  BlockchainSelect,
  WalletSelect,
  // @ts-ignore
} from "@pioneer-platform/pioneer-react";

import { useEffect,useState } from "react";




const TestEvm = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext ,status} = state;
  const [ETHaddress, setETHAddress] = useState("");
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPortfolio, setUserPortfolio] = useState({});
  const [loading, setLoading] = useState(true);

  const onStart = async function(){
    try{
     if (app) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        console.log("currentAddress: ", currentAddress);
        setETHAddress(currentAddress);
      }
    if (ETHaddress) {
      const portfolio = await api.GetPortfolio({ address: ETHaddress.toUpperCase() });
      setUserPortfolio(portfolio.data.nfts[0].token.medias[0].originalUrl);
      console.log("portfolio: ", userPortfolio);
      console.log(portfolio.data.nfts)
    }
    }catch(e){
      console.error(e)
    }
  }
  useEffect(() => {
    

    onStart()
  }, [app, api, app?.wallets, status, pubkeyContext]);

  

  return(
  <Box>
    
    <p> {ETHaddress}</p>
    <img src={userPortfolio.toString()}></img>
    <button onClick={onStart}>Click</button>    
  </Box>
  )
};

export default TestEvm;
