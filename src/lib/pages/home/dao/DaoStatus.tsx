import React, { useEffect, useState } from 'react';
import { Tabs, Tab, TabList, TabPanel, TabPanels, Flex } from "@chakra-ui/react";

// Components
import HiveStats from './components/steemskate/hiveStats';
import EthereumStats from './components/ethereum/ethereumStats';
import GnarsStats from './components/hiveGnars/gnars';
import CommunityStats from './communityStats';

const DaoStatus = () => {
  // Define hooks
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("skatehive"); // Default active tab

  return (
    <Flex border={'1px so'} flexDirection="column" paddingBottom="10px" width="100%">

      <Tabs variant='enclosed' >
    

      <TabList justifyContent="center">
          <Tab
            onClick={() => setActiveTab("skatehive")}
            color={activeTab === "skatehive" ? "orange" : "gray.500"}
          >
            Skatehive
          </Tab>
          <Tab
            onClick={() => setActiveTab("gnars")}
            color={activeTab === "gnars" ? "yellow" : "gray.500"}
          >
            Gnars
          </Tab>
        </TabList>
        <center>

        <TabPanels justifyContent={'center'}>
          <TabPanel >
            {activeTab === "skatehive" && (
              <div>

              <CommunityStats communityTag="skatehive" />
              <center>

              <Flex maxWidth={"90%"}
                flexDirection={{ base: 'column', md: 'row' }} // Use 'column' on small screens and 'row' on medium and larger screens
                >
                

                <EthereumStats />
                <HiveStats wallet="steemskate" />
                
              </Flex>
                </center>

              </div>
            )}
          </TabPanel>
          <TabPanel>
            {activeTab === "gnars" && <GnarsStats />}
            
          </TabPanel>
        </TabPanels>
            </center>

      </Tabs>

    </Flex>
  );
}

export default DaoStatus;
