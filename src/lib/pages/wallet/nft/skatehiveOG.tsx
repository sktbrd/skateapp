import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Text, Flex, Image, Button, Tooltip, Grid, VStack, Badge } from "@chakra-ui/react";
import ERC1155_ABI from "./skthvOG_abi.json";
import ERC721_ABI from "./gnars_abi.json";
const skthv_contract = "0x3dEd025e441730e26AB28803353E4471669a3065";
const skthv_proxy_contract = "0x3ded025e441730e26ab28803353e4471669a3065";
// Gnars Contract 
const gnars_contract = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";

const SkatehiveOG = ({ wallet }: { wallet: string }) => {
  const [totalDelegatedVotes, setTotalDelegatedVotes] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [userBalance, setUserBalance] = useState<string | undefined>(undefined);
  const [userGnarsBalance, setUserGnarsBalance] = useState<string | undefined>(undefined);
  const [userVotes, setUserVotes] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function fetchWalletData() {
      try {

        const providerUrl = "https://eth-mainnet.g.alchemy.com/v2/w_vXc_ypxkmdnNaOO34pF6Ca8IkIFLik";
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);


        const skthvProxyContract = new ethers.Contract(skthv_proxy_contract, ERC1155_ABI, provider);

        const gnarsContract = new ethers.Contract(gnars_contract, ERC721_ABI, provider);
        const gnarsBalance = await gnarsContract.balanceOf(wallet);
        const readableGnarsBalance = ethers.utils.formatUnits(gnarsBalance, 0);
        const skatehiveOGbalance = await skthvProxyContract.balanceOf(wallet, 1);
        const readableOGBalance = ethers.utils.formatUnits(skatehiveOGbalance, 0);
        setUserVotes(50 * parseFloat(readableOGBalance) + parseFloat(readableGnarsBalance));
        setUserGnarsBalance(readableGnarsBalance);
        setUserBalance(readableOGBalance);
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
    <Flex key={wallet} align="center">
      <Box
        width="100%"
        border="2px solid orange"
        borderRadius="lg"
        overflow="hidden"
        display="flex"
        p="4"
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
            <Grid
              templateColumns="1fr"
              gap={4}
              m="20px"
              alignItems="center"
            >
              <VStack align="end" textAlign="right">
                <Flex flexDirection="row" alignItems="center">
                  <Text fontSize="24px" color="orange" fontWeight="bold" mb="2">
                    Skatehive OG #{" "}
                  </Text>
                  <Badge borderRadius={"10px"} fontSize={"24px"} colorScheme="green" marginLeft="5px">
                    {userBalance}
                  </Badge>
                </Flex>
                <Tooltip label="50 votes per Skatehive OG + 1 vote per Gnar">
                  <Flex flexDirection="row" alignItems="center">
                    <Text color="orange" fontSize="24px" fontWeight="bold">
                      Total Votes:
                    </Text>
                    <Badge borderRadius={"10px"} fontSize={"24px"} colorScheme="green" marginLeft="10px">
                      {userVotes}
                    </Badge>
                  </Flex>
                </Tooltip>
              </VStack>
            </Grid>


          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default SkatehiveOG;
