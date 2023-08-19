



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
//@ts-ignore
import { Pioneer } from "pioneer-react";


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
  const [address, setAddress] = useState("");
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [totalWorth, setTotalWorth] = useState<number>(0);



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenLogos, setTokenLogos] = useState({});
  const COINGECKO_API_KEY = 'CG-we5Z4KbdYMCgMUVAqDjQMWfc'; 

 

  useEffect(() => {
    console.log("pubkeyContext: ", pubkeyContext);
    setAddress(pubkeyContext.master || pubkeyContext.pubkey);
  }, [pubkeyContext]);

  const headers = ["Asset", "Balance", "Balance USD"];
  const { isOpen, onOpen, onClose } = useDisclosure();

  //const [tableData, setTableData] = useState<EvmBalanceItem[]>(user?.balances || []);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<TokenInfo | null>(null);
  const [userPortifolio, setUserPortifolio] = useState<any>(null);

  const onStart = async () => {
    try {
      if (api && app && address) {
        const currentAddress = pubkeyContext.master || pubkeyContext;
        const portfolio = await api.GetPortfolio({ address: currentAddress });
        for (let token of portfolio.data.tokens) {
          token.token.image = await fetchTokenLogo(token.token.coingeckoId);
        }
        setUserPortifolio(portfolio);
      }
    } catch (e) {
      console.error("Error in onStart:", e);
    }
  };
  
  useEffect(() => {
    onStart();
  }, [api, app, pubkeyContext, status, address]);
  
  


if (userPortifolio && userPortifolio.data) {
  console.log("userPortifolio.tokens:", userPortifolio);
}

  const blockchains: string[] = ["all"].concat(
    Array.from(new Set(userPortifolio?.data?.tokens.map((token: any) => token.network)))
  );


  const totalBalanceUSD = userPortifolio?.data?.totalBalanceUSDApp || 0;
  const totalBalanceUSDApp = userPortifolio?.data?.totalBalanceUSDApp || 0;
  const totalBalanceUsdTokens = userPortifolio?.data?.totalBalanceUsdTokens || 0;
  const totalNetWorth = userPortifolio?.data?.totalNetWorth || 0;
  

  const filteredTokens = selectedBlockchain === "all"
  ? userPortifolio?.data?.tokens
  : userPortifolio?.data?.tokens.filter((token: any) => token.network === selectedBlockchain);


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

  const fetchTokenLogo = async (coinId: string) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
        mode: 'no-cors', // Add this line
        headers: {
          'Authorization': `Bearer ${COINGECKO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.image.small; // or data.image.large based on your preference
    } catch (error) {
      console.error("Error fetching token logo:", error);
    }
  };
  
  

  return (
    <Box
      className="hive_box"
      borderRadius="12px"
      border="1px solid blue"
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
        Multichain Balance
      </Text>
      <Flex justifyContent={"space-between"}>
        <Stack spacing={3}>
          <Box>
            <h2>Total Balance (App):</h2>
            <p>{(userPortifolio?.data.totalBalanceUSDApp ?? 0).toFixed(2)} USD</p>
          </Box>
          <Box>
            <h2>Total Balance (Tokens):</h2>
            <p>{(userPortifolio?.data.totalBalanceUsdTokens ?? 0).toFixed(2)} USD</p>
          </Box>
          <Box>
            <h2>Total Net Worth:</h2>
            <p>{(userPortifolio?.data.totalNetWorth ?? 0).toFixed(2)} USD</p>
          </Box>
        </Stack>
        <Pioneer></Pioneer>
      </Flex>

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
      {filteredTokens && filteredTokens.length === 0 ? (
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
            {filteredTokens?.map((token: any) => ( 
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
