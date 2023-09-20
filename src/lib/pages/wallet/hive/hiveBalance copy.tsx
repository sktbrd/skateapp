import { Image, Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Button, VStack, HStack, Divider, Tooltip } from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";

import { useState, useEffect } from "react";
import SendHiveModal from "./sendHiveModal";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import * as dhive from "@hiveio/dhive";

import FiatBalance from "../fiat/fiat";

const dhiveClient = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

const HIVE_LOGO_URL = "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";
const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

interface User {
  balance: string;
  hbd_balance: string;
  savings_hbd_balance: string;
  vesting_shares: string;
  delegated_vesting_shares: string;
  received_vesting_shares: string;
  name?: string;
}

// send to utils.tsx
// Create a caching object
export const cache: { conversionRate?: number, hbdPrice?: number } = {};

export function resetCache() {
  cache.conversionRate = undefined;
  cache.hbdPrice = undefined;
  console.log("Cache reset");


}
// send to utils.tsx
export async function fetchHbdPrice() {
  try {
    if (cache.hbdPrice !== undefined) {
      // Use the cached value if available
      console.log("Using cached HBD price:", cache.hbdPrice);
      return cache.hbdPrice;
    }
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd");
    const data = await response.json();
    const hbdPrice = data.hive_dollar.usd;
    // Update the cache
    cache.hbdPrice = hbdPrice;
    console.log("Fetched new HBD price:", hbdPrice);
    return hbdPrice;
  } catch (error) {
    console.error("Error fetching HBD price:", error);
    return 0;
  }
};

// send to utils.tsx
export async function fetchConversionRate() {
  try {
    if (cache.conversionRate !== undefined) {
      // Use the cached value if available
      console.log("Using cached conversion rate:", cache.conversionRate);
      return cache.conversionRate;
    }
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd");
    const data = await response.json();
    const conversionRate = data.hive.usd;
    console.log("Fetched new conversion rate:", conversionRate);
    // Update the cache
    cache.conversionRate = conversionRate;
    return conversionRate; // Return the conversion rate as a number
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    return 0;
  }
};

export default function HiveBalanceDisplay2() {
  const { user } = useAuthUser() as { user: User | null };
  const [hiveBalance, setHiveBalance] = useState<string>("0");
  const [hivePower, setHivePower] = useState<string>("0");
  const [hbdBalance, setHbdBalance] = useState<string>("0");
  const [savingsBalance, setSavingsBalance] = useState<string>("0");
  const [showModal, setShowModal] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);




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

  

  const onStart = async function () {
    if (user) {
      try {
        const [conversionRate, hbdPrice, vestingSharesData] = await Promise.all([
          fetchConversionRate(),
          fetchHbdPrice(),
          convertVestingSharesToHivePower(
            user.vesting_shares,
            user.delegated_vesting_shares,
            user.received_vesting_shares
          ),
        ]);
  
        const hiveWorth = parseFloat(user.balance.split(" ")[0]) * conversionRate;
        const hivePowerWorth =
          (parseFloat(vestingSharesData.hivePower) + parseFloat(vestingSharesData.delegatedHivePower)) *
          conversionRate;
        const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
        const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;
  
        const total = hiveWorth + hivePowerWorth + hbdWorth + savingsWorth;
        setConversionRate(conversionRate);
        setHbdBalance(user.hbd_balance);
        setHiveBalance(user.balance);
        setSavingsBalance(user.savings_hbd_balance);
        setHivePower(`${vestingSharesData.hivePower} + ${vestingSharesData.delegatedHivePower} (delegated)`);
        setTotalWorth(total);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };
  
  useEffect(() => {
    onStart();
  }, [user]);
  

  useEffect(() => {
    onStart();
  }, [user]);

  const handleTransfer = async () => {
    console.log("user wants to transfer")
  };

  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault(); // Prevent the default button click behavior
    console.log(user);
    setShowModal(true);
    console.log(showModal)
  };
  

  const handleLogoClick = (balanceType: string) => {
    console.log(`Clicked ${balanceType} logo`);
    console.log(user);
  };
  
  return (
    <Box
        borderRadius="12px"
        border="2px solid red"
        padding="10px"
        width={['100%', '100%']} // Set width to 100% on mobile, 50% on other screen sizes
    >
        <VStack spacing={4} align="stretch">
            <Flex alignItems="center" justifyContent="center" padding="10px">
            <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {user ? (
          <>
            <Image
              src={`https://images.hive.blog/u/${user.name}/avatar`}
              alt="profile avatar"
              borderRadius="20px"
              border="2px solid limegreen"
              boxSize="80px"
            />
            <Text fontSize="32px" padding="10px" color="white">
              {user.name}
            </Text>
          </>
        ) : (
          <>
            <Image
              src={DEFAULT_AVATAR_URL}
              alt="pepito"
              borderRadius="20px"
              boxSize="60px"
            />
          </>
        )}
      </Box>

            </Flex>
            <Divider backgroundColor="red" />

            {isLoading ? (
                <Text color="white">Loading...</Text>
            ) : (
                <>
                    <Flex alignItems="center" justifyContent="center">
                        <Text fontWeight="bold" color="orange">Wallet Wortth: ${totalWorth.toFixed(2)}</Text>
                    </Flex>
                    <Divider backgroundColor="red" />
                    <HStack spacing={4} align="stretch">
                        <BalanceDisplay 
                          label="Hive" 
                          balance={hiveBalance} 
                          labelTooltip="Native Token of Hive Blockchain"
                          balanceTooltip="Hive tokens are like digital coins on the Hive blockchain, and they have different uses. You can vote on stuff, get premium features, and help with the network and decision-making by staking them. They also reward content makers, keep users engaged, and you can trade them elsewhere. They basically keep Hive running, adding value and community vibes. 🛹🚀
                         " ></BalanceDisplay>
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
                          balance={savingsBalance} 
                          labelTooltip="Hive Savings are like a savings account for your HBD tokens. 🚀🤝"
                          balanceTooltip="Picture it like planting some Hive coins, but in this case, they're Hive Backed Dollars (HBD), kind of like specialized cannabis strains. You nurture them over time, and they steadily grow. With a 20% increase each year, it's like cultivating a thriving HBD garden. You're investing your time and care, and eventually, you'll have a bountiful harvest of HBD, just like some potent homegrown herb. So, you're tending to your HBD crop, man, and it's growing just as nicely as your favorite buds. 🌱💵🚀"
                          />
                        <BalanceDisplay 
                          label="Hive Dollar" 
                          balance={hbdBalance} 
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
                        <ChakraLink target="_blank" href="https://vote.hive.uno/@skatehive" fontSize="16px">Buy HIVE </ChakraLink>
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
                        <ChakraLink target="_blank" href="https://hive.vote/dash.php?i=1&trail=steemskate" fontSize="16px">Sell Hive  </ChakraLink>
                    </HStack>
                    </Tooltip>
                    <Button                         margin="10px"
                        borderRadius="10px"
                        border="1px dashed yellow"
                        justifyContent="center"
                        padding="10px" onClick={handleOpenModal}>
                            SEND
                          </Button>
                </>
            )}
        </VStack>
        <SendHiveModal
        showModal={showModal}
        setShowModal={setShowModal}
        toAddress={toAddress}
        setToAddress={setToAddress}
        amount={amount}
        setAmount={setAmount}
        handleTransfer={handleTransfer}
      />
    </Box>
    
    
);
};

const BalanceDisplay = ({
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
  width="50%"
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
  
  
  

