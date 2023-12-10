import React, { useEffect, useState } from "react";
import { Box, Text, Grid, Flex, Image, VStack, Button } from "@chakra-ui/react";
// @ts-ignore
import { Pioneer } from "@pioneer-platform/pioneer-react";
import NFTModal from "./nftModal";
import useAuthUser from "../hive/useAuthUser";
import { formatWalletAddress } from "lib/pages/utils/formatWallet";
import {
  usePioneer,
  // @ts-ignore
} from "@pioneer-platform/pioneer-react";

import SkatehiveOG from "./skatehiveOG";

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


  const onStart = async function () {
    try {
      if (app) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setSelectedWallet(app.wallets[0].type)
        setETHAddress(currentAddress);
      }
      if (ETHaddress) {
        const portfolio = await api.GetPortfolio({ address: ETHaddress.toUpperCase() });
        if (portfolio && portfolio.data) {
          setTotalNetWorth(portfolio.data.totalNetWorth);
          console.log(portfolio.data)
          setUserPortfolios(portfolio.data.nfts);
        } else {
          console.error("Invalid portfolio response:", portfolio);
        }
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
  <SkatehiveOG wallet={ETHaddress} />
      <Box border={"1px solid white"} marginBottom={"10px"} p={"5px"} borderRadius={"10px"}>
        <center>
          <Pioneer />
          <p>Selected Wallet</p>
          <Text color="yellow">{formatWalletAddress(ETHaddress)}</Text>
          <Text color="white">Total Net Worth: {totalNetWorth?.toFixed(2)} USD in your {selectedWallet} </Text>
        </center>
        </Box>
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
    </>
  );
};

export default GnarsNfts;
