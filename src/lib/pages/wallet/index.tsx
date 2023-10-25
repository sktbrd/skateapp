import React from 'react';
import { useEffect, useState } from 'react';
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
import NFTWallet from './nft/nftWallet';
import EvmBalance from './evm/evmWallet';
import FiatBalance from './fiat/fiat';
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

const Wallet = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [address, setAddress] = useState('');
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [nftList, setNftList] = useState<Types.NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('pubkeyContext: ', pubkeyContext);
    setAddress(pubkeyContext.master || pubkeyContext.pubkey);
  }, [pubkeyContext]);

  return (
    <Tabs color="limegreen" variant="enclosed">
      <TabList justifyContent="center">
        <Tab>Tokens</Tab>
        <Tab>NFTs</Tab>
      </TabList>

      <TabPanels>
      <TabPanel>
  <Flex direction={["column", "row"]}>
    <Box flex={1} mb={[4, 0]}>
      <HiveBalanceDisplay2 />
    </Box>
    {/* <Box flex={1} ml={[0, 4]}>
      <TestEvm />
    </Box> */}
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
