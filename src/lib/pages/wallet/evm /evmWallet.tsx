



import React, { useEffect, useState } from "react";
//@ts-ignore
import { usePioneer } from "pioneer-react"
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Select,
  Flex,
  Button,
  Text,
  useDisclosure,
  Stack
} from "@chakra-ui/react";
import EvmSendModal from "./evmSendModal";

interface TokenInfo {
  id: string;
  networkId: number;
  address: string;
  label: string;
  name: string;
  balance: string;
  balanceUSD: string;
  caip: string;
  canExchange: boolean;
  coingeckoId: string;
  context: string;
  contract: string;
  createdAt: string;
  dailyVolume: number;
  decimals: number;
  description: string;
  explorer: string;
  externallyVerified: boolean;
  hide: boolean;
  holdersEnabled: boolean;
  image: string;
  isToken: boolean;
  lastUpdated: number;
  marketCap: number;
  network: string;
  price: number;
  priceUpdatedAt: string;
  protocal: string;
  pubkey: string;
  source: string;
  status: string;
  symbol: string;
  totalSupply: string;
  updatedAt: string;
  verified: boolean;
  website: string;
}

interface EvmBalanceItem {
  id: string;
  image: string;
  name: string;
  balance: string;
  balanceUSD: string; // Change the type to string
  network: string;
  pubkey: string;
}

const EvmBalance: React.FC = () => {
  const { state, dispatch } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [address, setAddress] = useState("");
  
  const headers = ["Asset", "Balance", "Balance USD"];
  const { isOpen, onOpen, onClose } = useDisclosure();

  //const [tableData, setTableData] = useState<EvmBalanceItem[]>(user?.balances || []);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<TokenInfo | null>(null);
  const [userPortifolio, setUserPortifolio] = useState<any>([]); // Added default value as an empty array

  const onStart = async () => {
    console.log("onStart called"); // Check if the function is called
  
    try {
      console.log("API:", api); // Check the value of api
      console.log("APP:", app); // Check the value of app
  
      if (api && app) {
        const currentAddress = pubkeyContext.master || pubkeyContext.pubkey ;
        console.log("Current Address:", currentAddress); // Check the address value
  
        const portfolio = await api.GetPortfolio({ address: currentAddress });
        console.log("After API call"); // Check if the code reaches here after the API call
        
        setUserPortifolio(portfolio);
        console.log("PORTIFOLIO: ", portfolio);
      } else {
        console.log("API or APP is not available");
      }
    } catch (e) {
      console.error("Error in onStart:", e);
    }
  };
  
  

  useEffect(() => {
    onStart();
}, [api, app, pubkeyContext]);

console.log("userPortifolio.tokens:", userPortifolio.tokens); // Log the tokens array

// ... rest of the component

  



  // useEffect(() => {
  //   if (user?.balances) {
  //     let sortedBalances: EvmBalanceItem[] = [];
  //     if (selectedBlockchain === "all") {
  //       sortedBalances = user.balances.slice();
  //     } else {
  //       sortedBalances = user.balances.filter(
  //         (balance: EvmBalanceItem) => balance.network === selectedBlockchain
  //       );
  //     }

  //     // Sort the balances array in descending order based on balanceUSD
  //     sortedBalances.sort((a: EvmBalanceItem, b: EvmBalanceItem) =>
  //       parseFloat(b.balanceUSD) - parseFloat(a.balanceUSD)
  //     );

  //     setTableData(sortedBalances);
  //   }
  // }, [selectedBlockchain, user?.balances]);

  const blockchains: string[] = Array.from(
    new Set(userPortifolio.tokens?.map((token: any) => token.network))
  ) || [];
  blockchains.unshift("all");

  const totalBalanceUSD = userPortifolio.totalBalanceUSDApp || 0;
  const totalBalanceUSDApp = userPortifolio.totalBalanceUSDApp || 0;
  const totalBalanceUsdTokens = userPortifolio.totalBalanceUsdTokens || 0;
  const totalNetWorth = userPortifolio.totalNetWorth || 0;



  const copyToClipboard = (address: string): void => {
    const textarea = document.createElement("textarea");
    textarea.value = address;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert(address + " copied to clipboard!");
  };

  const handleSendButtonClick = (tokenInfo: TokenInfo): void => {
    setSelectedTokenInfo(tokenInfo);
    setIsModalOpen(true);
  };

  return (
    <Box
      className="hive_box"
      borderRadius="12px"
      border="1px solid limegreen"
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
        EVM Balance
      </Text>

      <Stack spacing={3}>
        <Box>
          <h2>Total Balance (App):</h2>
          <p>{userPortifolio?.totalBalanceUSDApp?.toFixed(2) || "0.00"} USD</p>
        </Box>
        <Box>
          <h2>Total Balance (Tokens):</h2>
          <p>{userPortifolio?.totalBalanceUsdTokens?.toFixed(2) || "0.00"} USD</p>
        </Box>
        <Box>
          <h2>Total Net Worth:</h2>
          <p>{userPortifolio?.totalNetWorth?.toFixed(2) || "0.00"} USD</p>
        </Box>
      </Stack>

      <Flex align="center">
        <Select
          value={selectedBlockchain}
          onChange={(e) => setSelectedBlockchain(e.target.value)}
          ml="auto"
          w="150px"
        >
          {blockchains.map((blockchain) => (
            <option key={blockchain} value={blockchain}>
              {blockchain === "all" ? "All Blockchains" : blockchain}
            </option>
          ))}
        </Select>
      </Flex>
      {userPortifolio.tokens && userPortifolio.tokens.length === 0 ? (
        <p>No balances found for the selected blockchain. Try to connect wallet again</p>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {headers.map((header, index) => (
                <Th key={index}>{header}</Th>
              ))}
              <Th>Receive</Th>
              <Th>Send</Th>
            </Tr>
          </Thead>
          <Tbody>
            {userPortifolio.data?.tokens?.map((token: any) => (
              <Tr key={token.key}>
                <Td>
                  <Image src={token.token.image} alt={token.token.name} boxSize="20px" mr="2" />
                  {token.token.name}
                </Td>
                <Td>{parseFloat(token.token.balance).toFixed(3)}</Td>
                <Td>{parseFloat(token.token.balanceUSD).toFixed(2)}</Td>
                <Td>
                  <Button border="1px solid limegreen" onClick={() => copyToClipboard(token.address)}>Receive</Button>
                </Td>
                <Td>
                  <Button border="1px solid limegreen" onClick={() => handleSendButtonClick(token.token)}>
                    Send
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <EvmSendModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tokenInfo={selectedTokenInfo} />
    </Box>
);


};

export default EvmBalance;
