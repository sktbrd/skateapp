import React, { useEffect, useState } from "react";
import { Box, Grid, Flex, Image, Button } from "@chakra-ui/react";

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
    tokenId: string; // Add 'tokenId' property
  };
};


const PoapWallet = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext, status } = state;
  const [ETHaddress, setETHAddress] = useState("");
  const [userPortfolios, setUserPortfolios] = useState<NFT[]>([]); // Provide a type annotation for userPortfolios
  const [loading, setLoading] = useState(true);

  const defaultImageUrl = "https://poap.gallery/icons/poap_dark.png";

  const onStart = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setETHAddress(currentAddress);
      }
      if (ETHaddress) {
        const portfolio = await api.GetPortfolio({ address: ETHaddress.toUpperCase() });
        // Check if portfolio and portfolio.data are defined before accessing nfts
        setUserPortfolios(portfolio?.data?.nfts || []);
        setLoading(false); // Set loading to false when the data is successfully fetched
      }
    } catch (e) {
      console.error(e);
      setLoading(false); // Set loading to false in case of an error
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

      <Grid templateColumns={{ base: "2fr", md: "repeat(10, 1fr)" }} gap={4}>
        {userPortfolios
          .filter((nft) => nft.token.collection.name === "POAP")
          .sort((a, b) => {
            return b.token.tokenId.localeCompare(a.token.tokenId);
          })
          .map((nft, index) => (
            <Flex
              key={index}
              width="100%"
              alignItems="center"
              padding="10px"
              borderRadius="10px"
              bg="black"
              color="white"
            >
              {/* NFT Image */}
              {nft.token.medias[0]?.originalUrl ? (
                <Image
                  src={nft.token.medias[0]?.originalUrl}
                  alt={`NFT ${index}`}
                  objectFit="cover"
                  width="100%"
                  height="auto"
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


export default PoapWallet;
