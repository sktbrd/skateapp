import { Flex, Tabs, TabList, Tab, TabPanels, TabPanel, useTabs,Image, VStack, Text } from "@chakra-ui/react";
import HiveBlog from "./Feed/Feed";
import HiveVideos from "./videos/FeedVideo";
import SnapShot from "./dao/snapshot";
import Chat from "./chat";
import QFS from "../qfs";
import NewUpload from "../upload/newUpload";


  const Home = () => {
    const { selectedIndex, ...tabProps } = useTabs({});
  
    return (
      <Flex direction="column" alignItems="center" justifyContent="center">
        <Tabs isFitted variant="line" width="100%" colorScheme="yellow" {...tabProps} size='sm' >
          <TabList mb="1em" width="100%">
            <Tab
              color="white"
              fontSize="20px"
              border="1px black solid"
              _selected={{ backgroundColor: "#65418C",color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              <VStack><Image src="assets\gifs\crows2.gif" alt="" width="40%" height="auto" style={{margin: "-4%"}} /><Text>PORTAL 666</Text></VStack>
              
            </Tab>
            {/* <Tab
              color="white" 
              border="2px black solid"
              _selected={{ backgroundColor: "#65418C",color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              <Image src="assets\gifs\crows1.gif" alt="" width="20%" height="auto"/>VIDEOS
            </Tab> */}
            {/* <Tab
              color="white"
              border="2px limegreen solid"
              _selected={{ backgroundColor: "limegreen",color:"black", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              🎮 PLAY
            </Tab> */}
            <Tab
             color="white"
             fontSize="20px"
             border="1px black solid"
             _selected={{ backgroundColor: "#65418C",color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
            >
              <VStack><Image src="assets\gifs\crows2.gif" alt="" width="40%" height="auto" style={{margin: "-4%"}} /><Text>UPLOAD</Text></VStack>
            </Tab>
            <Tab
            color="white"
            fontSize="20px"
            border="1px black solid"
            _selected={{ backgroundColor: "#65418C",color:"white", fontWeight:"bold", border:"1px solid white" }} // Change the background color when selected
           >
             <VStack><Image src="assets\gifs\crows2.gif" alt="" width="40%" height="auto" style={{margin: "-4%"}} /><Text>LOJA</Text></VStack>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <HiveBlog />
            </TabPanel>
            <TabPanel>
            <NewUpload/>
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



