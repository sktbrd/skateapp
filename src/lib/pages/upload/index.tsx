import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import MediaUpload from './easyUpload';
import AdvancedUpload from './advancedUpload';
import Chat from '../home/chat';
const UploadPage = () => {
    const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box position="relative">  {/* This wrapper Box is added to position the Chat component correctly */}
      <Tabs variant="soft-rounded" index={tabIndex} colorScheme='green' onChange={(index) => setTabIndex(index)}>
        <TabList justifyContent={"center"}>
          <Tab>Post a video 🛹 </Tab>
          <Tab>Advanced Post 👩‍💻 </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MediaUpload />
          </TabPanel>
          <TabPanel>
            <AdvancedUpload
              title=""
              content=""
              author=""
              user={null}  // Initially, user data is null or empty
              permlink=""
              weight={0}  // Set an appropriate default weight value
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Chat />
    </Box>
  );
}

export default UploadPage;
