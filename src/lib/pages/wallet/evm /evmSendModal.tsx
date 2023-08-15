import React, { useState } from "react";


import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Image,
  Text,
  Link,
  VStack,
  Divider,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
} from "@chakra-ui/react";

interface TokenInfo {
  id: string;
  networkId: number;
  address: string;
  label: string;
  name: string;
  balance: string;
  balanceUSD: string;
  caip: string;
  canExchange: boolean;
  coingeckoId: string;
  context: string;
  contract: string;
  createdAt: string;
  dailyVolume: number;
  decimals: number;
  description: string;
  explorer: string;
  externallyVerified: boolean;
  hide: boolean;
  holdersEnabled: boolean;
  image: string;
  isToken: boolean;
  lastUpdated: number;
  marketCap: number;
  network: string;
  price: number;
  priceUpdatedAt: string;
  protocal: string;
  pubkey: string;
  source: string;
  status: string;
  symbol: string;
  totalSupply: string;
  updatedAt: string;
  verified: boolean;
  website: string;
}

interface EvmSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenInfo: TokenInfo | null;
}


const EvmSendModal: React.FC<EvmSendModalProps> = ({ isOpen, onClose, tokenInfo }) => {
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [error, setError] = useState<string>("");


  const handleSend = () => {
    // ... (implement send functionality here)
    // For now, let's just display an alert
    alert("Send functionality will be implemented later.");
  };

  if (!tokenInfo) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent border="1px solid limegreen" backgroundColor="black" color="white">
        <ModalHeader>
          <Grid templateColumns="1fr auto" gap={4} alignItems="center">
            <Flex align="center">
            <Image src={tokenInfo.image} alt={tokenInfo.name} boxSize="100px" mr="2" />
              <Text alignItems="center" fontSize="lg" fontWeight="bold">
                {tokenInfo.symbol}
              </Text>
            </Flex>
            <VStack spacing={4} align="left">
              <FormControl isInvalid={!!error}>
                <FormLabel htmlFor="amount">Amount</FormLabel>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter the amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormControl>
              <FormControl isInvalid={!!error}>
                <FormLabel htmlFor="toAddress">To Address</FormLabel>
                <Input
                  id="toAddress"
                  placeholder="Enter the recipient address"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                />
              </FormControl>
              <Button colorScheme="green" onClick={handleSend}>
                Send
              </Button>
            </VStack>
          </Grid>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="left">
            <Divider />
            <Text>
              <strong>Token Address:</strong> {tokenInfo.address}
            </Text>
            <Text>
              <strong>Contract Address:</strong> {tokenInfo.contract}
            </Text>
            <Text>
              <strong>Total Supply:</strong> {parseFloat(tokenInfo.totalSupply).toLocaleString()} {tokenInfo.symbol}
            </Text>
            <Text>
              <strong>Decimals:</strong> {tokenInfo.decimals}
            </Text>
            <Text>
              <strong>Market Cap:</strong> {tokenInfo.marketCap} USD
            </Text>
            <Text>
              <strong>Price:</strong> {tokenInfo.price} USD
            </Text>
            <Text>
              <strong>Daily Volume:</strong> {tokenInfo.dailyVolume} USD
            </Text>
            <Divider />
    <Flex direction="column" alignItems="center">
      <Link href={tokenInfo.explorer} target="_blank" rel="noopener noreferrer">
        View on Etherscan
      </Link>
      <Link href={tokenInfo.website} target="_blank" rel="noopener noreferrer">
        Official Website
      </Link>
    </Flex>
    <Divider />
            <Text>{tokenInfo.description}</Text>
            {/* Add more token information as needed */}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EvmSendModal;
