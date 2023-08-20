import React from 'react';
import { Grid, Select, Box, Text } from "@chakra-ui/react";
import NFTCard from './nftCard';
import axios from 'axios';
//@ts-ignore
import { usePioneer } from 'pioneer-react';
import * as Types from './types'; 
import { useState , useEffect } from 'react';

const NFTWallet: React.FC<Types.NFTWalletProps> = ({ nftList = [] }) => {
  const [selectedContract, setSelectedContract] = useState<string>("all");
  const [totalFloorPrice, setTotalFloorPrice] = useState<number>(0);
  const [ethToUsdRate, setEthToUsdRate] = useState<number | null>(null);

  const { state, dispatch } = usePioneer();
  const [address, setAddress] = useState("");
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [userNftPortifolio, setUserNftPortifolio] = useState<Types.NFT[]>(nftList);

  useEffect(() => {
    console.log("pubkeyContext: ", pubkeyContext);
    setAddress(pubkeyContext.master || pubkeyContext.pubkey);
  }, [pubkeyContext]);

  const onStart = async () => {
    try {
      if (api && app && address) {
        const currentAddress = pubkeyContext.master || pubkeyContext;
        const portfolio = await api.GetPortfolio({ address: currentAddress });
        const nftList = portfolio.data.nfts;

        // Filter out the "POAP" NFTs
        const nonPoapNfts = nftList.filter((nft: Types.NFT) => nft.token.collection.name.toLowerCase() !== "poap");
        
        setUserNftPortifolio(nonPoapNfts);
      }
    } catch (e) {
      console.error("Error in onStart:", e);
    }
  };
  
  useEffect(() => {
    onStart();
  }, [api, app, pubkeyContext, address]);

  const filteredNftList = selectedContract === "all"
    ? userNftPortifolio
    : userNftPortifolio.filter((nft: Types.NFT) => nft.token.collection.address === selectedContract);

  useEffect(() => {
    const sum = filteredNftList.reduce((acc, nft) => {
      const floorPrice = parseFloat(nft.token.collection.floorPriceEth);
      return !isNaN(floorPrice) ? acc + floorPrice : acc;
    }, 0);

    setTotalFloorPrice(sum);
  }, [filteredNftList]);

  useEffect(() => {
    axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then((response) => {
        const rate = response.data?.ethereum?.usd;
        if (rate) {
          setEthToUsdRate(rate);
        } else {
          console.error("Invalid API response:", response.data);
          setEthToUsdRate(null);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch ETH to USD rate:", error);
        setEthToUsdRate(null);
      });
  }, []);

  const usdConvertedAmount = isNaN(totalFloorPrice) || ethToUsdRate === null ? null : totalFloorPrice * ethToUsdRate;

  const contractNameMap: { [address: string]: string } = {};
  userNftPortifolio.forEach((nft) => {
    const address = nft.token.collection.address;
    const name = nft.token.collection.name;
    contractNameMap[address] = name;
  });

  const contracts: string[] = Array.from(new Set(userNftPortifolio.map((nft: Types.NFT) => nft.token.collection.address)));
  contracts.unshift("all");

  return (
    <Box padding="5px" borderRadius="10px" border="limegreen solid 1px">
      <Text borderRadius="12px" fontWeight="700" fontSize="18px" color="limegreen" padding="10px">
        NFT Portfolio
      </Text>
      <Text textAlign="center" fontWeight="bold" fontSize="16px" mb="5px">
        Total Floor Price: {isNaN(totalFloorPrice) ? 0 : totalFloorPrice.toFixed(2)} ETH
      </Text>
      {usdConvertedAmount !== null && !isNaN(usdConvertedAmount) && (
        <Text textAlign="center" fontWeight="bold" fontSize="16px" mb="5px">
          USD Equivalent: ${usdConvertedAmount.toFixed(2)}
        </Text>
      )}
      <Select value={selectedContract} onChange={(e) => setSelectedContract(e.target.value)} mb="10px">
        <option value="all">All Contracts</option>
        {contracts.map((contract) => (
          <option key={contract} value={contract}>
            {contract === "all" ? "All Contracts" : contractNameMap[contract]}
          </option>
        ))}
      </Select>
      <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={2}>
        {filteredNftList.map((nft, index) => (
          <NFTCard
            key={`${nft.token.collection.tokenId}-${nft.token.collection.address}`}  // Combination of tokenId and collectionAddress
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

export default NFTWallet;
