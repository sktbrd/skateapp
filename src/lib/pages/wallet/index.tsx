import React from 'react';
import { useEffect, useState } from 'react';
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
import NFTWallet from './nft/nftWallet';
import POAPsNFTWallet from './nft/poapWallet';
import HiveBalanceDisplay2 from './hive/hiveBalance';
import {
  useMediaQuery,
  Box,
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import Web3 from 'web3'; // Ensure you have this imported
import * as Types from './nft/types';
import TestEvm from './testEvm/testEvm';
import PortfolioPage from './evm/pioneerBalance';
import SwapComponent from './hive/hiveSwapModal';


const Wallet = () => {

  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext, status } = state;
  const [ETHaddress, setETHAddress] = useState("");
  const [userPortfolios, setUserPortfolios] = useState<Types.NFT[]>([]); // Provide a type annotation for userPortfolios
  const [loading, setLoading] = useState(true);
  const defaultImageUrl = "../../../assets/loading.gif"; // Replace with the actual URL of your default image
  
  const onStart = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0 && app.wallets[0].wallet && app.wallets[0].wallet.accounts) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setETHAddress(currentAddress);
      } else {
        console.error("Some properties are undefined or null");
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {
    onStart();
  }, [app, api, app?.wallets, status, pubkeyContext]);

  return (
    <Tabs color="limegreen" variant="enclosed">
      <TabList justifyContent="center">
        <Tab>Tokens</Tab>
        <Tab>NFTs</Tab>
      </TabList>

      <TabPanels>
      <TabPanel>

      <Flex
  direction={{ base: 'column', md: 'row' }}
  justify="space-between"
  align="stretch"
>

  <Box
    mb={{ base: 4, md: 0 }}
    width={{ base: '100%', md: '50%' }} // Full width on small screens, 50% width on medium and larger
  >
    <HiveBalanceDisplay2 />
    {/* <SwapComponent /> */}
  </Box>

  <Box
    ml={{ base: 0, md: 4 }}
    width={{ base: '100%', md: '50%' }} // Full width on small screens, 50% width on medium and larger
  >
    <PortfolioPage wallet_address={ETHaddress} />
  </Box>

</Flex>

  
</TabPanel>

        <TabPanel>
          <NFTWallet  />
        </TabPanel>

      </TabPanels>
    </Tabs>
  );
};

export default Wallet;
