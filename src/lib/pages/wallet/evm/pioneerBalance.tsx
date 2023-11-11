// Import necessary modules and components
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Text, Table, Td, Tbody, Flex, Image} from '@chakra-ui/react';

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!wallet_address) {
                    console.error("Wallet prop is undefined or null");
                    return;
                }

                const response = await axios.get(`https://swaps.pro/api/v1/portfolio/${wallet_address}`);
                console.log("DATA",response.data.totalBalanceUsdTokens);
                setTotalNetWorth(response.data.totalNetWorth)
                setTotalBalanceUsdTokens(response.data.totalBalanceUsdTokens)
                const sortedTokens = response.data.tokens.map((token: TokenInfo) => token.token).sort((a:any, b:any) => b.balanceUSD - a.balanceUSD);
                setTokens(sortedTokens);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [wallet_address]);

    return (
        <Flex flexDirection={"column"}>


<Box
  border={"1px solid #7CC4FA"}
  borderRadius={"10px"}
  p={4}
  display="flex"
  alignItems="center"
  boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
  margin="auto"
  background="#002240"
>

  {/* Left side with the image */}
  <Box marginRight={4}>
    <Image src="/assets/cryptopepe.png" alt="Swaps Logo" width="200px" borderRadius="10px" />
  </Box>

  {/* Right side with stacked sentences */}
  <Box>
    <Box marginBottom={2}>
      <Text color="#FFFFFF" fontSize="26px" fontWeight="bold">EVM tokens</Text>
      <Text color="#FFA500" fontSize="26px" marginLeft="5px">{totalNetWorth?.toFixed(2)} USD</Text>
    </Box>
    <Box>
      <Text color="#FFFFFF" fontSize="26px" fontWeight="bold">USD Pegged</Text>
      <Text color="#FFA500" fontSize="26px" marginLeft="5px">{totalBalanceUsdTokens?.toFixed(2)} USD</Text>
    </Box>
  </Box>

</Box>



        <Box   border={"1px solid #7CC4FA"}
  borderRadius={"10px"}
  p={4}
  display="flex"
  alignItems="center"
  boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
  margin="auto"
  background="#002240">
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
