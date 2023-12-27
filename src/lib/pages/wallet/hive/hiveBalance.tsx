import { Image, Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Button, VStack, HStack, Divider, Tooltip, Badge, Grid, GridItem, Center } from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";

import { useState, useEffect } from "react";
import SendHiveModal from "./sendHiveModal";
import SendHBDModal from "./sendHBDmodal";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import * as dhive from "@hiveio/dhive";
// import WalletTransactions from "lib/pages/home/dao/components/hiveGnars/txHistory";
import PowerUpModal from "./powerUpModal";
import PowerDownModal from "./powerDownModal";
import DelegationModal from "./delegationModal";
import { useFetcher } from "react-router-dom";


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
  posting_json_metadata?: string;
  metadata: any;
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


const styles = `
  @keyframes glow {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }
`;

export async function fetchHbdPrice() {
  try {
    if (cache.hbdPrice !== undefined) {
      // Use the cached value if available
      return cache.hbdPrice;
    }

    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd");

    if (response.status !== 200) {
      // Set hbdPrice to 1.00 if the response status is not 200
      cache.hbdPrice = 1.00;
      return 1.00;
    }

    const data = await response.json();
    const hbdPrice = data.hive_dollar.usd;

    // Update the cache
    cache.hbdPrice = hbdPrice;
    return hbdPrice;
  } catch (error) {
    console.log("Error fetching HBD price:");
    // Set hbdPrice to 1.00 in case of an error
    cache.hbdPrice = 1.00;
    return 1.00;
  }
};


// send to utils.tsx
export async function fetchConversionRate() {
  try {
    if (cache.conversionRate !== undefined) {
      // Use the cached value if available
      return cache.conversionRate;
    }

    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd");

    if (response.status !== 200) {
      // Set conversionRate to 0.35 if the response status is not 200
      cache.conversionRate = 0.350;

      return 0.350;
    }

    const data = await response.json();
    const conversionRate = data.hive.usd;
    // Update the cache
    cache.conversionRate = conversionRate;
    return conversionRate; // Return the conversion rate as a number
  } catch (error) {
    console.log("Error fetching conversion rate");
    // Set conversionRate to 0.00 in case of an error
    cache.conversionRate = 0.350;
    return 0.350;
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
  const [conversionRate, setConversionRate] = useState<number>(0.000);
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hiveMemo, setHiveMemo] = useState("");
  const [showPowerUpModal, setShowPowerUpModal] = useState(false);
  const [showPowerDownModal, setShowPowerDownModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [sendHBDmodal, setSendHBDmodal] = useState(false);
  const [ownedTotal, setOwnedTotal] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string>("https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif");
  const [delegatedToUserInUSD, setDelegatedToUserInUSD] = useState<string>("0");
  const [HPdelegatedToUser, setHPdelegatedToUser] = useState<string>("0");
  const [showOptions, setShowOptions] = useState(false); // State to track whether to show additional options or not

  const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
  ) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    const availableVESTS = vestingSharesFloat - delegatedVestingSharesFloat;

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

    const DelegatedToSomeoneHivePower =
      (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);

    const delegatedToUserInUSD = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);
    const HPdelegatedToUser = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);
    return {
      hivePower: vestHive.toFixed(3),
      DelegatedToSomeoneHivePower: DelegatedToSomeoneHivePower.toFixed(3),
      delegatedToUserInUSD: delegatedToUserInUSD.toFixed(3),
      HPdelegatedToUser: HPdelegatedToUser.toFixed(3),
    };

  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        try {
          const metadata = JSON.parse(user.posting_json_metadata || '');
          setProfileImage(metadata.profile.profile_image);
        } catch (error) {
          console.error('Error parsing JSON metadata:', error);
        }
      }
    };
    fetchProfileImage();
  }
    , [user]);


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
          (parseFloat(vestingSharesData.hivePower) + parseFloat(vestingSharesData.DelegatedToSomeoneHivePower)) *
          conversionRate;
        const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
        const delegatedToUserInUSD = parseFloat(vestingSharesData.delegatedToUserInUSD) * conversionRate;
        const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;
        const HPdelegatedToUser = parseFloat(vestingSharesData.HPdelegatedToUser)
        const total = hiveWorth + hivePowerWorth + hbdWorth + savingsWorth + delegatedToUserInUSD;
        const total_Owned = Number(hiveWorth) + Number(savingsWorth) + Number(hbdWorth) + Number(hivePowerWorth);
        setConversionRate(conversionRate);
        setHbdBalance(user.hbd_balance);
        setHiveBalance(user.balance);
        setSavingsBalance(user.savings_hbd_balance);
        setHivePower(`${vestingSharesData.DelegatedToSomeoneHivePower} (delegated to others)  + ${vestingSharesData.hivePower} (self delegated)`);
        setTotalWorth(total);
        setIsLoading(false);
        setOwnedTotal(total_Owned);
        setDelegatedToUserInUSD(`${delegatedToUserInUSD.toFixed(3).toString()} USD worth in HP`);
        setHPdelegatedToUser(`${HPdelegatedToUser.toFixed(3).toString()} HP delegated to you`);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    onStart();
  }, [user]);


  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault(); // Prevent the default button click behavior
    setShowModal(true);
  };

  const handleLogoClick = (balanceType: string) => {
  };
  const handleOpenPowerUpModal = () => {
    setShowPowerUpModal(true);
  };
  const handleOpenPowerDownModal = () => {
    setShowPowerDownModal(true);
  };
  const handleOpenDelegationModal = () => {
    setShowDelegationModal(true);
  };
  const handleOpenSendHBDModal = () => {
    setSendHBDmodal(true);
  }

  const handleShowOptions = () => {
    setShowOptions(!showOptions); // Toggle the showOptions state
  };

  return (
    <Box
      borderRadius="12px"
      border="2px solid red"
      padding="0px"
      maxWidth={{ base: "100%", md: "100%" }}
      style={{ textAlign: "right" }}
      p={"4px"}
    >

      <Grid
        templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
        gridTemplateRows={'50px 1fr 30px'}
        gridTemplateColumns={'150px 1fr'}
        h='200px'
        gap='1'
        color='blackAlpha.700'
        fontWeight='bold'
      >
        <GridItem pl='4' bg='red.300' area={'header'} borderRadius={"10px"}>
          <Center>
            <HStack>
              <Image
                src={HIVE_LOGO_URL}
                alt="Hive Logo"
                width="40px"
                height="40px"
              />
              {user ? (
                <Text fontSize="32px" color="black">
                  {user.name}
                </Text>

              ) : (
                <Text fontSize="32px" color="black">
                  Login to See your Balance
                </Text>
              )}

            </HStack>
          </Center>
          <br />

          <Text fontSize={"18px"} fontWeight="bold" color="white" padding={"10px"}>
            Hive Price: <Badge variant='outline' fontSize={"24px"} colorScheme="red"> ${conversionRate.toFixed(3)}</Badge>
          </Text>
        </GridItem>
        <GridItem pl='2' area={'nav'}>
          <br />

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
          >

            {user ? (
              <Flex>
                <VStack>
                  <Image
                    src={profileImage}
                    alt="profile avatar"
                    borderRadius="20px"
                    border="2px solid limegreen"
                  />

                </VStack>

              </Flex>
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
        </GridItem>
        <GridItem pl='2' area={'main'}>
          <br />

          <Center>
            <VStack align="end" >

              <Text fontSize={"18px"} fontWeight="bold" color="orange">
                You Own: <Badge borderRadius={"10px"} fontSize={"32px"} colorScheme="green"> ${ownedTotal.toFixed(2)}</Badge>
              </Text>


              <Text fontSize={"18px"} fontWeight="bold" color="orange" >
                Wallet Worth:  <Badge borderRadius={"10px"} fontSize={"32px"} colorScheme="green"> ${totalWorth.toFixed(2)}</Badge>
              </Text>
            </VStack>

          </Center>
        </GridItem>
        <GridItem pl='2' area={'footer'}>
          <Button
            borderRadius="5px"
            border="1px solid red"
            justifyContent="center"
            color={"white"}
            padding="10px"
            m={"10px"}
            maxW={"40%"}
            alignSelf={"end"}
            onClick={handleShowOptions}
            variant={"outline"}
          >
            {showOptions ? "Hide Options" : "Show Options"}
          </Button>

        </GridItem>


      </Grid>

      <br />
      <br />

      <VStack spacing={4} align="stretch">




        {showOptions && (
          <>
            <VStack>
              <Button
                width="60%"
                borderRadius="10px"
                border="1px solid yellow"
                justifyContent="center"
                bg={"black"}
                color={"white"}
                _hover={{ bg: "limegreen" }}
                onClick={handleOpenPowerUpModal}
              >
                🔺 Power Up
              </Button>
              <Button
                width="60%"
                borderRadius="10px"
                border="1px solid yellow"
                justifyContent="center"
                bg={"black"}
                color={"white"}
                _hover={{ bg: "red" }}
                onClick={handleOpenPowerDownModal}
              >
                🔻 Power Down
              </Button>

            </VStack>
            <>

              <HStack spacing={4} align="stretch">
                <BalanceDisplay
                  label="Hive"
                  balance={hiveBalance}
                  labelTooltip="Native Token of Hive Blockchain"
                  balanceTooltip="Hive tokens are like digital coins on the Hive blockchain, and they have different uses. You can vote on stuff, get premium features, and help with the network and decision-making by staking them. They also reward content makers, keep users engaged, and you can trade them elsewhere. They basically keep Hive running, adding value and community vibes. 🛹🚀"
                ></BalanceDisplay>
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
              <BalanceDisplay
                label="Delegated to You"
                balance={HPdelegatedToUser}
                labelTooltip="How much HivePower People is delegating to You 🚀🤝"

              ></BalanceDisplay>

              <Tooltip
                bg="black"
                color="white"
                borderRadius="10px"
                border="1px dashed limegreen"
                label="Buy hive using other crypto"
              >
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
                  <ChakraLink target="_blank" href="https://simpleswap.io/" fontSize="16px">Buy HIVE </ChakraLink>
                </HStack>
              </Tooltip>

              <Tooltip
                bg="black"
                color="white"
                borderRadius="10px"
                border="1px dashed limegreen"
                label="Dont! power up!"
              >
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
                  <ChakraLink target="_blank" href="https://simpleswap.io/" fontSize="16px">Sell Hive  </ChakraLink>
                </HStack>
              </Tooltip>
              <Button
                margin="10px"
                borderRadius="10px"
                border="1px dashed yellow"
                justifyContent="center"
                padding="10px" onClick={handleOpenModal}>
                SEND HIVE
              </Button>
              <Button
                margin="10px"
                borderRadius="10px"
                border="1px dashed yellow"
                justifyContent="center"
                padding="10px" onClick={handleOpenSendHBDModal}>
                SEND HBD
              </Button>
              <Button
                margin="10px"
                borderRadius="10px"
                border="1px dashed yellow"
                justifyContent="center"
                padding="10px"
                onClick={handleOpenDelegationModal}
              >
                👑 Delegate Hive Power to SkateHive 👑
              </Button>
            </>
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
        hiveMemo={hiveMemo} // Make sure to pass hiveMemo here
        setHiveMemo={setHiveMemo}
      />
      <SendHBDModal
        showModal={sendHBDmodal}
        setShowModal={setSendHBDmodal}
        toAddress={toAddress}
        setToAddress={setToAddress}
        amount={amount}
        setAmount={setAmount}
        hiveMemo={hiveMemo} // Make sure to pass hiveMemo here
        setHiveMemo={setHiveMemo}
      />

      {/* <WalletTransactions wallet={user?.name || ""} /> */}
      <PowerUpModal isOpen={showPowerUpModal} onClose={() => setShowPowerUpModal(false)} user={user} />
      <PowerDownModal isOpen={showPowerDownModal} onClose={() => setShowPowerDownModal(false)} user={user} />
      <DelegationModal isOpen={showDelegationModal} onClose={() => setShowDelegationModal(false)} user={user} />
    </Box >
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
      width="100%"
      padding="10px"
      textAlign="center"
    >
      {labelTooltip ? (
        <Tooltip label={labelTooltip} bg="black" color="white" borderRadius="10px" border="1px dashed limegreen">
          {labelLink ? (
            <ChakraLink color="white" fontWeight="bold" href={labelLink} isExternal style={labelStyle}>
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
          <ChakraLink color="white" fontWeight="bold" href={labelLink} isExternal style={labelStyle}>
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




