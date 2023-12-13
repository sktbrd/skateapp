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
  
} from '@chakra-ui/react';
import HiveBlog from './Feed/Feed';
import SkatehiveProposals from './dao/snapshot';
import Chat from './chat';
import UploadPage from '../upload';
import CommunityStats from './dao/communityStats';
import CommunityTotalPayout from './dao/commmunityPayout'
import { useBreakpointValue } from '@chakra-ui/react';
import NewFeature from './dao/newFeature';


const Home = () => {
  const { selectedIndex, ...tabProps } = useTabs({isLazy: true});

  const isBigScreen = window.innerWidth >= 768; // Define a breakpoint for big screens
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Tabs isFitted variant="enclosed" width="100%"  {...tabProps}>
        <TabList justifyContent={"center"}  width="100%" >
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'limegreen',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',
            }} // Change the background color when selected
          >
            📜 FEED
          </Tab>

          <Tab
            color="white"
            _selected={{
              backgroundColor: 'limegreen',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white'

            }} // Change the background color when selected
          >
            🛹 UPLOAD
          </Tab>
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'limegreen',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',

            }} // Change the background color when selected
          >
            🏛 DAOs
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
          <HStack justifyContent="center" marginBottom="10px">
            <CommunityTotalPayout communityTag={"hive-173115"} />
            {!isMobile && <CommunityStats communityTag="hive-173115" />}
            {!isMobile && <NewFeature  />}
          </HStack>

            <HiveBlog />
          </TabPanel>
          {/* <TabPanel>
            <HiveVideos />
          </TabPanel> */}
          {/* <TabPanel>
            <QFS />
          </TabPanel> */}
          <TabPanel>
            <UploadPage />
          </TabPanel>
          <TabPanel>
            <SkatehiveProposals />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {isBigScreen && <Chat />} {/* Render Chat component only on big screens */}
    </Flex>
  );
};

export default Home;