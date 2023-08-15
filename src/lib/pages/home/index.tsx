import {
  Button,
  useDisclosure,
  Modal,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  ModalContent,
  ModalHeader,

  Flex
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import HiveBlog from "./components/Feed";


import {
  usePioneer,
  AssetSelect,
  BlockchainSelect,
  WalletSelect,
  // @ts-ignore
} from "pioneer-react";

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Flex direction="column" alignItems="center" justifyContent="center" >
      <HiveBlog /> {/* Including the HiveBlog component */}
    </Flex>
  );
};


export default Home;

