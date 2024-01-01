import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Text, Table, Td, Tr, Tbody, Flex, Image, Button, Grid, GridItem, Center, Tooltip, Badge } from '@chakra-ui/react';
import { formatWalletAddress } from 'lib/pages/utils/formatWallet';
import EvmSendModal2 from './evmSendModal2';
import { ethers } from "ethers";

interface TokenInfo {
  address: string;
  assetCaip: string;
  blockchainCaip: string;
  key: string;
  network: string;
  token: {
    address: string;
    balance: number;
    network: string;
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

const networkDetails = [
  { id: 1, name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029', color: 'blue.200' },
  { id: 12, name: 'Polygon', logo: 'assets/polygon.png', color: 'purple.200' },
  { id: 8, name: 'Gnosis', logo: '/assets/gnosis.png', color: 'green.200' },
  { id: 4, name: 'Binance Smart Chain', logo: 'assets/bsc.png', color: 'yellow.200' },
  { id: 11, name: 'Optimism', logo: 'assets/optimism.png', color: 'red' },
  { id: 7, name: 'Fantom', logo: 'assets/fantom.png', color: 'blue.100' },
  { id: 16, name: 'Base', logo: 'assets/base.png', color: '#FFFFFF' },
  { id: 2, name: 'Arbitrum', logo: 'assets/arbitrum.png', color: 'blue.800' },

];

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
  const [selectedToken, setSelectedToken] = useState<TokenInfo['token'] | null>(null);
  const [ensAddress, setENSAddress] = useState<string | null>(null);

  const handleTokenClick = (token: TokenInfo['token']) => {
    setSelectedToken(token);
    console.log(token)
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!wallet_address) {
          console.error("Wallet prop is undefined or null");
          return;
        }

        const response = await axios.get(`https://pioneers.dev/api/v1/portfolio/${wallet_address.toUpperCase()}`);
        const pioneer_ethereum_balance = await axios.get('https://pioneers.dev/api/v1/getPubkeyBalance/ethereum/' + wallet_address);
        // test if user address has a ENS domain name and if so, use that instead of the wallet address, use alchemy provider 

        const providerUrl = "https://eth-mainnet.g.alchemy.com/v2/w_vXc_ypxkmdnNaOO34pF6Ca8IkIFLik";
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);

        const ensResponse = await provider.lookupAddress(wallet_address)
        console.log(ensResponse)
        setENSAddress(ensResponse);


        setEthBalance((pioneer_ethereum_balance.data).toFixed(6));
        setTotalNetWorth(response.data.totalNetWorth);
        setNftValue(Number(response.data.nftUsdNetWorth[wallet_address]));
        setTotalBalanceUsdTokens(response.data.totalBalanceUsdTokens);

        // Sort tokens by networkId
        const sortedTokens = response.data.tokens.map((token: TokenInfo) => token.token).sort((a: any, b: any) => a.networkId - b.networkId);

        setTokens(sortedTokens);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (wallet_address) {
      fetchData();
    }
  }, [wallet_address]);

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
    if (ethBalance !== null && ethPrice !== null) {
      setEthBalanceInUsd(ethBalance * ethPrice);

    }
  }
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
              <Button p={0} bg={"transparent"} onClick={handleCopy} _hover={{ backgroundColor: 'blue.700', cursor: 'pointer' }}>
                <Text color="#FFA500" fontSize="18px" marginLeft="5px">
                  <Badge fontSize={"24px"} >  {ensAddress ? ensAddress : formatWalletAddress(wallet_address)}</Badge>
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
                      <Badge fontSize={"24px"} > {totalNetWorth?.toFixed(2)} USD</Badge>
                    </Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box>
                    <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                      ETH Balance
                    </Text>
                    <Text color="#FFA500" fontSize="18px" marginLeft="5px">
                      <Badge fontSize={"22px"} >  {ethBalance} ETH </Badge>
                    </Text>
                  </Box>
                </GridItem>

                <GridItem>
                  <Box>
                    <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                      NFTs Estimated
                    </Text>
                    <Text color="#FFA500" fontSize="18px" marginLeft="5px">
                      <Badge fontSize={"22px"} >  {nftvalue?.toFixed(2)} USD </Badge>
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
        flexDirection="column"
        boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
        margin="auto"
        background="#002240"
        minWidth={["100%", "100%", "100%", "100%"]}
      >
        <Table variant='unstyled'>
          <Tbody>
            <Tr>
              <Td>
                <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                  Token
                </Text>
              </Td>
              <Td>
                <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                  Balance
                </Text>
              </Td>
              <Td>
                <Text color="#FFFFFF" fontSize="18px" fontWeight="bold">
                  Value
                </Text>
              </Td>
            </Tr>
            {networkDetails.map((network) => (
              <React.Fragment key={network.id}>
                <Tr>
                  <Td colSpan={4} bg={network.color} margin={"10px"} >
                    <Center>
                      <Text fontWeight="bold" color={"black"}>
                        {network.name}
                      </Text>
                      <Image src={network.logo} alt={`${network.name} Logo`} width="20px" height="20px" marginLeft="5px" />
                    </Center>
                  </Td>
                </Tr>
                {tokens
                  ?.filter((token) => token.networkId === network.id)
                  .map((token, index: number) => (
                    <Tr key={index}>
                      <Td>
                        <Button bg='transparent' _hover={{ backgroundColor: 'blue.700', cursor: 'pointer' }}
                          onClick={() => handleTokenClick(token)}>
                          <Image src={network.logo} alt={`${token.name} Logo`} width="20px" height="20px" marginRight="5px" />
                          <Text color={network.color}>{token.symbol}</Text>
                        </Button>
                      </Td>
                      <Td>
                        <Text color={network.color}>{token.balance?.toFixed(4)}</Text>
                      </Td>
                      <Td>
                        <Text color={"white"} fontSize={"20px"}>{token.balanceUSD?.toFixed(2)} USD</Text>
                      </Td>
                    </Tr>
                  ))}
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </Box>
      {selectedToken && (
        <EvmSendModal2 isOpen={!!selectedToken} onClose={() => setSelectedToken(null)} tokenInfo={selectedToken} />
      )}
    </Flex>
  );
};

export default PortfolioPage;