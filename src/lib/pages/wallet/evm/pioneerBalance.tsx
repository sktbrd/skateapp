// Import necessary modules and components
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Text, Table, Td, Tbody, Flex, Image, Button, Grid, GridItem, Center } from '@chakra-ui/react';
import { formatWalletAddress } from 'lib/pages/utils/formatWallet';

interface TokenInfo {
  address: string;
  assetCaip: string;
  blockchainCaip: string;
  key: string;
  network: string;
  token: {
    address: string;
    balance: number;
    balanceRaw: string;
    balanceUSD: number;
    canExchange: boolean;
    coingeckoId: string;
    createdAt: string;
    dailyVolume: number;
    decimals: number;
    externallyVerified: boolean;
    hide: boolean;
    holdersEnabled: boolean;
    id: string;
    label: string;
    marketCap: number;
    name: string;
    networkId: number;
    price: number;
    priceUpdatedAt: string;
    status: string;
    symbol: string;
    totalSupply: string;
    updatedAt: string;
    verified: boolean;
  };
}

interface PortfolioPageProps {
  wallet_address: string;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ wallet_address }) => {
  const [tokens, setTokens] = useState<TokenInfo['token'][] | null>(null);
  const [totalNetWorth, setTotalNetWorth] = useState<number | null>(null);
  const [totalBalanceUsdTokens, setTotalBalanceUsdTokens] = useState<number | null>(null);
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [ethBalanceInUsd, setEthBalanceInUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nftvalue, setNftValue] = useState<number | null>(null);
  const [nftFormattedValue, setNftFormattedValue] = useState<number | null>(null);



  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!wallet_address) {
          console.error("Wallet prop is undefined or null");
          return;
        }

        const response = await axios.get(`https://swaps.pro/api/v1/portfolio/${wallet_address}`);
        const pubkeyBalanceResponse = await axios.get(`https://pioneers.dev/api/v1/getPubkeyBalance/ETH/${wallet_address}`);
        setEthBalance(pubkeyBalanceResponse.data);
        setTotalNetWorth(response.data.totalNetWorth);
        setNftValue(Number(response.data.nftUsdNetWorth[wallet_address]));

        setTotalBalanceUsdTokens(response.data.totalBalanceUsdTokens);
        const sortedTokens = response.data.tokens.map((token: TokenInfo) => token.token).sort((a: any, b: any) => b.balanceUSD - a.balanceUSD);
        setTokens(sortedTokens);
        setLoading(false); // Set loading to false after fetching data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [wallet_address]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
        setEthPrice(response.data.ethereum.usd);
  
        if (ethBalance !== null) {
          const ethBalanceInUsd = ethBalance * response.data.ethereum.usd;
          setEthBalanceInUsd(ethBalanceInUsd);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [ethBalance, totalNetWorth, ethPrice]); // Include ethPrice in the dependencies
  


  const [copyStatus, setCopyStatus] = useState<boolean>(false);

  function handleCopy(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const textToCopy = formatWalletAddress(wallet_address);

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopyStatus(true);
        alert("Copied to clipboard");
        setTimeout(() => {
          setCopyStatus(false);
        }, 2000);
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        setCopyStatus(false);
      });
  }

  useEffect(() => {
    if (ethBalance !== null && ethPrice !== null){
        setEthBalanceInUsd(ethBalance * ethPrice);

    }}
    , [ethPrice, ethBalance]);
    
  return (
    <Flex flexDirection={"column"}>
    <Box
  border={"1px solid #7CC4FA"}
  borderRadius={"10px"}
  p={4}
  boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
  margin="auto"
  background="#002240"
  minWidth={["100%", "100%", "100%", "100%"]}
>
  <Center> {/* Center component to horizontally center the content */}
    <Box marginRight={"5%"}>
      <Image src="/assets/cryptopepe.png" alt="Swaps Logo" width="200px" borderRadius="10px" />
    </Box>

    <Box>
      <Box marginBottom={2}>
        <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
          Wallet address
        </Text>
        <Button p={0} bg={"transparent"} onClick={handleCopy}>
          <Text color="#FFA500" fontSize="18px" marginLeft="5px">
            {formatWalletAddress(wallet_address)}
          </Text>
        </Button>

      </Box>

      {!loading && (
        <Grid templateColumns="repeat(1, 1fr)" gap={4}>
          <GridItem>
            <Box>
              <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                Total Balance
              </Text>
              <Text color="#FFA500" fontSize="18px" marginLeft="5px">
                {totalNetWorth?.toFixed(2)} USD
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box>
              <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                ETH Balance
              </Text>
              <Text color="#FFA500" fontSize="18px" marginLeft="5px">
                {ethBalance?.toFixed(5)} ETH
              </Text>
            </Box>
          </GridItem>

          <GridItem>
            <Box>
              <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                NFTs Value
              </Text>
              <Text color="#FFA500" fontSize="18px" marginLeft="5px">
              {nftvalue?.toFixed(2)} USD
              </Text>
            </Box>
          </GridItem>
        </Grid>
      )}
    </Box>

    <Box marginLeft={"5%"}>
      <Image
        src="/assets/cryptopepe.png"
        alt="Swaps Logo"
        width="200px"
        borderRadius="10px"
        style={{ transform: 'scaleX(-1)' }}
      />
    </Box>
  </Center>
</Box>

      <Box
        border={"1px solid #7CC4FA"}
        borderRadius={"10px"}
        p={2}
        display="flex"
        alignItems="center"
        boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
        margin="auto"
        background="#002240"
        minWidth={["100%", "100%", "100%", "100%"]}
      >
        <Table>
          <Tbody>
            <tr>
              <Td>
                <Text fontWeight="bold">Asset</Text>
              </Td>
              <Td>
                <Text fontWeight="bold">Balance</Text>
              </Td>
              <Td>
                <Text fontWeight="bold">Balance USD</Text>
              </Td>
            </tr>
            {tokens?.map((token, index: number) => (
              <tr key={index}>
                <Td>
                  <Text fontWeight="bold">{token.symbol}</Text>
                </Td>
                <Td>
                  <Text fontWeight="bold">{token.balance?.toFixed(4)}</Text>
                </Td>
                <Td>
                  <Text fontWeight="bold">{token.balanceUSD?.toFixed(2)}</Text>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default PortfolioPage;
