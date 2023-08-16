import React from "react";
import { Box, Flex, HStack, Text, Spacer, Tabs, TabList, Tab, TabProps, useBreakpointValue, Image } from "@chakra-ui/react";
//@ts-ignore
import { Pioneer } from "pioneer-react";
import { Link, LinkProps as RouterLinkProps } from "react-router-dom";

const PROJECT_NAME = "Skate App";

// Custom LinkTab component
type LinkTabProps = TabProps & RouterLinkProps;

const LinkTab: React.FC<LinkTabProps> = ({ to, children, ...tabProps }) => (
  <Link to={to}>
    <Tab {...tabProps}>{children}</Tab>
  </Link>
);

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
      <Image 
    src="https://png.pngtree.com/element_our/png/20181129/green-marijuana-leaf-png_252592.jpg" 
    alt="Placeholder Image" 
    mr={2} 
    boxSize="32px"  // This sets both width and height to 32px
    borderRadius="50%"  // Optional: to make the image circular
/>
        <Text fontSize={fontSize} color="white">
          {PROJECT_NAME}
        </Text>
        <Spacer />
        <Pioneer />
      </Flex>

      {/* Tabs centered horizontally */}
      <Tabs
        variant="soft-rounded"
        colorScheme="whiteAlpha"
        position={{ base: "relative", md: "absolute" }}
        left="50%"
        bottom={0}
        transform="translateX(-50%)"
        size={tabSize}
        mb={4}
        css={{
          border: "2px solid limegreen",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <TabList>
          <LinkTab to="/">Home</LinkTab>
          <LinkTab to="/upload">Upload</LinkTab>
          <LinkTab to="/wallet">Wallet</LinkTab>
        </TabList>
      </Tabs>
    </Flex>
  );
};

export default HeaderNew;
