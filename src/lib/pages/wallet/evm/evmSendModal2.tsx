import React, { useState, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Flex, Image, Text, Link, VStack, Divider, Badge, Input, FormControl, FormLabel, Grid, GridItem } from "@chakra-ui/react";
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
import Web3 from 'web3';

interface EvmSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenInfo: any;
}

// create a list o Native Blockchain coins 
const nativeTokens = [
  {
    name: "Ether",
    symbol: "ETH",
  },
  { name: "Matic", symbol: "MATIC" },
  { name: "Polygon", symbol: "XDAI" },
  { name: "Binance Coin", symbol: "BNB" },
];



const EvmSendModal2: React.FC<EvmSendModalProps> = ({ isOpen, onClose, tokenInfo }) => {
  const { state, dispatch } = usePioneer();
  const {
    api,
    app,
    context,
    assetContext,
    blockchainContext,
    pubkeyContext,
    status,
  } = state;
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState([]);
  const [walletOptions, setWalletOptions] = useState([]);
  const [balance, setBalance] = useState("0.000");
  const [tokenBalance, setTokenBalance] = useState("0.000");
  const [amount, setAmount] = useState("0.00000000");
  const [contract, setContract] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [block, setBlock] = useState("");
  const [isNFT, setIsNFT] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [icon, setIcon] = useState("https://pioneers.dev/coins/ethereum.png");
  const [tokenName, setTokenName] = useState("");
  const [prescision, setPrescision] = useState("");
  const [token, setToken] = useState("");
  const [assets, setAssets] = useState("");
  const [blockchain, setBlockchain] = useState("");
  const [chainId, setChainId] = useState(1);
  const [web3, setWeb3] = useState(null);
  const [service, setService] = useState(null);
  const [toAddress, setToAddress] = useState("");
  const [txid, setTxid] = useState(null);
  const [signedTx, setSignedTx] = useState(null);
  const [loading, setLoading] = useState(null);
  const [isTokenSelected, setIsTokenSelected] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState(() => []);
  const [query, setQuery] = useState("bitcoin...");
  const [timeOut, setTimeOut] = useState(null);
  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(false);
  const [serviceValid, setServiceValid] = useState(true);

  const setContextWallet = async function (wallet: string) {
  };

  const handleSendNativeToken = async function () {
    //test uf token in native token or erc20

    const web3 = new Web3(Web3.givenProvider);
    console.log(web3)


  };





  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent border="1px solid #7CC4FA" color="white" background="#002240"
      >
        <ModalHeader>
          <Grid templateColumns="1fr auto" gap={4} alignItems="center">
            <Flex align="center">
              <Image src={"https://i.gifer.com/origin/e0/e02ce86bcfd6d1d6c2f775afb3ec8c01_w200.gif"} alt={tokenInfo.name} boxSize="100px" mr="2" />
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
              <Button colorScheme="green" onClick={handleSendNativeToken}>
                Send
              </Button>
            </VStack>
          </Grid>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="left">
            <Divider />
            <Text color={"white"}>
              <strong>Token Address:</strong> <Badge >{tokenInfo.address}</Badge>
            </Text>
            <Text color={"white"}>
              <strong>Contract Address:</strong> <Badge> {tokenInfo.contract}</Badge>
            </Text>
            <Text color={"white"}>
              <strong>Total Supply:</strong> <Badge> {parseFloat(tokenInfo.totalSupply).toLocaleString()} {tokenInfo.symbol} </Badge>
            </Text>
            <Text color={"white"}>
              <strong>Decimals:</strong> <Badge>{tokenInfo.decimals}</Badge>
            </Text>
            <Text color={"white"}>
              <strong>Market Cap:</strong><Badge> {tokenInfo.marketCap} USD</Badge>
            </Text>
            <Text color={"white"}>
              <strong>Price:</strong> <Badge>{tokenInfo.price} USD </Badge>
            </Text>
            <Text color={"white"}>
              <strong>Daily Volume: </strong> <Badge> {tokenInfo.dailyVolume} USD </Badge>
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

export default EvmSendModal2;
