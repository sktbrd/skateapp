import React, { useEffect, useState } from "react";
import { Box, Text, Grid, Flex, Image, VStack, Button } from "@chakra-ui/react";
// @ts-ignore
import { Pioneer } from "@pioneer-platform/pioneer-react";
import { formatWalletAddress } from "lib/pages/utils/formatWallet";
//@ts-ignore
import { usePioneer } from "@pioneer-platform/pioneer-react";

type NFT = {
  token: {
    medias: {
      originalUrl: string;
      type: string;
    }[];
    collection: {
      name: string;
      address: string;
      logoImageUrl?: string;
    };
    floorPriceEth: string;
    lastSaleEth: string;
    lastOffer?: {
      price: string;
    };
  };
};

const AllNfts = () => {
  const { state } = usePioneer();
  const { api, app, pubkeyContext, status } = state;
  const [ETHaddress, setETHAddress] = useState("");
  const [userPortfolios, setUserPortfolios] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPOAP, setShowPOAP] = useState(true); // State variable for showing/hiding POAP NFTs

  const onStart = async function () {
    try {
      if (app) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setETHAddress(currentAddress);
      }
      if (ETHaddress) {
        const portfolio = await api.GetPortfolio({ address: ETHaddress.toUpperCase() });
        setUserPortfolios(portfolio.data.nfts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    onStart();
  }, [app, api, app?.wallets, status, pubkeyContext]);

  useEffect(() => {
    onStart();
  }, [ETHaddress]);

  // Filter POAP NFTs based on the showPOAP state
  const filteredUserPortfolios = showPOAP
    ? userPortfolios
    : userPortfolios.filter((nft) => nft.token.collection.name !== "POAP");

  return (
    <Box>
      <center>
        <Pioneer />
        <p> Selected Wallet</p>
        <p>{ETHaddress}</p>
      </center>

      {/* Toggle button for showing/hiding POAP NFTs */}
      <Button onClick={() => setShowPOAP((prev) => !prev)} marginTop="1rem">
        {showPOAP ? "Hide POAP NFTs" : "Show POAP NFTs"}
      </Button>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
        {filteredUserPortfolios.map((nft, index) => (
          <Flex
            key={index}
            borderWidth="1px"
            borderColor="limegreen"
            width="100%"
            alignItems="center"
            padding="10px"
            borderRadius="md"
            bg="black"
            color="white"
          >
            {/* Check if originalUrl is present, otherwise, use logoImageUrl */}
            {nft.token.medias.length > 0 && nft.token.medias[0].originalUrl ? (
              nft.token.medias[0].type === "animation" ? (
                <video
                  src={nft.token.medias[0].originalUrl}
                  width="100px"
                  height="100px"
                  autoPlay
                  loop
                  muted
                  controls
                  style={{ marginRight: "16px" }}
                />
              ) : (
                <Image
                  src={nft.token.medias[0].originalUrl}
                  alt={`NFT ${index}`}
                  objectFit="cover"
                  width="100px"
                  height="100px"
                  marginRight="16px"
                  borderRadius={"10px"}
                />
              )
            ) : nft.token.collection.logoImageUrl ? (
              <Image
                src={nft.token.collection.logoImageUrl}
                alt={`NFT ${index}`}
                objectFit="cover"
                width="100px"
                height="100px"
                marginRight="16px"
              />
            ) : (
              // Render a placeholder or default image if both originalUrl and logoImageUrl are not present
              <Image
                src="https://i.pinimg.com/originals/08/47/c6/0847c65fce1e5dbfd1fe2f719f1e5f05.gif"
                alt={`Placeholder for NFT ${index}`}
                objectFit="cover"
                width="100px"
                height="100px"
                marginRight="16px"
              />
            )}

            {/* NFT Information */}
            <VStack alignItems="start" spacing={1} flex="1">
              <Text fontWeight="bold">Collection: {nft.token.collection.name}</Text>
              <Text>Collection Address: {nft.token.collection.address}</Text>
              <Text>Floor Price (ETH): {nft.token.floorPriceEth}</Text>
              <Text>Last Sale Price (ETH): {nft.token.lastSaleEth}</Text>
              <Text>ID: {index}</Text>
              {/* Check if last offer exists and display it */}
              {nft.token.lastOffer && (
                <Text>Last Offer Price (ETH): {nft.token.lastOffer.price}</Text>
              )}
            </VStack>
          </Flex>
        ))}
      </Grid>
      <center>
        <Button onClick={onStart} marginTop="1rem">
          Load NFTs
        </Button>
      </center>
    </Box>
  );
};

export default AllNfts;
