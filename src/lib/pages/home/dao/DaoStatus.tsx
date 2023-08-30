import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, useDisclosure } from "@chakra-ui/react";
// @ts-ignore
import { usePioneer } from "pioneer-react"
import { Client } from "@hiveio/dhive";

// Hive Stuff
import * as dhive from "@hiveio/dhive";


const dhiveClient = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

interface User {
  data?: {
    totalNetWorth?: number;
    // ... other properties inside data
  };
  balance: string;
  hbd_balance: string;
  savings_hbd_balance: string;
  vesting_shares: string;
  delegated_vesting_shares: string;
  received_vesting_shares: string;
  name?: string;
}

const DaoStatus = () => {
  // Define hooks
  const { state, dispatch } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [daoPortfolio, setDaoPortfolio] = useState<any>(null);
  const [ daoWallet, setDaoWallet ] = useState<User | null>(null);
  const [ hotWalletBalance, setHotWalletBalance ] = useState<User | null>(null);


  const DAO_SAFE = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";
  const HOT_WALLET = "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";

  // Create onStart function to fetch the DAO's wallet portfolio
  const onStart = async () => {
    try {
      if (api && app) {
        const portfolio = await api.GetPortfolio({ address: DAO_SAFE });
        const eth_hotwallet = await api.GetPortfolio({ address: HOT_WALLET });
        console.log("DAO WALLET:", DAO_SAFE);
        console.log("DAO PORTFOLIO:", portfolio);
        setDaoPortfolio(portfolio);
        setHotWalletBalance(eth_hotwallet)
        console.log("DAO:" ,hotWalletBalance)
        setLoading(false);
      }
    } catch (e) {
      console.error("Error in onStart:", e);
    }
  };
  
  useEffect(() => {
    onStart();
  }, [api, app]);

  return (
    <Flex paddingBottom="30px"justifyContent="center" alignItems="center">
      <Box padding="10px" borderRadius="10px"  border="1px solid limegreen" display="flex" flexDirection="column" alignItems="center">
        <Text>Dao Stats</Text>
        {loading ? (
          <Text >Loading...</Text>
        ) : (
          <Text alignItems="left">Treasure ETH: ${daoPortfolio?.data?.totalNetWorth?.toFixed(2) || 0} USD</Text>
        )}
          <Text alignItems="left">Treasure HIVE in USD</Text>
          <Text alignItems="left">Hot Wallet: ${hotWalletBalance?.data?.totalNetWorth?.toFixed(2) || 0} USD</Text>

      </Box>
    </Flex>  
  );
}

export default DaoStatus;
