import React, { useEffect, useState } from 'react';
import { Box, Text, Flex } from "@chakra-ui/react";
// @ts-ignore
import { usePioneer } from "pioneer-react";
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
  };
  balance: string;
  hbd_balance: string;
  savings_hbd_balance: string;
  vesting_shares: string;
  delegated_vesting_shares: string;
  received_vesting_shares: string;
  name?: string;
  ownVestingShares: string;
  totalVestingShares: string;
}

const DaoStatus = () => {
  // Define hooks
  const { state, dispatch } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [daoPortfolio, setDaoPortfolio] = useState<any>(null);
  const [daoWallet, setDaoWallet] = useState<User | null>(null);
  const [hotWalletBalance, setHotWalletBalance] = useState<User | null>(null);
  const [hiveUser, setHiveUser] = useState<User | null>(null);

  const DAO_SAFE = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";
  const HOT_WALLET = "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";

  const onStart = async () => {
    try {
      if (api && app) {
        const portfolio = await api.GetPortfolio({ address: DAO_SAFE });
        const eth_hotwallet = await api.GetPortfolio({ address: HOT_WALLET });
        setDaoPortfolio(portfolio);
        setHotWalletBalance(eth_hotwallet);
        setLoading(false);
      }
    } catch (e) {
      console.error("Error in onStart:", e);
    }
  };

  const fetchSteemskateBalance = async () => {
    try {
      const account = await dhiveClient.database.getAccounts(["steemskate"]);
      if (account && account.length > 0) {
        const user = account[0];

        const vestingSharesStr = (user.vesting_shares as string).split(" ")[0];
        const delegatedVestingSharesStr = (user.delegated_vesting_shares as string).split(" ")[0];
        const receivedVestingSharesStr = (user.received_vesting_shares as string).split(" ")[0];

        const vestingSharesFloat = parseFloat(vestingSharesStr);
        const delegatedVestingSharesFloat = parseFloat(delegatedVestingSharesStr);
        const receivedVestingSharesFloat = parseFloat(receivedVestingSharesStr);

        const ownHP = vestingSharesFloat - delegatedVestingSharesFloat;
        const totalHP = ownHP + receivedVestingSharesFloat;

        const userBalance: User = {
          balance: user.balance as string,
          hbd_balance: user.hbd_balance as string,
          savings_hbd_balance: user.savings_hbd_balance as string,
          vesting_shares: totalHP.toFixed(3) + " HP (Total)",
          delegated_vesting_shares: delegatedVestingSharesFloat.toFixed(3) + " HP (Delegated)",
          received_vesting_shares: receivedVestingSharesFloat.toFixed(3) + " HP (Received)",
          name: user.name,
          ownVestingShares: ownHP.toFixed(3) + " HP (Owned)",
          totalVestingShares: totalHP.toFixed(3) + " HP (Total)"
        };
        setHiveUser(userBalance);
      }
    } catch (error) {
      console.error("Error fetching Hive balance for steemskate:", error);
    }
  };

  useEffect(() => {
    onStart();
    fetchSteemskateBalance();
  }, [api, app]);

  const [hivePrice, setHivePrice] = useState<number | null>(null);

  const fetchHivePrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd");
      const data = await response.json();
      setHivePrice(data.hive.usd);
    } catch (error) {
      console.error("Error fetching Hive price:", error);
    }
  };
  useEffect(() => {
    fetchHivePrice();
  }, []);

  const hiveBalance = parseFloat(hiveUser?.balance || "0");
  const hbdBalance = parseFloat(hiveUser?.hbd_balance || "0");
  const savingsHbdBalance = parseFloat(hiveUser?.savings_hbd_balance || "0");

  const hbdWorthInUSD = hivePrice ? hbdBalance * hivePrice : 0;
  const savingsHbdWorthInUSD = hivePrice ? savingsHbdBalance * hivePrice : 0;



  const delegatedVestingShares = parseFloat(hiveUser?.delegated_vesting_shares || "0");
  const ownVestingShares = parseFloat(hiveUser?.ownVestingShares || "0");

  const hiveWorthInUSD = hivePrice ? hiveBalance * hivePrice : 0;
  const ownVestingWorthInUSD = hivePrice ? ownVestingShares * hivePrice : 0;
  const delegatedVestingWorthInUSD = hivePrice ? delegatedVestingShares * hivePrice : 0;

  const ethereumTreasure = daoPortfolio?.data?.totalNetWorth || 0; // Total worth in ETH

  // Calculating total worth by summing up different values
  const totalWorthUSD = hiveWorthInUSD + ownVestingWorthInUSD + delegatedVestingWorthInUSD + ethereumTreasure;

  return (
    <Flex paddingBottom="30px" justifyContent="center" alignItems="center">
      <Box padding="10px" borderRadius="10px" border="1px solid limegreen" display="flex" flexDirection="column" alignItems="center">
        <Text>Dao Stats</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Box padding="10px" borderRadius="10px" display="flex" flexDirection="column" alignItems="left">
            <Text>Hive Price: {hivePrice ? `$${hivePrice.toFixed(2)}` : "Fetching..."}</Text>
            <Text>Ethereum Treasure: {ethereumTreasure.toFixed(2)} ETH</Text>
            <Text>Treasure HIVE: {hiveUser?.balance || "Fetching..."}</Text>
            <Text>HP (Owned): {hiveUser?.ownVestingShares || "Fetching..."}</Text>
            <Text>HP (Total): {hiveUser?.totalVestingShares || "Fetching..."}</Text>
            <Text>HBD: {hiveUser?.hbd_balance || "Fetching..."}</Text>
            <Text>Savings: {hiveUser?.savings_hbd_balance || "Fetching..."}</Text>
            <Text>Hive Worth: ${hiveWorthInUSD.toFixed(3)} USD</Text>
            <Text>Owned Vesting Worth: ${ownVestingWorthInUSD.toFixed(3)} USD</Text>
            <Text>Delegated Vesting Worth: ${delegatedVestingWorthInUSD.toFixed(3)} USD</Text>
            <Text>Total Worth: ${totalWorthUSD.toFixed(3)} USD</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

export default DaoStatus;


