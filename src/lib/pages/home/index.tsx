import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel, useTabs } from "@chakra-ui/react";
import HiveBlog from "./magazine/Feed";
import HiveVideos from "./videos/FeedVideo";
import SnapShot from "./dao/snapshot";
import Chat from "./chat";
import QFS from "../qfs";


  const Home = () => {
    const { selectedIndex, ...tabProps } = useTabs({});
  
    return (
      <Flex backgroundColor="black" direction="column" alignItems="center" justifyContent="center">
        <Tabs isFitted variant="enclosedyarn" width="100%" colorScheme="yellow" {...tabProps}>
          <TabList mb="1em" width="100%">
            <Tab
              color="white"
              border="1px limegreen solid"
              _selected={{ backgroundColor: "blue.500" }} // Change the background color when selected
            >
              📜 FEED
            </Tab>
            <Tab
              color="white"
              border="1px limegreen solid"
              _selected={{ backgroundColor: "blue.500" }} // Change the background color when selected
            >
              📹 VIDEOS
            </Tab>
            <Tab
              color="white"
              border="2px limegreen solid"
              _selected={{ backgroundColor: "blue.500" }} // Change the background color when selected
            >
              🎮 PLAY
            </Tab>
            <Tab
              color="white"
              border="1px limegreen solid"
              _selected={{ backgroundColor: "blue.500" }} // Change the background color when selected
            >
              🏛 GOVERN.
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <HiveBlog />
            </TabPanel>
            <TabPanel>
              <HiveVideos />
            </TabPanel>
            <TabPanel>
              <QFS />
            </TabPanel>
            <TabPanel>
              <SnapShot />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Chat />
      </Flex>
    );
  };
  
  export default Home;



