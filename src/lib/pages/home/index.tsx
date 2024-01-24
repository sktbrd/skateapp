import React from 'react';
import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useTabs,
  HStack,
  VStack,
  Text,

} from '@chakra-ui/react';
import HiveBlog from './Feed/Feed';
import SkatehiveProposals from './dao/snapshot';
import Chat from './chat';
import UploadPage from '../upload';
import CommunityStats from './dao/communityStats';
import CommunityTotalPayout from './dao/commmunityPayout'
import { useBreakpointValue } from '@chakra-ui/react';
import NewFeature from './dao/newFeature';
import CreateAccountCTA from './dao/createAccountCTA';
import '@fontsource/creepster';


const Home = () => {
  const { selectedIndex, ...tabProps } = useTabs({ isLazy: true });

  const isBigScreen = window.innerWidth >= 768;
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Tabs isFitted variant="enclosed" width="100%"  {...tabProps} color={"black"} >
        <TabList justifyContent={"center"} width="100%" color={"black"} >
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'limegreen',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',
            }}
          >
            Skateboard
          </Tab>
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'purple.400',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',

            }}
          >
            LongBoard
          </Tab>

          <Tab
            color="white"
            _selected={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white'

            }}
          >
            Snowboard
          </Tab>
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'blue.200',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',
            }}
          >
            Surf
          </Tab>
          {/* <Tab
            color="white"
            _selected={{
              backgroundColor: 'red.200',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',
            }}
          >
            Scooter
          </Tab> */}

        </TabList>
        <TabPanels>
          {/* skatehive */}
          <TabPanel>
            <HiveBlog />
          </TabPanel>
          {/* longboard hive */}
          <TabPanel>
            <HiveBlog tag='longboard' />
          </TabPanel>
          <TabPanel>
            <HiveBlog tag='hive-132443' />
          </TabPanel>
          <TabPanel>
            <HiveBlog tag='hive-141964' />

          </TabPanel>
          <TabPanel>
            <HiveBlog tag='hive-141964' />

          </TabPanel>
          {/* <TabPanel>
            <HiveBlog tag='hive-141964' />

          </TabPanel> */}
        </TabPanels>
      </Tabs>
      {isBigScreen && <Chat />} {/* Render Chat component only on big screens */}
    </Flex >
  );
};

export default Home;