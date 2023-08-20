import React, { useEffect, useState } from 'react';
import { Grid, Box, Text } from "@chakra-ui/react";
import NFTCard from './nftCard';
//@ts-ignore
import { usePioneer } from 'pioneer-react';
import * as Types from './types';

const POAPsNFTWallet: React.FC = () => {
  const { state } = usePioneer();
  const { api, pubkeyContext } = state;
  const [address, setAddress] = useState("");
  const [poapNfts, setPoapNfts] = useState<Types.NFT[]>([]);

  useEffect(() => {
    setAddress(pubkeyContext.master || pubkeyContext.pubkey);
  }, [pubkeyContext]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (api && address) {
        const currentAddress = pubkeyContext.master || pubkeyContext;
        const portfolio = await api.GetPortfolio({ address: currentAddress });
        const nftList = portfolio.data.nfts;
        const filteredNfts = nftList.filter((nft: Types.NFT) => nft.token.collection.name === "POAP");
        setPoapNfts(filteredNfts);
      }
    };

    fetchNFTs();
  }, [api, address, pubkeyContext]);

  return (
    <Box padding="5px" borderRadius="10px" border="limegreen solid 1px">
      <Text borderRadius="12px" fontWeight="700" fontSize="18px" color="limegreen" padding="10px">
            Poaps
      </Text>
      <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={2}>
      {poapNfts.map((nft: Types.NFT, index) => (
          <NFTCard
          key={`${nft.token.collection.tokenId || index}-${nft.token.collection.address}`}
          imageUrl={nft.token.medias[0]?.originalUrl}
            name={nft.token.collection.name}
            floorPriceEth={nft.token.collection.floorPriceEth}
            collectionAddress={nft.token.collection.address}
            nftStandard={nft.token.collection.nftStandard}
            network={nft.token.collection.network}
            id={nft.id}
            rarityRank={nft.rarityRank}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default POAPsNFTWallet;
