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
import MediaUpload from './easyUpload2';
import AdvancedUpload from './advancedUpload';

const UploadPage = () => {
    const [tabIndex, setTabIndex] = useState(0);

  return (
    <Tabs  variant="soft-rounded" index={tabIndex} colorScheme='green' onChange={(index) => setTabIndex(index)}>
      <TabList justifyContent={"center"} >
        <Tab>Post a video 🛹 </Tab>
        <Tab>Advanced Post 	👩‍💻 </Tab>
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
  user={null} // Initially, user data is null or empty
  permlink=""
  weight={0} // Set an appropriate default weight value
/>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default UploadPage;
