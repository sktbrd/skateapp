// Import necessary modules and components
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Text, Table, Td, Tbody } from '@chakra-ui/react';

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!wallet_address) {
                    console.error("Wallet prop is undefined or null");
                    return;
                }

                const response = await axios.get(`https://swaps.pro/api/v1/portfolio/${wallet_address}`);
                console.log(response.data);
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
        <Box p={4}>
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
                                <Text fontWeight="bold">{token.balance}</Text>
                            </Td>
                            <Td>
                                <Text fontWeight="bold">{token.balanceUSD}</Text>
                            </Td>
                        </tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default PortfolioPage;
