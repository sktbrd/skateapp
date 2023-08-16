import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Spacer,
  Tabs,
  TabList,
  Tab,
  TabProps,
  useBreakpointValue,
  Image,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
//@ts-ignore
import { Pioneer } from "pioneer-react";
import { Link, LinkProps as RouterLinkProps } from "react-router-dom";
import useAuthUser from "lib/pages/home/components/useAuthUser";
import HiveLogin from "lib/pages/home/components/HiveLoginModal";

const PROJECT_NAME = "Skate App";

// Custom LinkTab component
type LinkTabProps = TabProps & RouterLinkProps;

interface User {
  name?: string;
  avatar?: string;
}

const LinkTab: React.FC<LinkTabProps> = ({ to, children, ...tabProps }) => (
  <Link to={to}>
    <Tab {...tabProps}>{children}</Tab>
  </Link>
);

const HeaderNew = () => {
  const fontSize = useBreakpointValue({ base: "2xl", md: "3xl" });
  const tabSize = useBreakpointValue({ base: "sm", md: "md" });
  const flexDirection = useBreakpointValue<"row" | "column">({ base: "column", md: "column" });
  const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

  const { user, loginWithHive, logout, isLoggedIn } = useAuthUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [user]);

  const handleConnectHive = () => {
    if (loggedIn) {
      logout();
    } else {
      setModalOpen(true);
    }
};


  const avatarUrl = user ? `https://images.hive.blog/u/${user.name}/avatar` : DEFAULT_AVATAR_URL;

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
          mr={1} 
          boxSize="32px"
          borderRadius="50%"
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
          <Tab onClick={handleConnectHive}>
            {loggedIn ? (
              <>
<Avatar 
    src={avatarUrl} 
    size="sm" 
    mr={2} 
    w="24px"  // Set a fixed width
    h="24px"  // Set a fixed height
/>                {user?.name}
              </>
            ) : (
              "Connect Hive"
            )}
          </Tab>
        </TabList>
      </Tabs>

      {/* Hive Login Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <HiveLogin isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Modal>
    </Flex>
  );
};

export default HeaderNew;
