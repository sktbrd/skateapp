import React, { useEffect, useState } from 'react';
import { Box, Text, Flex ,Image, VStack, HStack, Divider} from "@chakra-ui/react";
// @ts-ignore
import { usePioneer } from "pioneer-react";

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
    
          if (response.data.status === '1') {
            const balanceWei = response.data.result;
            const balanceEther = parseFloat(balanceWei) / 1e18;
            console.log(`Balance of ${ethereumAddress}: ${balanceEther} ETH`);
            setEthereumBalance(balanceEther); // Set the Ethereum balance in the component's state
          } else {
            console.error('Error:', response.data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }

    // Function to get the balance of an Ethereum address   
    const onStart = async () => {
        try {
          if (api && app) {
            const portfolio = await api.GetPortfolio({ address: DAO_SAFE });
            const eth_hotwallet = await api.GetPortfolio({ address: HOT_WALLET });
            console.log("ETH HOTWALLET",eth_hotwallet)
            setDaoPortfolio(portfolio.data.totalNetwork);
            setHotWalletBalance(eth_hotwallet);
            setLoading(false);
    
    
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
      console.log("ETHEREUM TREASURE",ethereumTreasure)


    return (
    <Box
        border="1px solid #7CC4FA"
        borderRadius="12px"
        padding="10px"
        margin="10px"
        width="50%"
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
        <Text color="white">Total Worth: </Text>
        </Flex>
        <Divider backgroundColor="#7CC4FA" />
        <HStack spacing={4} align="stretch">
            <BalanceDisplay label="Multisig Balance" balance={`${ethereumBalance?.toFixed(3)} ETH`} />
            <BalanceDisplay label="Hot Wallet" balance={`${ethereumTreasure.toFixed(3)} USD`} />
        </HStack>
        <HStack spacing={4} align="stretch">
            <BalanceDisplay label="Ethereum Balance" balance={`${ethereumBalance?.toFixed(3)} ETH`} />
            <BalanceDisplay label="Ethereum Balance" balance={`${ethereumBalance?.toFixed(3)} ETH`} />
        </HStack>
        <HStack margin="10px" borderRadius="10px" border="1px dashed #7CC4FA" justifyContent="center" padding="10px">
        <Image
            src="https://www.gnars.wtf/images/logo.png"
            alt="Avatar"
            width="20px"
            height="20px"
        />
        <Text color="white" fontSize="16px">Gnars Deleg: 25</Text>
        </HStack>
        </VStack>
    </Box>
    );
      
};



const BalanceDisplay = ({ label, balance }: { label: string; balance: string }) => {
    return (
        <Box borderRadius="5px" border="1px solid #7CC4FA" width="50%" padding="10px">
            <Text fontWeight="bold">{label}</Text>
            <Text>{balance || "Try Connect your wallet and refresh the page"}</Text>
        </Box>
    );
};

export default EthereumStats;