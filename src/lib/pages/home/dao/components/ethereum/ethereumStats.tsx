import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Image, VStack, HStack, Divider,Tooltip, Button } from "@chakra-ui/react";
// @ts-ignore
import { usePioneer } from "@pioneer-platform/pioneer-react";
import { Link as ChakraLink } from "@chakra-ui/react";

import axios from 'axios';

import { ContractAbi } from 'web3';
import { ethers } from "ethers";

const gnars_contract = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";
const skatehive_contract = "0x3dEd025e441730e26AB28803353E4471669a3065"
import ERC721_ABI from "./gnars_abi.json";


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

  const walletAddress = "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";
  const [copied, setCopied] = useState(false);
  const DAO_SAFE = "0x5501838d869b125efd90dacf45cdfac4ea192c12";
  const HOT_WALLET = "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";
  
  const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/w_vXc_ypxkmdnNaOO34pF6Ca8IkIFLik");
  const contract_gnars = new ethers.Contract(gnars_contract, ERC721_ABI, provider);
  const [currentVotes, setCurrentVotes] = useState<string | null>(null);
  const [currentHolders, setCurrentHolders] = useState<string | null>(null);

  async function readGnarsContract() {
    try {
      const result = await contract_gnars.getCurrentVotes("0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c");
      
      // Convert the result to a readable number
      const votes = ethers.utils.formatUnits(result, 0); // Assuming it's a uint256

      // Update the currentVotes state
      setCurrentVotes(votes);

      console.log("Contract result:", votes);
    } catch (error) {
      console.error("Error:", error);
    }
  }


  

  // create apiKey from process env VITE_ETHEREUM_API
  const apiKey = process.env.VITE_ETHERSCAN_API

  // Ethereum address you want to check
  const ethereumAddress = '0x5501838d869b125efd90dacf45cdfac4ea192c12';

  // Etherscan API endpoint
  const etherscanEndpoint = `https://api.etherscan.io/api`;

  const [loading, setLoading] = useState(true);

  async function fetchEthereumPrice() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
        params: {
          ids: 'ethereum',
          vs_currencies: 'usd',
        },
      });

      if (response.status === 200) {
        const ethereumPriceInUSD = response.data.ethereum.usd;
        // Calculate the USD worth of the multisig balance here
        const usdWorthOfMultisigBalance = ethereumBalance !== null ? (ethereumBalance * ethereumPriceInUSD).toFixed(2) + ' USD' : 'Loading...';
        return usdWorthOfMultisigBalance;
      } else {
        console.error('Error fetching Ethereum price:', response.statusText);
        return 'Error';
      }
    } catch (error) {
      console.error('Error fetching Ethereum price:', error);
      return 'Error';
    }
  }

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
        const eth_hotwallet = await api.GetPortfolio({ address: HOT_WALLET });
        console.log("HOT WALLETT", eth_hotwallet)
        const ethNetworth = eth_hotwallet.data.totalNetWorth!; // Use the non-null assertion operator
        console.log("HOT WALLETT", eth_hotwallet)
        setEthNetworth(eth_hotwallet.data.totalNetWorth)
        console.log(eth_hotwallet.data.totalNetWorth)
      }
    } catch (e) {
      console.error("Error in onStart:", e);
    }
  };

  
  

  const [usdWorthOfMultisigBalance, setUsdWorthOfMultisigBalance] = useState<string | null>('Loading...');

useEffect(() => {
  // Call your function here
  readGnarsContract();
  onStart();
  getBalance();
  fetchEthereumPrice().then((usdWorth) => {
    setUsdWorthOfMultisigBalance(usdWorth);
  });
}, []); 

useEffect(() => {
  onStart();
  console.log("ÖNSTART2")
}
, [api, app]);


  // Calculate the total worth by adding the Hot Wallet balance and the ETH/USD value from the multisig
  const totalWorthInUSD = ethNetworth !== null && usdWorthOfMultisigBalance !== null
    ? (ethNetworth + parseFloat(usdWorthOfMultisigBalance.replace(' USD', ''))).toFixed(2) + ' USD'
    : 'Loading...';


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
      border="2px solid #7CC4FA"
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
          <Text
            textAlign="center"
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
          <Text fontWeight="bold" color="#7CC4FA">Total Worth: {totalWorthInUSD}</Text>
        </Flex>
        <Divider backgroundColor="#7CC4FA" />
        <HStack spacing={4} align="stretch">
          <BalanceDisplay 
              labelTooltip="Balance of the multisig wallet in ETH"
              balanceTooltip="Transactions in our treasury are triggered by proposals on Snapshot" 
              label="Multisig Balance" 
              balance={`${ethereumBalance?.toFixed(3)} ETH`} />
          <BalanceDisplay 
              labelTooltip="skatehive.eth"
              labelLink='https://app.zerion.io/0xb4964e1eca55db36a94e8aeffbfbab48529a2f6c/overview?name=skatehive.eth'
              label="Hot Wallet" 
              balance={ethNetworth !== null ? `${ethNetworth.toFixed(3)} USD` : "Loading..."} />  
        </HStack>
        <HStack spacing={4} align="stretch">
          <BalanceDisplay 
              labelTooltip="How much ETH in USD we have in the Gnosis Safe multisig Contract"
              balanceTooltip="Click in the link to see the Gnosis Safe" 
              labelLink='https://app.safe.global/settings/setup?safe=eth:0x5501838d869B125EFd90daCf45cDFAC4ea192c12'
              label="ETH/USD Multisig" 
              balance={usdWorthOfMultisigBalance !== null ? usdWorthOfMultisigBalance : 'Loading...'} />
          <BalanceDisplay 
              labelTooltip="Donate to Skatehive using Giveth"
              balanceTooltip="P2P for free and get crypto back for your donations" 
              labelLink='https://giveth.io/es/project/skatehive-skateboarding-community'
              label="Donate" 
              balance={"on giveth"} />
        </HStack>
        <HStack margin="10px" borderRadius="10px" border="1px dashed #7CC4FA" justifyContent="center" padding="10px">
          <Image
            src="https://www.gnars.wtf/images/logo.png"
            alt="Avatar"
            width="20px"
            height="20px"
          />
  <Tooltip bg="black" color="white" borderRadius="10px" border="1px dashed limegreen" label="Voting Power of Skatehive Community on Gnars, tokens delegated by the community. Click to delegate.">
    <ChakraLink
      target='_blank'
      href="https://etherscan.io/token/0x558BFFF0D583416f7C4e380625c7865821b8E95C#writeContract#F3"
      color="white"
      fontSize="16px"
      onClick={handleCopyClick}
      style={{ cursor: "pointer" }}
    >
      Gnars Deleg: {currentVotes}
    </ChakraLink>
    </Tooltip>
        </HStack>
        <Tooltip bg="black" color="white" borderRadius="10px" border="1px dashed limegreen" label="Mint Page for Skatehive OG NFT. Click to Mint.">

        <HStack margin="10px" borderRadius="10px" border="1px dashed #7CC4FA" justifyContent="center" padding="10px">
          <Image
            src="https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafkreidxxr42k6sff4ppctl4l3xvh52rf2m7vzdrjmyqhoijveevwafkau&w=3840&q=75"
            alt="Avatar"
            width="20px"
            height="20px"
          />
          <ChakraLink target="_blank" href="https://zora.co/collect/eth:0x3ded025e441730e26ab28803353e4471669a3065/1" color="white" fontSize="16px">
            Skatehive OG: 37
          </ChakraLink>
        </HStack>
        </Tooltip>
      </VStack>
    </Box>
  );
};

const BalanceDisplay = ({
  label,
  balance,
  labelTooltip,
  balanceTooltip,
  labelLink,
  balanceLink,
  labelStyle,
  balanceStyle,
}: {
  label: string;
  balance: string;
  labelTooltip?: string;
  balanceTooltip?: string;
  labelLink?: string;
  balanceLink?: string;
  labelStyle?: React.CSSProperties;
  balanceStyle?: React.CSSProperties;
}) => {
  return (
    <Box
      borderRadius="5px"
      border="1px solid #7CC4FA"
      width="50%"
      padding="10px"
      textAlign="center"
    >
      {labelTooltip ? (
        <Tooltip label={labelTooltip} bg="black" color="white" borderRadius="10px" border="1px dashed limegreen">
          {labelLink ? (
            <ChakraLink color="white" fontWeight="bold"  href={labelLink} isExternal style={labelStyle}>
              {label}
            </ChakraLink>
          ) : (
            <Text color="white" fontWeight="bold" cursor="pointer" style={labelStyle}>
              {label}
            </Text>
          )}
        </Tooltip>
      ) : (
        labelLink ? (
          <ChakraLink color="white" fontWeight="bold"  href={labelLink} isExternal style={labelStyle}>
            {label}
          </ChakraLink>
        ) : (
          <Text color="white" fontWeight="bold" style={labelStyle}>
            {label}
          </Text>
        )
      )}
      {balanceTooltip ? (
        <Tooltip label={balanceTooltip} bg="black" color="white" borderRadius="10px" border="1px dashed limegreen">
        {balanceLink ? (
            <ChakraLink href={balanceLink} isExternal style={balanceStyle}>
              {balance || "PEPE"}
            </ChakraLink>
          ) : (
            <Text style={balanceStyle}>{balance || "PEPE"}</Text>
          )}
        </Tooltip>
      ) : (
        balanceLink ? (
          <ChakraLink href={balanceLink} isExternal style={balanceStyle}>
            {balance || "PEPE"}
          </ChakraLink>
        ) : (
          <Text style={balanceStyle}>{balance || "Loading..."}</Text>
        )
      )}
    </Box>
  );
};

export default EthereumStats;
