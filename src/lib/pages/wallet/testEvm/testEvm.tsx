import React from "react";
import { Box ,Flex ,Spinner } from '@chakra-ui/react';
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

interface TokenInfo {
  id: string;
  networkId: number;
  address: string;
  label: string;
  name: string;
  balance: string;
  balanceUSD: string;
  caip: string;
  canExchange: boolean;
  coingeckoId: string;
  context: string;
  contract: string;
  createdAt: string;
  dailyVolume: number;
  decimals: number;
  description: string;
  explorer: string;
  externallyVerified: boolean;
  hide: boolean;
  holdersEnabled: boolean;
  image: string;
  isToken: boolean;
  lastUpdated: number;
  marketCap: number;
  network: string;
  price: number;
  priceUpdatedAt: string;
  protocal: string;
  pubkey: string;
  source: string;
  status: string;
  symbol: string;
  totalSupply: string;
  updatedAt: string;
  verified: boolean;
  website: string;
}

interface EvmBalanceItem {
  id: string;
  image: string;
  name: string;
  balance: string;
  balanceUSD: string; // Change the type to string
  network: string;
  pubkey: string;
}


const TestEvm = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [ETHaddress, setETHAddress] = useState("");
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const headers = ["Asset", "Balance", "Balance USD"];
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<TokenInfo | null>(null);
  const [userPortifolio, setUserPortifolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<EvmBalanceItem[]>([]);
  const [userNftPortifolio, setUserNftPortifolio] = useState<any>(null);

  const onStart = async function(){
    try{
      if (app && app.wallets && app.wallets.length > 0) {
      // set a timeout to wait for the app to be ready
      setETHAddress(app.wallets[0].wallet.ethAddress);
      console.log(ETHaddress)

        const portfolio = await api.GetPortfolio({ address: ETHaddress.toUpperCase() });

          
          const totalNetWorth =  portfolio.data.totalNetWorth;
          setLoading(false)
          setTotalWorth(totalNetWorth);
          if (portfolio.data.nfts) {
            setUserNftPortifolio(portfolio.data.nfts);
          console.log("NFT portfollio: ", portfolio.data.nfts);
      }
    }
    }catch(e){
      console.error(e)
    }
  }
  useEffect(() => {
    onStart()
  }, [app,api]);

  

  

  return(
    <Flex flexDirection="row">
  <Box>
    
<Pioneer/>
<p>Wallet: {ETHaddress}</p>  
{!userNftPortifolio ? (
        <Flex flexDirection="column" alignItems="center" justifyContent="center">
          {/* <Text>Connect Wallet</Text> */}
        </Flex>
      ) : loading ? (
        <Flex flexDirection="column" alignItems="center" justifyContent="center">
          <Spinner size="xl" color="limegreen" />
          <p>Loading balances... So many tokens uaau !</p>
        </Flex>
      ) : (
  <Box>
  <p> {userNftPortifolio}</p>
  <p>Tokenns Worth: {totalWorth}</p>

</Box>
      )}
  </Box>

  </Flex>
  )
};

export default TestEvm;
