import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Text, Flex, Image, Button, Tooltip, Grid, VStack, Badge, GridItem, Center, HStack } from "@chakra-ui/react";
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
    <Box>
      <Box border={"1px solid white"} marginBottom={"10px"} p={"5px"} borderRadius={"10px"}>

        {userBalance === "0" ? (
          <Flex alignItems="center" justifyContent="center" flexDirection="column">
            <Image
              src="https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeiauv3rfgzfrbrlzwdclyws35sgmcxsbaqhocyinbuba5laswzxgau&w=1920&q=75"
              alt="NFT Image"
              boxSize="220px"
              objectFit="cover"
              marginLeft={"20px"}
              filter={userBalance === "0" ? "grayscale(100%)" : "none"}
            />
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
            templateAreas={`"header header"
                            "nav main"
                            "nav footer"`}
            gridTemplateRows={'50px auto 30px'} // Adjusted row height
            gridTemplateColumns={'150px 1fr'}
            gap='1'
            color='blackAlpha.700'
            fontWeight='bold'
          >
            <GridItem pl='2' bg={"orange.500"} area={'header'} borderRadius={"10px"}>
              <Center>
                <Text color={"black"} fontSize={"32px"}>SKTHV OG</Text>
              </Center>
            </GridItem>
            <GridItem pl='2' area={'nav'}>
              <Image
                src="https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeiauv3rfgzfrbrlzwdclyws35sgmcxsbaqhocyinbuba5laswzxgau&w=1920&q=75"
                p={"0px"}
                m={"5px"}
              />
            </GridItem>
            <GridItem pl='2' area={'main'}>
              <br />
              <Center>

                <Text fontSize="24px" color="orange" fontWeight="bold" mb="2">
                  <Badge borderRadius={"5px"} fontSize={"24px"} colorScheme="orange" marginLeft="5px">{userBalance}</Badge> x Skatehive OG
                </Text>
              </Center>
              <Center>

                <HStack>

                  <Text color={"white"}> Number or Votes </Text>
                  <Badge borderRadius={"5px"} fontSize={"24px"} colorScheme="orange" marginLeft="5px">
                    {userVotes}
                  </Badge>
                </HStack>
              </Center>
            </GridItem>
          </Grid>

        )}
      </Box>
    </Box>
  );

};

export default SkatehiveOG;
