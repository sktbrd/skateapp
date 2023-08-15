import React from "react";
import { Box, Flex, HStack, Text, Spacer, Tabs, TabList, Tab, useBreakpointValue } from "@chakra-ui/react";
// @ts-ignore
import { Pioneer } from "pioneer-react";
import { Link as RouterLink } from "react-router-dom";

const PROJECT_NAME = "Skate App";

const HeaderNew = () => {
  const fontSize = useBreakpointValue({ base: "2xl", md: "3xl" });
  const tabSize = useBreakpointValue({ base: "sm", md: "md" });
  const flexDirection = useBreakpointValue<"row" | "column">({ base: "column", md: "column" });

  return (
    <Flex
      as="header"
      direction={flexDirection}
      alignItems="center"
      justifyContent="space-between"
      p={4}
      bg="black"
      border="1px solid limegreen"
      position="relative"
      borderRadius="10px"
    >
      <Flex width="100%" justifyContent="center" alignItems="center" mb={{ base: 2, md: 0 }}>
        <Text fontSize={fontSize} color="white">
          {PROJECT_NAME}
        </Text>
        <Spacer />
        <Pioneer />
      </Flex>

      {/* Tabs centered horizontally */}
      <Tabs
        variant="enclosed"
        colorScheme="whiteAlpha"
        position={{ base: "relative", md: "absolute" }}
        left="50%"
        bottom={0}
        transform="translateX(-50%)"
        size={tabSize}
      >
        <TabList>
          <Tab>Home</Tab>
          <Tab>Upload</Tab>
          <Tab>Wallet</Tab>
        </TabList>
      </Tabs>
    </Flex>
  );
};

export default HeaderNew;
