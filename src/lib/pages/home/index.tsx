import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import HiveBlog from "./magazine/Feed";
import HiveVideos from "./videos/FeedVideo";
import SnapShot from "./dao/snapshot";
import Chat from "./chat";
import QFS from "../qfs";

const Home = () => {
  return (
    <Flex backgroundColor="black" direction="column" alignItems="center" justifyContent="center">
      <Tabs isFitted variant="soft-rounded" width="100%" colorScheme="green">
        <TabList mb="1em" width="100%">
          <Tab color="white" border="1px limegreen solid">📜 FEED</Tab>
          <Tab color="white" border="1px limegreen solid">📹 VIDEOS</Tab>
          <Tab color="white" border="1px limegreen solid">🏛 GOVERNANCE</Tab>
            <Tab color="white" border="2px limegreen solid">🎮 QUEST 4 STOKEN</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <HiveBlog />
          </TabPanel>
          <TabPanel>
            <HiveVideos />
          </TabPanel>
          <TabPanel>
            <SnapShot />
          </TabPanel>
          <TabPanel>
            <QFS />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Chat />  
    </Flex>
  );
};



export default Home;
