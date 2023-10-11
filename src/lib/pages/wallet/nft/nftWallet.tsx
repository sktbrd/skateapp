import React from "react";
import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import PoapWallet from "./poapWallet";
import AllNfts from "./allNfts";
import GnarsNfts from "./gnarsNfts";
const NftWallet = () => {
  return (
    <Flex flexDirection="column">
      <Tabs isFitted variant="enclosed-colored" colorScheme="green">
        <TabList>
          <Tab>POAPs</Tab>
          <Tab>Gnars</Tab>
          <Tab>All NFTs</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <PoapWallet />
          </TabPanel>
          <TabPanel>
            <GnarsNfts />
          </TabPanel>
          <TabPanel>
          <AllNfts />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default NftWallet;
