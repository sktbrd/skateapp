  import React, { useEffect, useState } from 'react';
  import { Box, Text, Flex ,Image, VStack, HStack, Divider} from "@chakra-ui/react";
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

    const DAO_SAFE = "0x41CB654D1F47913ACAB158a8199191D160DAbe4A";
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
            ownVestingShares: ownHP.toFixed(3) + " HP ",
            totalVestingShares: totalHP.toFixed(3) + " HP "
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
        <VStack>
        <Box>
            <Text fontSize="18px" fontWeight="bold" marginBottom="5px">
                Treasure: ${totalWorthUSD.toFixed(3)} USD
              </Text>
            </Box>
            <HStack>
        <Flex padding="10px" borderRadius="10px">
          {/* Ethereum Section */}
          <Box flex="1" margin="5px" borderRadius="10px" border="1px solid limegreen" padding="20px">
            {/* Ethereum Avatar */}
            <Flex flexDirection="column" alignItems="center">
              <Image
                src="https://www.pngitem.com/pimgs/m/124-1245793_ethereum-eth-icon-ethereum-png-transparent-png.png"
                alt="Avatar"
                width="40px"
                height="40px"
                borderRadius="50%"
              />
              <Text fontSize="24px" fontWeight="bold" color="limegreen" marginBottom="10px">
                Ethereum Treasure Value
              </Text>
              <Text fontSize="18px" fontWeight="bold" marginBottom="5px">
                420 PEPE
              </Text>
              <Divider padding="0px" orientation="horizontal" colorScheme="limegreen" />
              
              <Box padding="5px" justifyContent="left">
              <Text fontSize="16px">USD pegged Balance: $2500.00</Text>
              </Box>
              <Divider padding="0px" orientation="horizontal" colorScheme="limegreen" />
              <Text fontSize="16px">Gnars Delegated: 25</Text>

            </Flex>
          </Box>
    
          {/* Hive Section */}
          <Box flex="1" margin="5px" borderRadius="10px" border="1px solid limegreen" padding="20px">
            {/* Hive Avatar */}
            <Flex flexDirection="column" alignItems="center">
              <Image
                src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png"
                alt="Avatar"
                width="40px"
                height="40px"
                borderRadius="50%"
              />
              <Text fontSize="24px" fontWeight="bold" color="limegreen" marginBottom="10px">
                Hive Treasure Value
              </Text>

              <Text fontSize="16px">Treasure HIVE: {hiveUser?.balance || "Fetching..."}</Text>
              <Text fontSize="16px">HP (Owned): {hiveUser?.ownVestingShares || "Fetching..."}</Text>
              <Text fontSize="16px">HP (Total): {hiveUser?.totalVestingShares || "Fetching..."}</Text>
              <Text fontSize="16px">HBD: {hiveUser?.hbd_balance || "Fetching..."}</Text>
              <Text fontSize="16px">Savings: {hiveUser?.savings_hbd_balance || "Fetching..."}</Text>
              <Text fontSize="18px">Hive Worth: ${hiveWorthInUSD.toFixed(3)} USD</Text>
              <Text fontSize="16px">Owned Vests Worth: ${ownVestingWorthInUSD.toFixed(3)} USD</Text>
              <Text fontSize="16px">Deleg. Vests Worth: ${delegatedVestingWorthInUSD.toFixed(3)} USD</Text>
            </Flex>

          </Box>
          </Flex>

        </HStack>
        </VStack>



        </Flex>
    );
    
    
  }


  export default DaoStatus;


