import React, { useEffect, useState } from "react";
import { Box, Text, Grid, Flex, Image, VStack, Button, GridItem, Center } from "@chakra-ui/react";
// @ts-ignore
import { Pioneer } from "@pioneer-platform/pioneer-react";
import NFTModal from "./nftModal";
import useAuthUser from "../hive/useAuthUser";
import { formatWalletAddress } from "lib/pages/utils/formatWallet";
// import londrina font
import "@fontsource/londrina-solid";
import {
  usePioneer,
  // @ts-ignore
} from "@pioneer-platform/pioneer-react";

import SkatehiveOG from "./skatehiveOG";
import { get } from "http";

type NFT = {
  token: {
    estimatedValueEth: string;
    lastSale: {
      price: string;
    };
    medias: {
      originalUrl: string;
    }[];
    collection: {
      floorPriceEth: string;
      name: string;
      address: string;
    };
    floorPriceEth: string;
    lastSaleEth: string;
    lastOffer?: {
      price: string;
    };
  };
};

const GnarsNfts = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext, status } = state;
  const [ETHaddress, setETHAddress] = useState("");
  const [userPortfolios, setUserPortfolios] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const defaultImageUrl = "../../../assets/loading.gif";
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedNFTImageUrl, setSelectedNFTImageUrl] = useState<string>("");
  const [selectedNFTName, setSelectedNFTName] = useState<string>("");
  const [selectedNFTCollection, setSelectedNFTCollection] = useState<string>("");
  const user = useAuthUser();
  const [totalNetWorth, setTotalNetWorth] = useState<number | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>("");

  const getGnarsFloorPrice = () => {
    const gnarsCollection = userPortfolios.find((nft) => nft.token.collection.name === "Gnars");

    if (gnarsCollection) {
      return gnarsCollection.token.collection.floorPriceEth;
    } else {
      return "N/A"; // Handle case where Gnars collection is not found
    }
  };

  const getAllGnarsEstimatedValue = () => {
    const gnarsNfts = userPortfolios.filter((nft) => nft.token.collection.name === "Gnars");
    const totalEstimatedValue = gnarsNfts.reduce((total, nft) => total + (+nft.token.estimatedValueEth), 0);
    return totalEstimatedValue.toFixed(3);
  };
  // ..
  const onStart = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setSelectedWallet(app.wallets[0].type)
        setETHAddress(currentAddress);
      }
      if (ETHaddress) {
        const portfolio = await api.GetPortfolio({ address: ETHaddress.toUpperCase() });
        if (portfolio && portfolio.data) {
          setTotalNetWorth(portfolio.data.totalNetWorth);
          setUserPortfolios(portfolio.data.nfts);
        } else {
          console.error("Invalid portfolio response:", portfolio);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  console.log("userPortfolios:", userPortfolios);

  useEffect(() => {
    onStart();
  }, [app, api, status, pubkeyContext]);

  useEffect(() => {
    onStart();
  }, [ETHaddress]);

  const handleClickNFT = (nft: NFT) => {
    setIsModalOpen(true);
    setSelectedNFTImageUrl(nft.token.medias[0]?.originalUrl || "");
    setSelectedNFTName(nft.token.collection.name || "");
    setSelectedNFTCollection(nft.token.collection.address || "");
  };


  return (
    <>
      {isModalOpen && (
        <NFTModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          nftImageUrl={selectedNFTImageUrl}
          nftName={selectedNFTName}
          nftCollection={selectedNFTCollection}
        />
      )}
      <Box>
        <Box border={"1px solid white"} marginBottom={"10px"} p={"5px"} borderRadius={"10px"}>
          <Grid
            templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
            gridTemplateRows={'50px 1fr 30px'}
            gridTemplateColumns={'150px 1fr'}
            h='200px'
            gap='1'
            color='blackAlpha.700'
            fontWeight='bold'
          >
            <GridItem pl='2' bg='orange.300' area={'header'}>
              <Center>
                <Text fontFamily={"Londrina Solid"} color={"black"} fontSize={"32px"}>Gnars Dao</Text>
              </Center>
            </GridItem>
            <GridItem area={'nav'}>
              <Image p={"10px"} src="https://www.gnars.wtf/images/logo.png" />
            </GridItem>
            <GridItem marginTop={"10px"} paddingBottom={"10px"} pl='2' area={'main'}>
              <center>

                <Text fontSize="18px" fontWeight="bold" color="white" mt="2">
                  Total NFTs: {userPortfolios.filter((nft) => nft.token.collection.name === "Gnars").length}
                </Text>
                <Text fontSize="18px" fontWeight="bold" color="white" mt="2">
                  Floor Price: {getGnarsFloorPrice()} ETH
                </Text>
                <Text fontSize="18px" fontWeight="bold" color="white" mt="2">
                  Gnars Worth: {Number(getGnarsFloorPrice()) * userPortfolios.filter((nft) => nft.token.collection.name === "Gnars").length} ETH
                </Text>
                <Text fontSize="18px" fontWeight="bold" color="white" mt="2">
                  Total Estimated Value: {getAllGnarsEstimatedValue()} ETH
                </Text>



              </center>
            </GridItem>

            <GridItem pl='2' area={'footer'}>
              Footer
            </GridItem>
          </Grid>
          <br />
          <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={4}>
            {userPortfolios
              .filter((nft) => nft.token.collection.name === "Gnars")
              .map((nft, index) => (
                <Flex
                  key={index}
                  borderWidth="1px"
                  borderColor="limegreen"
                  width="100%"
                  alignItems="center"
                  padding="10px"
                  borderRadius="10px"
                  bg="black"
                  color="white"
                  onClick={() => handleClickNFT(nft)}
                  flexDirection="column" // Ensure a column layout
                >
                  <VStack alignItems="start" spacing={1} flex="1">
                    {nft.token.medias[0]?.originalUrl ? (
                      <Image
                        src={nft.token.medias[0]?.originalUrl}
                        alt={`NFT ${index}`}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                        borderRadius="10px"
                      />
                    ) : (
                      <Image
                        src={defaultImageUrl}
                        alt={`Default NFT ${index}`}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                        borderRadius="10px"
                      />
                    )}
                    {nft.token.lastSale && (
                      <Text fontSize="14px" fontWeight="bold" color="white" mt="2">
                        Last Sale: {nft.token.lastSaleEth} ETH
                      </Text>
                    )}
                    <Text fontSize="14px" fontWeight="bold" color="white" mt="2">
                      Estimated Value: {(+nft.token.estimatedValueEth).toFixed(3)} ETH
                    </Text>
                  </VStack>
                </Flex>
              ))}
          </Grid>

        </Box>



      </Box >
    </>
  );
};

export default GnarsNfts;
