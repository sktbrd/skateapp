import { Flex, Tabs, TabList, Tab, TabPanels, TabPanel, useTabs } from "@chakra-ui/react";
import HiveBlog from "./Feed/Feed";
import HiveVideos from "./videos/FeedVideo";
import SnapShot from "./dao/snapshot";
import Chat from "./chat";
import QFS from "../qfs";
import UploadPage from "../upload";


  const Home = () => {
    const { selectedIndex, ...tabProps } = useTabs({});
  
    return (
      <Flex direction="column" alignItems="center" justifyContent="center">
        <Tabs isFitted variant="enclosedyarn" width="100%" colorScheme="yellow" {...tabProps}>
          <TabList mb="1em" width="100%">
            <Tab
              color="white"
              fontSize="18px"
              border="2px black solid"
              _selected={{ backgroundColor: "#65418C",color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              <img src="assets\gifs\crows2.gif" alt="" width="13%" height="auto" style={{margin: "2%"}} />FEED
            </Tab>
            <Tab
              color="white" 
              border="2px black solid"
              _selected={{ backgroundColor: "#65418C",color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              <img src="assets\gifs\crows1.gif" alt="" width="10%" height="auto"/>VIDEOS
            </Tab>
            {/* <Tab
              color="white"
              border="2px limegreen solid"
              _selected={{ backgroundColor: "limegreen",color:"black", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              🎮 PLAY
            </Tab> */}
            <Tab
              color="white"
              border="2px black solid"
              _selected={{ backgroundColor: "#65418C" ,color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              <img src="assets\gifs\crows3.gif" alt="" width="10%" height="auto"/>UPLOAD
            </Tab>
            <Tab
              color="white"
              border="2px black solid"
              _selected={{ backgroundColor: "#65418C" ,color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              <img src="assets\gifs\crows4.gif" alt="" width="10%" height="auto"/> STORE
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



