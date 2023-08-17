import { Image, Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import SendHiveModal from "./sendHiveModal";
import useAuthUser from "./useAuthUser";
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

export default function HiveBalanceDisplay() {
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

  const fetchConversionRate = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd");
      const data = await response.json();
      const conversionRate = data.hive.usd;
      console.log("HIVE: ", conversionRate);
      return conversionRate; // Return the conversion rate as a number
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
      return 0;
    }
  };
  
  const fetchHbdPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd");
      const data = await response.json();
      return data.hive_dollar.usd;
    } catch (error) {
      console.error("Error fetching HBD price:", error);
      return 0;
    }
  };

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

  const handleOpenModal = (balanceType: string) => {
    console.log(`Clicked ${balanceType} logo`);
    console.log(user);
    setShowModal(true);
  };

  const handleLogoClick = (balanceType: string) => {
    console.log(`Clicked ${balanceType} logo`);
    console.log(user);
  };
  
  return (
    <Box
      className="hive_box"
      borderRadius="12px"
      border="1px solid red"
      padding="10px"
      overflow="auto"
      fontFamily="'Courier New', monospace"
    >
      {/* <FiatBalance totalWorth={totalWorth} /> */}

      <Text
        textAlign="center"
        borderRadius="12px"
        fontWeight="700"
        fontSize="18px"
        color="limegreen"
        padding="10px"
      >
        Hive Balance
      </Text>
      <Flex alignItems="center" justifyContent="left" padding="10px">
        {user ? (
          <>
            <Image
              src={`https://images.hive.blog/u/${user.name}/avatar`}
              alt="profile avatar"
              borderRadius="20px"
              border="2px solid limegreen"
              boxSize="40px"
            />
            <Text padding="10px" color="limegreen">
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
      </Flex>
      <Text>Total Worth in USD: ${totalWorth.toFixed(2)}</Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <Button border={"1px solid red"} onClick={() => handleOpenModal("Hive")}>
                <Image src={HIVE_LOGO_URL} alt="Hive Logo" boxSize="40px" />
                <Text padding={"10px"}>Manage HIVE</Text>
              </Button>
            </Td>
            <Td>{hiveBalance || "Try Connect your wallet and refresh the page"} </Td>
          </Tr>
          <Tr>
            <Td>
              <Button border={"1px solid red"} onClick={() => handleOpenModal("Hive Power")}>
                <Image src={HIVE_POWER_LOGO_URL} alt="Hive Power Logo" boxSize="40px" />
                <Text padding={"10px"}>Manage HP</Text>
              </Button>
            </Td>
            <Td>{hivePower || "Try Connect your wallet and refresh the page"} HP</Td>
          </Tr>
          <Tr>
            <Td>
              <Button border={"1px solid red"} onClick={() => handleOpenModal("HBD")}>
                <Image src={HBD_LOGO_URL} alt="HBD Logo" boxSize="40px" />
                <Text padding={"10px"}>Manage HBD</Text>
              </Button>
            </Td>
            <Td>{hbdBalance || "Try Connect your wallet and refresh the page"} </Td>
          </Tr>
          <Tr>
            <Td>
              <Button border={"1px solid red"} onClick={() => handleOpenModal("Savings")}>
                <Image src={SAVINGS_LOGO_URL} alt="Savings Logo" boxSize="40px" />
                <Text padding={"10px"}>Manage Sav.</Text>
              </Button>
            </Td>
            <Td>{savingsBalance || "Try Connect your wallet and refresh the page"} Savings</Td>
          </Tr>
        </Tbody>
      </Table>
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
}

