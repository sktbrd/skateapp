import React, { useEffect, useState } from 'react';
import { Box, Text, Flex ,Image, VStack, HStack, Divider} from "@chakra-ui/react";
// @ts-ignore
import { usePioneer } from "pioneer-react";
import { Link as ChakraLink } from "@chakra-ui/react";

import axios from 'axios';



interface User {
  data?: {
    totalNetWorth?: number;
  };

}

const EthereumStats = () => {
  // Define hooks
  const { state, dispatch } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;

  // Ethereum stuff
    const [totalWorth, setTotalWorth] = useState<number>(0);
    const [daoPortfolio, setDaoPortfolio] = useState<any>(null);
    const [daoWallet, setDaoWallet] = useState<User | null>(null);
    const [hotWalletBalance, setHotWalletBalance] = useState<User | null>(null);
    const [ethereumBalance, setEthereumBalance] = useState<number | null>(null);
    const [ethNetworth, setEthNetworth] = useState<number | null>(null);
    const DAO_SAFE = "0x5501838d869b125efd90dacf45cdfac4ea192c12";
    const HOT_WALLET = "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";

    // create apiKey from process env VITE_ETHEREUM_API
    const apiKey = process.env.VITE_ETHERSCAN_API

    // Ethereum address you want to check
    const ethereumAddress = '0x5501838d869b125efd90dacf45cdfac4ea192c12';

    // Etherscan API endpoint
    const etherscanEndpoint = `https://api.etherscan.io/api`;

    const [loading, setLoading] = useState(true);

    

    async function getBalance() {
        try {
          const response = await axios.get(etherscanEndpoint, {
            params: {
              module: 'account',
              action: 'balance',
              address: ethereumAddress,
              apikey: apiKey,
            },
          });
    
          console.log('Etherscan API Response:', response);
    
          if (response.data.status === '200') {
            const balanceWei = response.data.result;
            const balanceEther = parseFloat(balanceWei) / 1e18;
            console.log(`Balance of ${ethereumAddress}: ${balanceEther} ETH`);
            setEthereumBalance(balanceEther); // Set the Ethereum balance in the component's state
          } else {
            console.error('Error:', response.data.message);
          }
        } catch (error) {
          console.error('Errror:', error);
        }
      }

    // Function to get the balance of an Ethereum address   
    const onStart = async () => {
        try {
          if (api && app) {
            const eth_hotwallet = await api.GetPortfolio({ address: HOT_WALLET });
            const ethNetworth = eth_hotwallet.data.totalNetWorth!; // Use the non-null assertion operator
            console.log("HOT WALLETT",eth_hotwallet)
            setEthNetworth(eth_hotwallet.data.totalNetWorth)
            console.log(eth_hotwallet.data.totalNetWorth)


    
    
          }
        } catch (e) {
          console.error("Error in onStart:", e);
        }
      };
    
    
    
      useEffect(() => {
        onStart();
        getBalance();
      }, [api, app]);
      
     
    
      const ethereumTreasure = daoPortfolio?.data?.totalNetWorth || 0; // Total worth in ETH


      const walletAddress = "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";
      const [copied, setCopied] = useState(false);
    
      const handleCopyClick = () => {
        // Create a temporary input element to copy the wallet address
        const tempInput = document.createElement("input");
        tempInput.value = walletAddress;
        document.body.appendChild(tempInput);
    
        // Select and copy the value inside the input element
        tempInput.select();
        document.execCommand("copy");
    
        // Remove the temporary input element
        document.body.removeChild(tempInput);
    
        // Set copied to true to show a message to the user
        setCopied(true);
        alert("Skatehive Delegation Wallet Copied to clipboard");
      };

    return (
    <Box
        border="1px solid #7CC4FA"
        borderRadius="12px"
        padding="10px"
        margin="10px"
        width={['100%', '50%']} // Set width to 100% on mobile, 50% on other screen sizes
        >
        <VStack spacing={4} align="stretch">

        <Flex alignItems="center" justifyContent="center" padding="10px">
        <Image
            src="https://www.pngitem.com/pimgs/m/124-1245793_ethereum-eth-icon-ethereum-png-transparent-png.png"
            boxSize="40px"
            borderRadius="50%"
        />
        <Text   textAlign="center"
                borderRadius="12px"
                fontWeight="700"
                fontSize="18px"
                color="white"
                padding="10px"
              >
                Ethereum Treasury
            </Text>
        </Flex>
        <Divider backgroundColor="#7CC4FA" />
    
        <Flex alignItems="center" justifyContent="center">
        <Text fontWeight="bold" color="#7CC4FA">Total Worth in USD: </Text>
        </Flex>
        <Divider backgroundColor="#7CC4FA" />
        <HStack spacing={4} align="stretch">
            <BalanceDisplay label="Multisig Balance" balance={`${ethereumBalance?.toFixed(3)} ETH`} />
            <BalanceDisplay label="Hot Wallet" balance={ethNetworth !== null ? `${ethNetworth.toFixed(3)} USD` : "Loading..."} />
        </HStack>
        <HStack spacing={4} align="stretch">
            <BalanceDisplay label="USD Coverted HotWallet" balance={""} />
            <BalanceDisplay label="USD Pegged Tokens" balance={"Fiat is for Losers"} />
        </HStack>
        <HStack margin="10px" borderRadius="10px" border="1px dashed #7CC4FA" justifyContent="center" padding="10px">
        <Image
            src="https://www.gnars.wtf/images/logo.png"
            alt="Avatar"
            width="20px"
            height="20px"
        />
      <ChakraLink
        target='_blank'
        href="https://etherscan.io/token/0x558BFFF0D583416f7C4e380625c7865821b8E95C#writeContract#F3"
        color="white"
        fontSize="16px"
        onClick={handleCopyClick}
        style={{ cursor: "pointer" }}
      >
        Gnars Deleg: 25 
      </ChakraLink>
              </HStack>
        <HStack margin="10px" borderRadius="10px" border="1px dashed #7CC4FA" justifyContent="center" padding="10px">
        <Image
            src="https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafkreidxxr42k6sff4ppctl4l3xvh52rf2m7vzdrjmyqhoijveevwafkau&w=3840&q=75"
            alt="Avatar"
            width="20px"
            height="20px"
        />
    <ChakraLink       target="_blank" href="https://zora.co/collect/eth:0x3ded025e441730e26ab28803353e4471669a3065/1" color="white" fontSize="16px">
    Skatehive OG: 37
    </ChakraLink>
        </HStack>
        </VStack>
    </Box>
    );
      
};



const BalanceDisplay = ({ label, balance }: { label: string; balance: string }) => {
    return (
<Box
  borderRadius="5px"
  border="1px solid #7CC4FA"
  width="50%"
  padding="10px"
  textAlign="center"  // Add this line to center text horizontally
>
  <Text color="white" fontWeight="bold">{label}</Text>
  <Divider></Divider>
  <Text>{balance || "PEPE"}</Text>
</Box>

    );
};
const avatarDisplay = ({ label}: { label: string;  }) => {
  return (
<Box
borderRadius="5px"
border="1px solid #7CC4FA"
width="50%"
padding="10px"
textAlign="center" 
>
<Text color="white" fontWeight="bold">{label}</Text>

</Box>

  );
};

export default EthereumStats;