import { Image, Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import * as dhive from "@hiveio/dhive";

const dhiveClient = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

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


    
  const isUserCool = () => {
    return totalWorth > 1000;
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
      {isUserCool() && <Text color="limegreen">You're cool! 😎</Text>}
    </Box>
  );
}
