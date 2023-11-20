import React, { useState } from "react";
import { useEffect } from "react";
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
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
import Web3 from 'web3';


interface EvmSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenInfo: any;
}


const EvmSendModal: React.FC<EvmSendModalProps> = ({ isOpen, onClose, tokenInfo }) => {
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { state } = usePioneer();
  const [address, setAddress] = useState<string>("");
  const { api, app } = state;
  const [icon, setIcon] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [chainId, setChainId] = useState<number>(1);
  const [blockchain, setBlockchain] = useState<string>("1");
  const [web3, setWeb3] = useState<any>(null);
  const [networkId, setNetworkId] = useState<number>(1);


  const onStart = async function () {
  try {
    
    const addressInfo = {
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      coin: "Ethereum",
      scriptType: "ethereum",
      showDisplay: false,
    };

    let wallet = app.wallets[0].wallet;
    const address = await wallet.ethGetAddress(addressInfo);
    
    setAddress(address);
    console.log(tokenInfo.networkId)
    setNetworkId(tokenInfo.networkId);
  } catch (e) {
    console.error(e);
  }
};


  

  useEffect(() => {
    onStart(); 
  }
  , [app, api]);


  const handleSend = async () => {
    try {
      // Make sure to include both networkId and chainId when calling the API
      let info = await api.SearchByNetworkId({
        chainId: chainId,
      });
      console.log("info data: ", info.data[0]);
      setService(info.data[0].service);
      setChainId(info.data[0].chainId);
      console.log("chainId: ", info);
      console.log("service: ", service);

    } catch (e) {
      console.error(e);
    }
  };
  
  
  



  if (!tokenInfo) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent border="1px solid limegreen" backgroundColor="black" color="white">
        <ModalHeader>
          <Grid templateColumns="1fr auto" gap={4} alignItems="center">
            <Flex align="center">
            <Image src={""} alt={tokenInfo.name} boxSize="100px" mr="2" />
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
          <Button border={"1px solid white"} color={"white"} variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EvmSendModal;
