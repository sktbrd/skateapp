import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import HiveBlog from "./posts/Feed";
import HiveVideos from "./posts/FeedVideo";
import SnapShot from "./snapshot";

const Home = () => {
  return (
    <Flex backgroundColor="black" direction="column" alignItems="center" justifyContent="center">
      <Tabs isFitted variant="soft-rounded" width="100%" colorScheme="green">
        <TabList  mb="1em" width="100%">
          <Tab border="1px limegreen solid">Magazine</Tab>
          <Tab border="1px limegreen solid">Videos</Tab>
          <Tab border="1px limegreen solid">Governance</Tab>
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
        </TabPanels>
      </Tabs>
    </Flex>
  );
};



export default Home;
