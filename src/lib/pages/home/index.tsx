import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel, useTabs } from "@chakra-ui/react";
import HiveBlog from "./Feed/Feed";
import HiveVideos from "./videos/FeedVideo";
import SnapShot from "./dao/snapshot";
import Chat from "./chat";
import QFS from "../qfs";
import UploadPage from "../upload";


  const Home = () => {
    const { selectedIndex, ...tabProps } = useTabs({});
  
    return (
      <Flex backgroundColor="white" direction="column" alignItems="center" justifyContent="center">
        <Tabs isFitted variant="enclosedyarn" width="100%" colorScheme="yellow" {...tabProps}>
          <TabList mb="1em" width="100%">
            <Tab
              color="black"
              border="1px limegreen solid"
              _selected={{ backgroundColor: "limegreen",color:"black", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              📜 FEED
            </Tab>
            <Tab
              color="black" 
              border="1px limegreen solid"
              _selected={{ backgroundColor: "limegreen",color:"black", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              📹 VIDEOS
            </Tab>
            {/* <Tab
              color="white"
              border="2px limegreen solid"
              _selected={{ backgroundColor: "limegreen",color:"black", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              🎮 PLAY
            </Tab> */}
            <Tab
              color="black"
              border="1px limegreen solid"
              _selected={{ backgroundColor: "limegreen" ,color:"black", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              🛹 UPLOAD
            </Tab>
            <Tab
              color="black"
              border="1px limegreen solid"
              _selected={{ backgroundColor: "blue" ,color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
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
            {/* <TabPanel>
              <QFS />
            </TabPanel> */}
            <TabPanel>
              <UploadPage />
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



