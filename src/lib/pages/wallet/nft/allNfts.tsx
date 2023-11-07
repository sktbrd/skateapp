import React, { useEffect, useState } from "react";
import { Box, Text, Spinner, Grid,Flex, Image, VStack, Button } from "@chakra-ui/react";
//@ts-ignore
import { Pioneer } from "@pioneer-platform/pioneer-react";

import {
  usePioneer,
  // @ts-ignore
} from "@pioneer-platform/pioneer-react";

type NFT = {
  token: {
    medias: {
      originalUrl: string;
    }[];
    collection: {
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



const AllNfts = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext, status } = state;
  const [ETHaddress, setETHAddress] = useState("");
  const [userPortfolios, setUserPortfolios] = useState<NFT[]>([]); 
  const [loading, setLoading] = useState(true);

  const onStart = async function () {
    try {
      if (app) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        console.log("currentAddress: ", currentAddress);
        setETHAddress(currentAddress);
      }
      if (ETHaddress) {
        const portfolio = await api.GetPortfolio({ address: ETHaddress.toUpperCase() });
        setUserPortfolios(portfolio.data.nfts);
        console.log("portfolio: ", userPortfolios);
        console.log(portfolio.data.nfts);
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
  }
  , [ETHaddress]);
  return (
    <Box>
      <center>
      <Pioneer />
      <p> Selected Wallet</p>
      <p>{ETHaddress}</p>
      </center>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
        {userPortfolios.map((nft, index) => (
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
            {/* NFT Image */}
            <Image
              src={nft.token.medias[0]?.originalUrl}
              alt={`NFT ${index}`}
              objectFit="cover"
              width="100px"
              height="100px"
              marginRight="16px"
            />

            {/* NFT Information */}
            <VStack alignItems="start" spacing={1} flex="1">
              <Text fontWeight="bold">Collection: {nft.token.collection.name}</Text>
              <Text>Collection Address: {nft.token.collection.address}</Text>
              <Text>Floor Price (ETH): {nft.token.floorPriceEth}</Text>
              <Text>Last Sale Price (ETH): {nft.token.lastSaleEth}</Text>
              {/* Check if last offer exists and display it */}
              {nft.token.lastOffer && (
                <Text>Last Offer Price (ETH): {nft.token.lastOffer.price}</Text>
              )}
            </VStack>
          </Flex>
        ))}
      </Grid>
      <center>
      <Button onClick={onStart} marginTop="1rem">Load NFTs</Button>

      </center>
    </Box>
  );
};


export default AllNfts;