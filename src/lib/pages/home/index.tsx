import React, { useState } from 'react';
import {
  Flex,
  Box,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import HiveBlog from './Feed/Feed';
import HiveVideos from './videos/FeedVideo';
import SkatehiveProposals from './dao/snapshot';
import Chat from './chat';
import QFS from '../qfs';
import UploadPage from '../upload';

const Home = () => {
  const [selectedTab, setSelectedTab] = useState('feed');
  const { isOpen, onToggle } = useDisclosure();

  const handleTabChange = (tab:any) => {
    setSelectedTab(tab);
    onToggle(); // Close the side menu after selecting a tab
  };

  return (
    <Flex
      direction={'column'} // Column for small screens, row for large screens
      alignItems="center"
      justifyContent="space-between"
    >
      <Box bg="transparent" color="white">
        <Button
          onClick={() => handleTabChange('feed')}
          mb={2}
          variant="outline"
          width={"250px"}
          colorScheme={selectedTab === 'feed' ? '2px solid limegreen' : '2px solid white'}
          border={selectedTab === 'feed' ? '2px solid limegreen' : '2px solid white'}
        >
          📜 FEED
        </Button>
        <Button
          onClick={() => handleTabChange('upload')}
          mb={2}
          variant="outline"
          width={"250px"}
          colorScheme={selectedTab === 'upload' ? '2px solid limegreen' : '2px solid white'}
          border={selectedTab === 'upload' ? '2px solid limegreen' : '2px solid white'}
        >
          🛹 UPLOAD
        </Button>
        <Button
          onClick={() => handleTabChange('daos')}
          mb={2}
          variant="outline"
          width={"250px"}
          colorScheme={selectedTab === 'daos' ? '2px solid limegreen' : '2px solid  white'}
          border={selectedTab === 'daos' ? '2px solid limegreen' : '2px solid white'}
        >
          🏛 INFO
        </Button>
      </Box>

      {/* Content */}
      <Flex direction="column" minW={"100%"} justifyContent="center">
        {/* Main Content */}
        {selectedTab === 'feed' && <HiveBlog />}
        {selectedTab === 'upload' && <UploadPage />}
        {selectedTab === 'daos' && <SkatehiveProposals />}
      </Flex>

      {/* Chat (Render Chat component only on large screens) */}
      <Box display={{ base: 'none', lg: 'block' }}>
        <Chat />
      </Box>
    </Flex>
  );
};

export default Home;
