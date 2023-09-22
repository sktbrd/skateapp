import React from 'react';
import { useEffect, useState } from 'react';
//@ts-ignore
import { usePioneer } from 'pioneer-react';
import NFTWallet from './nft/nftWallet';
import EvmBalance from './evm/evmWallet';
import HiveBalanceDisplay from './hive/hiveBalance';
import FiatBalance from './fiat/fiat';
import POAPsNFTWallet from './nft/poapWallet';
import HiveBalanceDisplay2 from './hive/hiveBalance copy';
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
        <Tab>POAPs</Tab> {/* Added this line */}
      </TabList>

      <TabPanels>
      <TabPanel>
  <Flex direction={["column", "row"]}>
    <Box flex={1} mb={[4, 0]}>
      <HiveBalanceDisplay2 />
    </Box>
    <Box flex={1} ml={[0, 4]}>
      <EvmBalance />
    </Box>
  </Flex>
  
</TabPanel>

        <TabPanel>
          <NFTWallet nftList={nftList} />
        </TabPanel>

        <TabPanel>
        <POAPsNFTWallet />
          <Text>POAPs content will be displayed here.</Text>
        </TabPanel> {/* Added this block */}
      </TabPanels>
    </Tabs>
  );
};

export default Wallet;
