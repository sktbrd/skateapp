import React from "react";
import { Box, Image, Text, Link, Flex } from "@chakra-ui/react";
import { FaEthereum, FaLink, FaNetworkWired, FaIdCard } from 'react-icons/fa';

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
  const truncatedName = name.split(' ').slice(0, 2).join(' ');

    return (
      <Box p={4} border="1px white solid" borderRadius="lg" display="flex">
        <Image src={imageSrc} alt={name} boxSize="150px" objectFit="cover" borderRadius="md" mr={4} />
  
        <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
          <Box mb={2}>
            <Text fontSize="lg" fontWeight="bold" color="white" isTruncated maxWidth="100%">
              {truncatedName}
            </Text>
          </Box>
  
          {floorPriceEth && (
            <Text color="white" isTruncated maxWidth="100%">
              <FaEthereum /> Floor (ETH): {floorPriceEth}
            </Text>
          )}
  
          {formattedAddress && (
            <Text color="white" isTruncated maxWidth="100%">
              <FaLink /> {" "}
              <Link href={`https://etherscan.io/token/${collectionAddress}#readContract`} isExternal color="yellow">
                {formattedAddress}
              </Link>
            </Text>
          )}
  
          {nftStandard && (
            <Text color="white" isTruncated maxWidth="100%">
              <FaNetworkWired /> Standard: {nftStandard}
            </Text>
          )}
  
          {network && (
            <Text color="white" isTruncated maxWidth="100%">
              <FaNetworkWired /> {network}
            </Text>
          )}
  
          {id && (
            <Text color="white" isTruncated maxWidth="100%">
              <FaIdCard /> ID: {id}
            </Text>
          )}
        </Box>
      </Box>
    );
};

export default NFTCard;
