import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Image, VStack, HStack, Divider } from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import { fetchHbdPrice, fetchConversionRate } from 'lib/pages/wallet/hive/hiveBalance';
import axios from 'axios';
import { cache } from 'lib/pages/wallet/hive/hiveBalance';

const dhiveClient = new dhive.Client([
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network",
]);

const HiveStats = () => {
    const [hivePrice, setHivePrice] = useState(0);
    const [HBDprice, setHBDPrice] = useState(0);
    const [hivePower, setHivePower] = useState<string>("0");
    const [delegatedHivePower, setDelegatedHivePower] = useState<string>("0");
    const [hiveSavings, setHiveSavings] = useState<string>("0");
    const [hiveBalance, setHiveBalance] = useState<string>("0");
    const [conversionRate, setConversionRate] = useState(0);
    const [hbdbalance, setHbdbalance] = useState<string>("0");
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const convertVestingSharesToHivePower = async (
      vestingShares: string,
      delegatedVestingShares: string,
      receivedVestingShares: string
    ): Promise<{ hivePower: string; delegatedHivePower: string }> => {
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
    
      return { hivePower: vestHive.toFixed(3), delegatedHivePower: delegatedHivePower.toFixed(3) };
    };
    

    const fetchHiveStats = async () => {
      try {
          const account = await dhiveClient.database.getAccounts(["steemskate"]);
  
          const [conversionRate, hbdPrice, vestingSharesData] = await Promise.all([
              cache.conversionRate || fetchConversionRate(),
              cache.hbdPrice || fetchHbdPrice(),
              convertVestingSharesToHivePower(
                  account[0].vesting_shares.toString(),
                  account[0].delegated_vesting_shares.toString(),
                  account[0].received_vesting_shares.toString(),
              ),
          ]);
  
          const hiveWorth = parseFloat((account[0].balance as string).split(" ")[0]) * conversionRate;
          const hivePowerWorth = parseFloat(vestingSharesData.hivePower) * conversionRate;
          const delegatedHivePowerWorth = parseFloat(vestingSharesData.delegatedHivePower) * conversionRate;
          const hbdWorth = parseFloat((account[0].hbd_balance as string).split(" ")[0]) * hbdPrice;
          const savingsWorth = parseFloat((account[0].savings_hbd_balance as string).split(" ")[0]) * hbdPrice;
  
          const total = hiveWorth + hivePowerWorth + delegatedHivePowerWorth + hbdWorth + savingsWorth;
          setConversionRate(conversionRate);
          setHiveBalance(account[0].balance as string);
          setHiveSavings(account[0].savings_hbd_balance as string);
          setHbdbalance(account[0].hbd_balance as string);
          setHivePower(vestingSharesData.hivePower);
          setDelegatedHivePower(vestingSharesData.delegatedHivePower);
          setTotal(total);
          setIsLoading(false); // Set isLoading to false when data is fetched
      } catch (error) {
          console.error("Error fetching data:", error);
          setIsLoading(false); // Set isLoading to false on error as well
      }
  };
  

    useEffect(() => {
        fetchHiveStats();
    }, []);

    return (
        <Box
            borderRadius="12px"
            border="1px solid red"
            padding="10px"
            width="50%"
            margin="10px"
        >
            <VStack spacing={4} align="stretch">
                <Flex alignItems="center" justifyContent="center" padding="10px">
                    <Image
                        src={`https://cryptologos.cc/logos/hive-blockchain-hive-logo.png`}
                        borderRadius="20px"
                        boxSize="40px"
                    />
                    <Text
                        textAlign="center"
                        borderRadius="12px"
                        fontWeight="700"
                        fontSize="18px"
                        color="white"
                        padding="10px"
                    >
                        Hive Treasury
                    </Text>
                </Flex>
                <Divider backgroundColor="red" />

                {isLoading ? (
                    <Text color="white">Loading...</Text>
                ) : (
                    <>
                        <Flex alignItems="center" justifyContent="center">
                            <Text color="white">Wallet Worth: ${total.toFixed(2)}</Text>
                        </Flex>
                        <Divider backgroundColor="red" />
                        <HStack spacing={4} align="stretch">
                            <BalanceDisplay label="Hive" balance={hiveBalance} />
                            <BalanceDisplay label="Hive Power" balance={hivePower} />
                        </HStack>
                        <HStack spacing={4} align="stretch">
                            <BalanceDisplay label="Savings" balance={hiveSavings} />
                            <BalanceDisplay label="Hive Dollar" balance={hbdbalance} />
                        </HStack>
                        <HStack
                            margin="10px"
                            borderRadius="10px"
                            border="1px dashed orange"
                            justifyContent="center"
                            padding="10px"
                        >
                            <Image
                                src="https://images.ecency.com/u/hive-173115/avatar/large"
                                alt="Avatar"
                                width="20px"
                                height="20px"
                            />
                            <Text fontSize="16px">Witness: 1.7M</Text>
                        </HStack>
                    </>
                )}
            </VStack>
        </Box>
    );
};

const BalanceDisplay = ({ label, balance }: { label: string; balance: string }) => {
    return (
        <Box borderRadius="5px" border="1px solid red" width="50%" padding="10px">
            <Text color="white" fontWeight="bold">{label}</Text>
            <Text>{balance || "Try connecting your wallet and refreshing the page"}</Text>
        </Box>
    );
};

export default HiveStats;
