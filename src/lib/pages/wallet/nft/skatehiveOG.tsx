import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Text, Flex, Image, Button } from "@chakra-ui/react";
import ERC1155_ABI from "./skthvOG_abi.json";

const skthv_contract = "0x3dEd025e441730e26AB28803353E4471669a3065";
const skthv_proxy_contract = "0x3ded025e441730e26ab28803353e4471669a3065";

const SkatehiveOG = ({ wallet }: { wallet: string }) => {
  const [totalDelegatedVotes, setTotalDelegatedVotes] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [userBalance, setUserBalance] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchWalletData() {
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          "https://eth-mainnet.g.alchemy.com/v2/w_vXc_ypxkmdnNaOO34pF6Ca8IkIFLik"
        );
        const skthvProxyContract = new ethers.Contract(skthv_proxy_contract, ERC1155_ABI, provider);

        const balance = await skthvProxyContract.balanceOf(wallet, 1);
        const readableBalance = ethers.utils.formatUnits(balance, 0);
        setUserBalance(readableBalance);
      } catch (error) {
        console.error(error);
      }
    }

    fetchWalletData();
  }, [wallet]);

  const handleBuyButtonClick = () => {
    // Redirect to the Zora.co link for buying Skatehive OG
    window.location.href = "https://zora.co/collect/eth:0x3ded025e441730e26ab28803353e4471669a3065/1";
  };

  return (
    <Flex key={wallet} align="center" marginBottom="10px">
      <Box
        width="100%"
        border="1px solid yellow"
        borderRadius="lg"
        overflow="hidden"
        display="flex"
        alignItems="center" // Center the content vertically
      >
        <Image
          src="https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeiauv3rfgzfrbrlzwdclyws35sgmcxsbaqhocyinbuba5laswzxgau&w=1920&q=75"
          alt="NFT Image"
          boxSize="220px"
          objectFit="cover"
          marginLeft={"20px"}
          filter={userBalance === "0" ? "grayscale(100%)" : "none"}
        />
        <Box p="6" flex="1" textAlign="left">
          {userBalance === "0" ? (
            <Flex alignItems="center" justifyContent="center" flexDirection="column">
              <Button onClick={handleBuyButtonClick} colorScheme="yellow">
                Buy Skatehive OG
              </Button>
              <br />
              <Text fontSize="sm" fontWeight="bold" color="gray.500" mb="2">
                100% of earnings from NFT sales will be held in Skatehive Vault, and the community will decide how and where the money will be spent via proposals on Skatehive Snapshot.
              </Text>
            </Flex>
          ) : (
            <>
              <Text fontSize="lg" fontWeight="bold" color="gray.500" mb="2">
                Skatehive OG Balance : {userBalance} 
              </Text>
              <Text>
                Total Votes: 50 + Gnars (gonna code that later, for now, just hardcode it, I am sleepy)
              </Text>
            </>
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default SkatehiveOG;
