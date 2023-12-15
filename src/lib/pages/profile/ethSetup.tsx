import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Badge,
  Box,
  VStack,
} from "@chakra-ui/react";
import useAuthUser from "../home/api/useAuthUser";
//@ts-ignore
import { usePioneer } from "@pioneer-platform/pioneer-react";

const EthSetup: React.FC = () => {
  const { user } = useAuthUser();
  const { state } = usePioneer();
  const { app, status } = state;
  const [ethAddress, setEthAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const onStart = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0 && app.wallets[0].wallet && app.wallets[0].wallet.accounts) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setEthAddress(currentAddress);
      } else {
        console.error("Some properties are undefined or null");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    onStart();
  }, [app, status]);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleStoreEthAddress = () => {
    const username = user?.name;
  
    if (username && window.hive_keychain) {
      try {
        const parsedMetadata = JSON.parse(user?.json_metadata || "");
        parsedMetadata.extensions = parsedMetadata.extensions || []; // Ensure 'extensions' field is an array
  
        // Add ethAddress to the extensions array
        parsedMetadata.extensions.push({ ethAddress });
  
        const stringifiedMetadata = JSON.stringify(parsedMetadata);
  
        console.log("Username:", username);
        console.log("Stringified Metadata:", stringifiedMetadata);
  
        const operations = [
          [
            "account_update2",
            {
              account: username,
              json_metadata: stringifiedMetadata,
              extensions: [], 
            },
          ],
        ];
  
        console.log("Operations:", operations);
  
        window.hive_keychain.requestBroadcast(username, operations, "active", (response: any) => {
          console.log("Broadcast Response:", response);
  
          if (response.success) {
            console.log("EthAddress stored successfully in Hive json_metadata:", ethAddress);
          } else {
            console.error("Error storing EthAddress:", response.message);
          }
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      console.error("Username or Hive Keychain not available");
    }
  
    handleCloseModal();
  };
  
  

  return (
    <>
      <Button onClick={handleOpenModal}>Store Eth Address in Hive Profile</Button>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent bg="black" border="1px solid limegreen" color="white">
          <ModalHeader>Add Ethereum Wallet Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack mb={4}>
            <Badge>
              <Text fontSize={"20px"}>{ethAddress}</Text>
            </Badge>
            <Button mt={4} colorScheme="teal" onClick={handleStoreEthAddress}>
              Confirm
            </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EthSetup;
