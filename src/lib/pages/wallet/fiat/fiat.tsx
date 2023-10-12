import { Box, Text, Flex } from "@chakra-ui/react";
//@ts-ignore
import { usePioneer } from "@pioneer-platform/pioneer-react";
import { useEffect, useState } from "react";

interface FiatBalanceProps {
  totalWorth: number;
}

export default function FiatBalance({ totalWorth }: FiatBalanceProps) {
  const { state } = usePioneer();
  const { api, user } = state;
  const address = user?.publicAddress;
  const [error, setError] = useState<string | null>(null);
  const [portfolioBalance, setPortfolioBalance] = useState<any>(null);

  const onStart = async function () {
    try {
      if (!api) {
        setError("API object is null or not available.");
        return;
      }

      const balance = await api.GetPortfolio({ address });
      console.log("BALANCE: ", balance)
      if (!balance.data || !balance.data.nfts) {
        setError("No NFT data found in portfolioBalance.");
        return;
      }

      setPortfolioBalance(balance.data);
      setError(null);
    } catch (e) {
      console.error("header e: ", e);
      setError("Failed to fetch NFT data.");
    }
  };

  useEffect(() => {
    onStart();
  }, [api, user, user?.assetContext]);

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      border="1px solid white"
      borderRadius="10px"
      padding="20px"
    >
      <Text fontSize="18px" fontWeight="bold" color="White" mb="10px">
        Fiat Balance
      </Text>
      <Box mb="10px">
        <Text color="White"fontSize="14px">Stable Balance:</Text>
        <Text fontSize="18px" fontWeight="bold">
          {portfolioBalance?.totalBalanceUSDApp.toFixed(2) || "N/A"} USD
        </Text>
      </Box>
      <Box mb="10px">
        <Text color="White" fontSize="14px">EVM worth:</Text>
        <Text fontSize="18px" fontWeight="bold">
          {portfolioBalance?.totalNetWorth.toFixed(2) || "N/A"} USD
        </Text>
      </Box>
      <Box mb="10px">
        <Text color="White" fontSize="14px">Hive Worth:</Text>
        <Text fontSize="18px" fontWeight="bold">
          ${totalWorth.toFixed(2)} USD
        </Text>
      </Box>
    </Flex>
  );
}

