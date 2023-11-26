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

interface MetaMaskShapeShiftMultiChainHDWalletInfo {
  _supportsBTCInfo: boolean;
  _supportsETHInfo: boolean;
  // Add other properties as needed
}

interface MetaMaskShapeShiftMultiChainHDWallet {
  accounts: string[];
  addressCache: Map<any, any>; // You may want to specify the types more accurately
  ethAddress: string;
  info: MetaMaskShapeShiftMultiChainHDWalletInfo;
  provider: any; // You may want to specify the type of the provider
  publicKeysCache: Map<any, any>; // You may want to specify the types more accurately
  type: string;
  _isMetaMask: boolean;
  // Add other properties as needed
}


const EvmSendModal: React.FC<EvmSendModalProps> = ({ isOpen, onClose, tokenInfo }) => {
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { state, dispatch } = usePioneer();
  const { api, app } = state;
  const [web3, setWeb3] = useState<any>(null);
  const [address, setAddress] = useState<string>("");
  const [chainId, setChainId] = useState<number>(1);
  const [contract, setContract] = useState<string>("");
  const [prescision, setPrescision] = useState(18);
  const [txid, setTxid] = useState<string>("");
  const [block, setBlock] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [signedTx, setSignedTx] = useState(null);
  const [walletType, setWalletType] = useState<string>("");
  const [userWallet, setUserWallet] = useState<any>(null);
  const [web3_provider, setWeb3Provider] = useState<any>(null);

  const setContextWallet = async function (wallet: string) {
    try {
      console.log("setContextWallet: ", wallet);
      // eslint-disable-next-line no-console
      console.log("wallets: ", app.wallets);
      const matchedWallet = app.wallets.find(
        (w: { type: string }) => w.type === wallet
      );
      //console.log("matchedWallet: ", matchedWallet);
      if (matchedWallet) {
        const context = await app.setContext(matchedWallet.wallet);
        console.log("result change: ", context);
        console.log("app.context: ", app.context);

        console.log(
          "app.pubkeyContext: ",
          app.pubkeyContext.master || app.pubkeyContext.pubkey
        );
        const pubkeyContext =
          app.pubkeyContext.master || app.pubkeyContext.pubkey;

        dispatch({ type: "SET_CONTEXT", payload: app.context });
        dispatch({ type: "SET_PUBKEY_CONTEXT", payload: app.pubkeyContext });
        // dispatch({ type: "SET_WALLET", payload: wallet });
      } else {
        //console.log("No wallet matched the type of the context");
      }
    } catch (e) {
      console.error("header e: ", e);
    }
  };


  const onStart = async function () {
    try {
      const addressInfo = {
        addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
        coin: "Ethereum",
        scriptType: "ethereum",
        showDisplay: false,
      };
      console.log("ETHGETADDRESS",userWallet)
      const txaddress = await userWallet.ethGetAddress(addressInfo);

      setUserWallet(app.wallets[0].wallet);
      setWalletType(app.wallets[0].type);
      console.log(app.wallets[0].wallet)
      setAddress(txaddress);
      setChainId(tokenInfo);

      let info = await api.SearchByNetworkId({ chainId: chainId });
      if (!info.data[0]) {
        console.error("No network found!");
      }

      let web3_provider = new Web3(new Web3.providers.HttpProvider(info.data[0].service));
      setWeb3(web3_provider);
      let web3_provider_instance = new Web3(new Web3.providers.HttpProvider(info.data[0].service));

      setWeb3Provider(web3_provider_instance);

      setAddress(address);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setContract(tokenInfo.address);
    onStart();
    console.log("tokenInfo: ", tokenInfo);
  }, [app, api]);

  const handleSend = async () => {
    try {
      const web3_instance = new Web3(web3_provider);


      if (!web3_provider) {
        console.error('Web3 provider is not initialized');
        return;
      }
  
      if (!contract) {
        console.error("Invalid token contract address");
        return;
      }
  
      if (!toAddress || !web3.utils.isAddress(toAddress)) {
        console.error('Invalid or empty Ethereum address');
        return;
      }
  
      const wallet = app.wallets[0].wallet;
      let nonce = await web3.eth.getTransactionCount(address);
      nonce = web3.utils.toHex(nonce);
  
      let balance = await web3.eth.getBalance(address);
  
      let gasPrice = await web3.eth.getGasPrice();
      gasPrice = web3.utils.toHex(gasPrice);
      let gasLimit;

      const amountDecimal = BigInt(Math.round(parseFloat(amount) * Math.pow(10, prescision)));
      const amounttohex = web3.utils.toHex(amountDecimal);
      console.log("valuePOST: ", amountDecimal);

      if (contract.length > 16 && contract.indexOf("0x") >= 0) {
        let minABI = [
          {
            "constant": true,
            "inputs": [{ "name": "_owner", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "balance", "type": "uint256" }],
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [{ "name": "", "type": "uint8" }],
            "type": "function"
          }
        ];
        if (!toAddress) {
          console.error('To Address is empty or invalid');
          return;
        }
        let tokenData = await web3.eth.abi.encodeFunctionCall({
          name: 'transfer',
          type: 'function',
          inputs: [
            { type: 'address', name: '_to' },
            { type: 'uint256', name: '_value' }
          ]
        }, [toAddress, amountDecimal]);

        const newContract = new web3.eth.Contract(minABI, contract);
        const decimals = tokenInfo.decimals;
        setPrescision(decimals);

        try {
          gasLimit = web3.utils.toHex(1941000);
        } catch (e) {
          console.error("failed to get ESTIMATE GAS: ", e);
          gasLimit = web3.utils.toHex(30000 + 41000);
        }

        let input = {
          addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
          nonce,
          gasPrice,
          gas: gasLimit,
          gasLimit,
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: gasPrice,
          value: amounttohex,
          from: address,
          to: contract,
          data: tokenData,
          chainId,
        };

        let isMetaMask = false;

        if (walletType === "metamask") isMetaMask = true;

        let responseSign;
        if (isMetaMask) {
          responseSign = await wallet[0].wallet.ethSendTx(input);
          setTxid(responseSign.hash);
        } else {
          responseSign = await wallet[0].wallet.ethSignTx(input);
        }

        setSignedTx(responseSign.serialized);
      }
    } catch (e) {
      console.error(e);
    }
  };

  let onBroadcast = async function () {
    try {
      setLoading(true);
      const txHash = await web3.eth.sendSignedTransaction(signedTx);
      setTxid(txHash.transactionHash);
      setBlock(txHash.blockNumber);
      setLoading(false);
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
