import React from "react";
import { Box, Image, Text, Link } from "@chakra-ui/react";

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

  const formattedAddress = collectionAddress
    ? `${collectionAddress.substring(0, 6)}...${collectionAddress.substring(collectionAddress.length - 6)}`
    : null;

  return (
    <Box p={4} border="1px white solid" borderWidth="1px" borderRadius="lg">
      <Image src={imageSrc} alt={name} boxSize="200px" objectFit="cover" borderRadius="md" />
      <Text mt={4} fontSize="xl" fontWeight="bold" color="white">
        {name}
      </Text>
      {floorPriceEth && <Text mt={2} color="white">Floor Price (ETH): {floorPriceEth}</Text>}
      {formattedAddress && (
        <Text mt={2} color="white">
          Contract:{" "}
          <Link href={`https://etherscan.io/token/${collectionAddress}#readContract`} isExternal color="yellow">
            {formattedAddress}
          </Link>
        </Text>
      )}
      {nftStandard && <Text mt={2} color="white">NFT Standard: {nftStandard}</Text>}
      {network && <Text mt={2} color="white">Network: {network}</Text>}
      {id && <Text mt={2} color="white">ID: {id}</Text>}
    </Box>
  );
};

export default NFTCard;
