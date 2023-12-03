import React from 'react';
import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useTabs,
} from '@chakra-ui/react';
import HiveBlog from './Feed/Feed';
import SkatehiveProposals from './dao/snapshot';
import Chat from './chat';
import UploadPage from '../upload';
import RewardsButton from './rewardsButton';

const Home = () => {
  const { selectedIndex, ...tabProps } = useTabs({});

  const isBigScreen = window.innerWidth >= 768; // Define a breakpoint for big screens

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Tabs isFitted variant="enclosed" width="100%"  {...tabProps}>
        <TabList justifyContent={"center"} mb="1em" width="100%" >
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
        <RewardsButton />
        <TabPanels>
          <TabPanel>
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