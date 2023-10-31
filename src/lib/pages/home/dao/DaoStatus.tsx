import React, { useEffect, useState } from 'react';
import { Tabs, Tab, TabList, TabPanel, TabPanels, Flex } from "@chakra-ui/react";

// Components
import HiveStats from './components/steemskate/hiveStats';
import EthereumStats from './components/ethereum/ethereumStats';
import GnarsStats from './components/hiveGnars/gnars';

const DaoStatus = () => {
  // Define hooks
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("skatehive"); // Default active tab

  return (
    <Flex flexDirection="column" paddingBottom="10px" width="100%">

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
        <TabPanels>
          <TabPanel>
            {activeTab === "skatehive" && (
              <Flex flexDirection="row" paddingBottom="30px" width="100%">
                <EthereumStats />
                <HiveStats wallet="steemskate" />
              </Flex>
            )}
          </TabPanel>
          <TabPanel>
            {activeTab === "gnars" && <GnarsStats />}
            
          </TabPanel>
        </TabPanels>

      </Tabs>

    </Flex>
  );
}

export default DaoStatus;
