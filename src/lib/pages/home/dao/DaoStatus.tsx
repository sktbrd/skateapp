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


  const DAO_WALLETS = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";

  // Create onStart function to fetch the DAO's wallet portfolio
  const onStart = async () => {
    try {
      if (api && app) {
        const portfolio = await api.GetPortfolio({ address: DAO_WALLETS });
        console.log("DAO WALLET:", DAO_WALLETS);
        console.log("DAO PORTFOLIO:", portfolio);
        setDaoPortfolio(portfolio);
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
    <Flex justifyContent="center" alignItems="center">
      <Box padding="10px" border="1px solid limegreen" display="flex" flexDirection="column" alignItems="center">
        <Text>Dao Stats</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Text>Treasure ETH: ${daoPortfolio?.data?.totalNetWorth?.toFixed(2) || 0} USD</Text>
        )}
                  <Text>Treasure HIVE in USD</Text>
      </Box>
    </Flex>  
  );
}

export default DaoStatus;
