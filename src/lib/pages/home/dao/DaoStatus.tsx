import React, { useEffect, useState } from 'react';
import { Box, Text, Flex ,Image, VStack, HStack, Divider} from "@chakra-ui/react";
// @ts-ignore
import { usePioneer } from "pioneer-react";
import { Client } from "@hiveio/dhive";

// Hive Stuff
import * as dhive from "@hiveio/dhive";
import * as safeService from '@safe-global/api-kit';
import axios from 'axios';


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
  totalVestingShares: string;
}

const DaoStatus = () => {
  // Define hooks
  const { state, dispatch } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;

  // Hive Stuff 
  const [hiveUser, setHiveUser] = useState<User | null>(null);
  const [HBDprice, setHBDprice] = useState<number | null>(null);

  // Ethereum stuff
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [daoPortfolio, setDaoPortfolio] = useState<any>(null);
  const [daoWallet, setDaoWallet] = useState<User | null>(null);
  const [hotWalletBalance, setHotWalletBalance] = useState<User | null>(null);
  const [ethereumBalance, setEthereumBalance] = useState<number | null>(null);
  
  const DAO_SAFE = "0x5501838d869B125EFd90daCf45cDFAC4ea192c12";
  const HOT_WALLET = "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";

  // create apiKey from process env VITE_ETHEREUM_API
  const apiKey = process.env.VITE_ETHERSCAN_API

  // Ethereum address you want to check
  const ethereumAddress = '0x5501838d869b125efd90dacf45cdfac4ea192c12';

  // Etherscan API endpoint
  const etherscanEndpoint = `https://api.etherscan.io/api`;

  const [loading, setLoading] = useState(true);


  // Function to get the balance of an Ethereum address
  // Function to get the balance of an Ethereum address
  async function getBalance() {
    try {
      const response = await axios.get(etherscanEndpoint, {
        params: {
          module: 'account',
          action: 'balance',
          address: ethereumAddress,
          apikey: apiKey,
        },
      });

      console.log('Etherscan API Response:', response);

      if (response.data.status === '1') {
        const balanceWei = response.data.result;
        const balanceEther = parseFloat(balanceWei) / 1e18;
        console.log(`Balance of ${ethereumAddress}: ${balanceEther} ETH`);
        setEthereumBalance(balanceEther); // Set the Ethereum balance in the component's state
      } else {
        console.error('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const onStart = async () => {
    try {
      if (api && app) {
        const portfolio = await api.GetPortfolio({ address: DAO_SAFE });
        console.log("TREASURE",portfolio)
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
          totalVestingShares: totalHP.toFixed(3) 
        };
        setHiveUser(userBalance);
      }
    } catch (error) {
      console.error("Error fetching Hive balance for steemskate:", error);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with [api, app]', api, app);
    onStart();
    fetchSteemskateBalance();
    getBalance();
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

  const fetchHBDPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd");
      const data = await response.json();
      setHBDprice(data.hive_dollar.usd);
    } catch (error) {
      console.error("Error fetching Hive price:", error);
    }
  };
  useEffect(() => {
    fetchHBDPrice();
  }, []);

  const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
  ) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    const availableVESTS =
      vestingSharesFloat - delegatedVestingSharesFloat + receivedVestingSharesFloat;

    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_dynamic_global_properties',
        params: [],
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    const vestHive =
      (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
      parseFloat(result.result.total_vesting_shares);

    const delegatedHivePower =
      (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);

    return {
      hivePower: vestHive.toFixed(3),
      delegatedHivePower: delegatedHivePower.toFixed(3),
    };
  };

  const hiveBalance = parseFloat(hiveUser?.balance || "0");                                // ✅
  console.log("HIVE BALANCE",hiveBalance)
  const hbdBalance = parseFloat(hiveUser?.hbd_balance || "0");                           // ✅
  console.log("HBD BALANCE",hbdBalance)
  const savingsHbdBalance = parseFloat(hiveUser?.savings_hbd_balance || "0");       // ✅
  console.log("SAVINGS HBD BALANCE",savingsHbdBalance)                           
  const hbdWorthInUSD = HBDprice ? hbdBalance * HBDprice : 0;    // ✅
  console.log("HBD WORTH IN USD",hbdWorthInUSD)
  const savingsHbdWorthInUSD = HBDprice ? savingsHbdBalance * HBDprice : 0;   // ✅
  console.log("SAVINGS HBD WORTH IN USD",savingsHbdWorthInUSD)

  // Hive Power and Vesting Shares



  const hiveWorthInUSD = hivePrice ? hiveBalance * hivePrice : 0;    // ✅
  console.log("HIVE WORTH IN USD",hiveWorthInUSD)


  


  const ethereumTreasure = daoPortfolio?.data?.totalNetWorth || 0; // Total worth in ETH
  console.log("ETHEREUM TREASURE",ethereumTreasure)
  // Calculating total worth by summing up different values
  const totalWorthUSD = hiveWorthInUSD  + ethereumTreasure;
  console.log("TOTAL WORTH USD",totalWorthUSD)

  return (
    <Flex paddingBottom="30px" justifyContent="center" alignItems="center">
      <VStack>
        <Box>
          <Text fontSize="18px" fontWeight="bold" marginBottom="5px">
            Treasure: ${totalWorthUSD.toFixed(3)} USD
          </Text>
        </Box>
        <HStack>
          <Flex borderRadius="10px">
            {/* Ethereum Section */}
            <Box flex="1" borderRadius="10px" border="1px solid limegreen" padding="10px">
              {/* Ethereum Avatar */}
              <Flex flexDirection="column" alignItems="center">
                <Image
                  src="https://www.pngitem.com/pimgs/m/124-1245793_ethereum-eth-icon-ethereum-png-transparent-png.png"
                  alt="Avatar"
                  width="40px"
                  height="40px"
                  borderRadius="50%"
                />
                <Divider paddingTop="10px" orientation="horizontal" colorScheme="limegreen" />

                <Text fontSize="24px" fontWeight="bold" color="limegreen" marginBottom="10px">
                  ETH Treasure
                </Text>
                <Text fontSize="18px" fontWeight="bold" marginBottom="5px">
                  {ethereumBalance ? `${ethereumBalance.toFixed(3)} ETH` : "Fetching..."}
                </Text>
                <Divider orientation="horizontal" colorScheme="limegreen" />

                <Box padding="10px"  alignItems="left" >
                <Text fontSize="16px" textAlign="left">USD Balance: $2500.00</Text>
              </Box>

                <Divider  orientation="horizontal" colorScheme="limegreen" />
                <HStack padding="10px" >
                <Image
                  src="https://www.gnars.wtf/images/logo.png"
                  alt="Avatar"
                  width="20px"
                  height="20px"

                />
                <Text fontSize="16px">Gnars Deleg: 25</Text>

                </HStack>


              </Flex> 
            </Box>

            {/* Hive Section */}
            <Box flex="1"  borderRadius="10px" border="1px solid limegreen" padding="10px">
              {/* Hive Avatar */}
              <Flex flexDirection="column" alignItems="center">
                <Image
                  src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png"
                  alt="Avatar"
                  width="40px"
                  height="40px"
                  borderRadius="50%"
                />
                <Divider paddingTop="10px" orientation="horizontal" colorScheme="limegreen" />

                <Text fontSize="24px" fontWeight="bold" color="limegreen" marginBottom="10px">
                  Hive Treasure
                </Text>
                <Text fontSize="18px" fontWeight="bold" marginBottom="5px">
                  2112.96 USD
                </Text>
                <Divider  orientation="horizontal" colorScheme="limegreen" />

                <Text fontSize="16px"> HIVE: {hiveUser?.balance || "Fetching..."}</Text>
                <Text fontSize="16px">HP: {"13920 HP" || "Fetching..."}</Text>
                <Text fontSize="16px">HBD: {hiveUser?.hbd_balance || "Fetching..."}</Text>
                <Text fontSize="16px">Savings: {hiveUser?.savings_hbd_balance || "Fetching..."}</Text>
              </Flex>
            </Box>
          </Flex>
        </HStack>
      </VStack>
    </Flex>
  );
}
  
  export default DaoStatus;


