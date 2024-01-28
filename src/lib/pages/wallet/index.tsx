import { useEffect, useState } from 'react';
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
import {
  useMediaQuery,
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Center
} from '@chakra-ui/react';
import HiveBalanceDisplay2 from './hive/hiveBalance';
import PortfolioPage from './evm/pioneerBalance';
import NFTWallet from './nft/nftWallet';
import SkatehiveOG from './nft/skatehiveOG';
import GnarsNfts from './nft/gnarsNfts';
import TotalBalances from './totalBalance';
import useAuthUser from '../home/api/useAuthUser';
const Wallet = () => {
  const { state } = usePioneer();
  const { app, status, pubkeyContext } = state;
  const [ETHaddress, setETHAddress] = useState<string>(''); // Make sure ETHaddress is a string
  const [loading, setLoading] = useState(true);
  const user = useAuthUser();


  const onStart = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0 && app.wallets[0].wallet && app.wallets[0].wallet.accounts) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setETHAddress(currentAddress);
      } else {
        console.error('Some properties are undefined or null');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    onStart();
  }, [app, status, pubkeyContext]);

  const isMobile = useMediaQuery('(max-width: 600px)')[0];

  return (
    <Tabs color="limegreen" variant="enclosed">
      <TabList justifyContent="center">
        <Tab>Tokens</Tab>
        <Tab>All NFTs</Tab>
      </TabList>
      <Center>


      </Center>

      <TabPanels>
        <TabPanel>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="stretch"
          >

            {isMobile ? (
              <Box mb={{ base: 4, md: 0 }} width={{ base: '100%', md: '100%' }}>
                <HiveBalanceDisplay2 />

              </Box>
            ) : (
              <>
                <Box mb={{ base: 4, md: 0 }} width={{ base: '100%', md: '50%' }}>
                  {!isMobile && user?.user && ETHaddress && <TotalBalances hivewallet={user?.user?.name || ""} ethWallet={ETHaddress} />}

                  <SkatehiveOG wallet={ETHaddress} />
                  <GnarsNfts />
                </Box>

                <Box ml={{ base: 0, md: 4 }} width={{ base: '100%', md: '50%' }}>
                  <HiveBalanceDisplay2 />

                  <PortfolioPage wallet_address={ETHaddress} />
                </Box>
              </>
            )}
          </Flex>
        </TabPanel>

        <TabPanel>
          <NFTWallet />
        </TabPanel>
      </TabPanels>
    </Tabs >
  );
};

export default Wallet;
