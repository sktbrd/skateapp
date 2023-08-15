import { 
  Grid, 
  Select, 
  Box,
  Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import NFTCard from "./nftCard";
import axios from "axios";

export interface NFT {
  imageUrl: string;
  name: string;
  description: string;
  collectionAddress: string;
  nftStandard: string;
  network: string;
  token: {
    collection: {
      address: string;
      floorPriceEth: string;
      logoImageUrl: string;
      name: string;
      network: string;
      nftStandard: string;
      openseaId: string;
    };
    medias: {
      originalUrl: string;
    }[];
  };
  id: string;
  rarityRank: number | null;
}

interface NFTWalletProps {
  nftList: NFT[];
}

const NFTWallet: React.FC<NFTWalletProps> = ({ nftList }) => {
  const [selectedContract, setSelectedContract] = useState<string>("all");
  const [totalFloorPrice, setTotalFloorPrice] = useState<number>(0);
  const [ethToUsdRate, setEthToUsdRate] = useState<number | null>(null);

  useEffect(() => {
    // Calculate the sum of floor prices for all NFTs in the wallet
    const sum = nftList.reduce((acc, nft) => {
      const floorPrice = parseFloat(nft.token.collection.floorPriceEth);
      return !isNaN(floorPrice) ? acc + floorPrice : acc;
    }, 0);

    setTotalFloorPrice(sum);
  }, [nftList]);

  useEffect(() => {
    // Fetch the current ETH to USD conversion rate from your API
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
  
  
  console.log("NFTS: ",nftList)
  const usdConvertedAmount = isNaN(totalFloorPrice) || ethToUsdRate === null ? null : totalFloorPrice * ethToUsdRate;

  // Create a mapping between contract addresses and collection names
  const contractNameMap: { [address: string]: string } = {};
  nftList.forEach((nft) => {
    const address = nft.token.collection.address;
    const name = nft.token.collection.name;
    contractNameMap[address] = name;
  });

  const contracts: string[] = Array.from(new Set(nftList.map((nft: NFT) => nft.token.collection.address))) || [];
  contracts.unshift("all");

  // Filter the NFTs based on the selected collection address
  const filteredNftList =
    selectedContract === "all"
      ? nftList
      : nftList.filter((nft: NFT) => nft.token.collection.address === selectedContract);

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
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
        {filteredNftList.map((nft) => (
          <NFTCard
            key={nft.id} // Update the key to use the unique 'id' property of the NFT
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
