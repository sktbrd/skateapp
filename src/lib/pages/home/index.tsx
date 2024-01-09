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
  Center,


} from '@chakra-ui/react';
import HiveBlog from './Feed/Feed';
// import SkatehiveProposals from './dao/snapshot';
// import Chat from './chat';
// import SinglePostPage from './plaza';
// import UploadPage from '../upload';
// import CommunityStats from './dao/communityStats';
// import CommunityTotalPayout from './dao/commmunityPayout'
// import { useBreakpointValue } from '@chakra-ui/react';
// import NewFeature from './dao/newFeature';
// import CreateAccountCTA from './dao/createAccountCTA';
// import Plaza from './plaza';
import '@fontsource/creepster';
import { useNavigate, useParams } from 'react-router-dom';



const Home = () => {
  const navigate = useNavigate();
  const { tabName } = useParams();
  const { selectedIndex, ...tabProps } = useTabs({ isLazy: true });
  const tabs = ["feed", "upload", "plaza"];

  const handleChangeTab = (index: number) => {
    const tabs = ["feed", "upload", "plaza"]; // Add tab names here
    navigate(`/${tabs[index]}`);
  };

  return (
    <Flex direction="column">
      {/* <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '10px',
        marginTop: '5px'
      }}>
        <img src="https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23uQ3d5BKcoYkuYWd7kZrnS396M1M6DvsMa5MowAmaVynQr67ChnARGaFstnMGeSspzwR.png" alt="Skatehive Image" style={{ width: '100%' }} />
      </div> */}
      <HiveBlog />

      {/* <Tabs
        isFitted
        variant="solid-rounded"
        justifyContent="center"
        {...tabProps}
        index={selectedIndex}
        onChange={handleChangeTab}
      >
        <Center>
          <TabList display="flex" width="85%">
            <Tab
              color="lightgreen"
              background="linear-gradient(0deg, black, darkgreen, black)"
              _selected={{
                background: 'linear-gradient(0deg, black, limegreen, black)',
                color: 'black',
                fontWeight: 'bold',
                border: 'none',
              }}
            >
              📜 FEED
            </Tab>
            <Tab
              color="lightgreen"
              background="linear-gradient(0deg, black, darkgreen, black)"
              _selected={{
                background: 'linear-gradient(0deg, black, limegreen, black)',
                color: 'black',
                fontWeight: 'bold',
                border: 'none',
              }}
            >
              🛹 UPLOAD
            </Tab>
            <Tab
              color="lightgreen"
              background="linear-gradient(0deg, black, darkgreen, black)"
              _selected={{
                background: 'linear-gradient(0deg, black, limegreen, black)',
                color: 'black',
                fontWeight: 'bold',
                border: 'none',
              }}
            >
              🗣 Plaza
            </Tab>
          </TabList>
        </Center>
        <TabPanels>
          <TabPanel>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '10px',
              marginTop: '5px'
            }}>
              <img src="https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23uQ3d5BKcoYkuYWd7kZrnS396M1M6DvsMa5MowAmaVynQr67ChnARGaFstnMGeSspzwR.png" alt="Skatehive Image" style={{ width: '100%' }} />
            </div>

            {/* Content for Feed tab */}
      {/* <HiveBlog />
          </TabPanel>
          <TabPanel> */}
      {/* Content for Upload tab */}
      {/* <UploadPage />
          </TabPanel>
          <TabPanel> */}
      {/* Content for Plaza tab */}
      {/* <Plaza /> */}
      {/* </TabPanel> */}
      {/* </TabPanels>
      </Tabs> */}
    </Flex>
  );
};

export default Home;
