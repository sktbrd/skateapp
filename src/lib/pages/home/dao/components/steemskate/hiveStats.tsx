import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Image, VStack, HStack, Divider, Tooltip} from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import { fetchHbdPrice, fetchConversionRate } from 'lib/pages/wallet/hive/hiveBalance';
import axios from 'axios';
import { cache } from 'lib/pages/wallet/hive/hiveBalance';
import { Link as ChakraLink } from "@chakra-ui/react";
const dhiveClient = new dhive.Client([
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network",
]);

// Define the prop type for the wallet
interface HiveStatsProps {
  wallet: string;
}

const HiveStats: React.FC<HiveStatsProps> = ({ wallet }) => {
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
          const account = await dhiveClient.database.getAccounts([wallet]);
  
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
  }, [wallet]);
  
    return (
        <Box
            borderRadius="12px"
            border="2px solid red"
            padding="10px"
            margin="10px"
            minWidth={"47.5%"}
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
                        <Text fontSize="2xl" fontWeight="bold" color="red">
  Total Worth: <Text style={{ fontSize: '48px' }}>${total.toFixed(2)}</Text>
</Text>
                        </Flex>
                        <Divider backgroundColor="red" />
                        <HStack spacing={4} align="stretch">
                            <BalanceDisplay 
                              label="Hive" 
                              balance={hiveBalance} 
                              labelTooltip="Native Token of Hive Blockchain"
                              balanceTooltip="Hive tokens are like digital coins on the Hive blockchain, and they have different uses. You can vote on stuff, get premium features, and help with the network and decision-making by staking them. They also reward content makers, keep users engaged, and you can trade them elsewhere. They basically keep Hive running, adding value and community vibes. 🛹🚀
                             " />
                            <BalanceDisplay 
                              label="Hive Power" 
                              balance={hivePower} 
                              labelTooltip="Hive Power signifies influence, voting, and status within Hive blockchain. 🚀🤝"
                              balanceTooltip="Hive Power represents a user's influence and engagement within the Hive blockchain. It's like your reputation and impact score on the platform. When you ´power up Hive tokens by converting liquid Hive into Hive Power, you increase your ability to vote on content and participate in network governance. This boosts your say in decision-making and supports the Hive ecosystem's stability and decentralization. It's like investing in your standing and community involvement on Hive. 🚀🤝s"
                              />
                        </HStack>
                        <HStack spacing={4} align="stretch">
                            <BalanceDisplay 
                              label="Dollar Savings" 
                              balance={hiveSavings} 
                              labelTooltip="Hive Savings are like a savings account for your HBD tokens. 🚀🤝"
                              balanceTooltip="Picture it like planting some Hive coins, but in this case, they're Hive Backed Dollars (HBD), kind of like specialized cannabis strains. You nurture them over time, and they steadily grow. With a 20% increase each year, it's like cultivating a thriving HBD garden. You're investing your time and care, and eventually, you'll have a bountiful harvest of HBD, just like some potent homegrown herb. So, you're tending to your HBD crop, man, and it's growing just as nicely as your favorite buds. 🌱💵🚀"
                              />
                            <BalanceDisplay 
                              label="Hive Dollar" 
                              balance={hbdbalance} 
                              labelTooltip="Hive Backed Dollar (HBD) is a stablecoin pegged to the US Dollar"
                              balanceTooltip="Hive Backed Dollars (HBD) are a stablecoin on the Hive blockchain designed to maintain a value close to one United States dollar. They are backed by Hive cryptocurrency held in a collateralized debt position. HBD provides users with a stable and reliable digital currency for transactions, making it a practical choice for everyday use within the Hive ecosystem." 
                              labelLink='https://giveth.io/es/project/skatehive-skateboarding-community'
                
                              />
                        </HStack>
                        <Tooltip 
                            bg="black" 
                            color="white" 
                            borderRadius="10px" 
                            border="1px dashed limegreen" 
                            label="Skatehive operates a Hive witness, a vital role ensuring network security and stability by producing blocks and validating transactions. Elected by the Hive community, witnesses like Skatehive are integral to decentralized governance, directly impacting the blockchain's functionality. You can show your support by voting for Skatehive as a witness">

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
                            <ChakraLink target="_blank" href="https://vote.hive.uno/@skatehive" fontSize="16px">Witness: 2.1M </ChakraLink>
                        </HStack>
                        </Tooltip>

                       <Tooltip 
                            bg="black" 
                            color="white" 
                            borderRadius="10px" 
                            border="1px dashed limegreen" 
                            label="A curation trail on Hive is like a way to automatically follow the voting choices of a trusted user. When they upvote content, your account does too, and you both earn rewards. It's akin to having a content curator or guide who selects valuable posts, and you get to benefit from their expertise without actively searching for content to upvote. You can adjust how closely you follow their votes, giving you some control over your engagement. You can follow our curation trail clicking in this link.">
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
                            <ChakraLink target="_blank" href="https://hive.vote/dash.php?i=1&trail=steemskate" fontSize="16px">Vote Trail: 37  </ChakraLink>
                        </HStack>
                        </Tooltip>
                    </>
                )}
            </VStack>
        </Box>
    );
};

export const BalanceDisplay = ({
  label,
  balance,
  labelTooltip,
  balanceTooltip,
  labelLink,
  balanceLink,
  labelStyle,
  balanceStyle,
}: {
  label: string;
  balance: string;
  labelTooltip?: string;
  balanceTooltip?: string;
  labelLink?: string;
  balanceLink?: string;
  labelStyle?: React.CSSProperties;
  balanceStyle?: React.CSSProperties;
}) => {
  return (
    <Box
      borderRadius="5px"
      border="1px solid red"
      width="100%"
      padding="10px"
      textAlign="center"
    >
      {labelTooltip ? (
        <Tooltip label={labelTooltip} bg="black" color="white" borderRadius="10px" border="1px dashed limegreen">
          {labelLink ? (
            <ChakraLink color="white" fontWeight="bold"  href={labelLink} isExternal style={labelStyle}>
              {label}
            </ChakraLink>
          ) : (
            <Text color="white" fontWeight="bold" cursor="pointer" style={labelStyle}>
              {label}
            </Text>
          )}
        </Tooltip>
      ) : (
        labelLink ? (
          <ChakraLink color="white" fontWeight="bold"  href={labelLink} isExternal style={labelStyle}>
            {label}
          </ChakraLink>
        ) : (
          <Text color="white" fontWeight="bold" style={labelStyle}>
            {label}
          </Text>
        )
      )}
      {balanceTooltip ? (
        <Tooltip label={balanceTooltip} bg="black" color="white" borderRadius="10px" border="1px dashed limegreen">
        {balanceLink ? (
            <ChakraLink href={balanceLink} isExternal style={balanceStyle}>
              {balance || "Loading..."}
            </ChakraLink>
          ) : (
            <Text style={balanceStyle}>{balance || "PEPE"}</Text>
          )}
        </Tooltip>
      ) : (
        balanceLink ? (
          <ChakraLink href={balanceLink} isExternal style={balanceStyle}>
            {balance || "PEPE"}
          </ChakraLink>
        ) : (
          <Text style={balanceStyle}>{balance || "Loading..."}</Text>
        )
      )}
    </Box>
  );
};

export default HiveStats;
