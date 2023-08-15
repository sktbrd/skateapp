import React from "react";
import { Box, Image, Text } from "@chakra-ui/react";

const DEFAULT_IMAGE_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

interface NFTCardProps {
  imageUrl: string;
  name: string;
  floorPriceEth: string;
  collectionAddress: string;
  nftStandard: string;
  network: string;
  id: string;
  rarityRank: number | null;
}

const NFTCard: React.FC<NFTCardProps> = ({
  imageUrl,
  name,
  floorPriceEth,
  collectionAddress,
  nftStandard,
  network,
  id,
  rarityRank,
}) => {
  const imageSrc = imageUrl || DEFAULT_IMAGE_URL;

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Image src={imageSrc} alt={name} boxSize="200px" objectFit="cover" borderRadius="md" />
      <Text mt={4} fontSize="xl" fontWeight="bold">
        {name}
      </Text>
      <Text mt={2}>Floor Price (ETH): {floorPriceEth}</Text>
      <Text mt={2}>Collection Address: {collectionAddress}</Text>
      <Text mt={2}>NFT Standard: {nftStandard}</Text>
      <Text mt={2}>Network: {network}</Text>
      <Text mt={2}>ID: {id}</Text>
      <Text mt={2}>Rarity Rank: {rarityRank || "N/A"}</Text>
    </Box>
  );
};

export default NFTCard;
