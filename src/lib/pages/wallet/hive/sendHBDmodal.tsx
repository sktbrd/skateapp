import React, { memo } from "react";
import {
  Modal,
  Button,
  Input,
  Box,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
} from "@chakra-ui/react";

// Import the KeychainSDK
import { KeychainSDK } from "keychain-sdk";
import sendHBD from "lib/pages/utils/hiveFunctions/sendHBD";

interface SendHiveModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  toAddress: string;
  setToAddress: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  hiveMemo: string;
  setHiveMemo: React.Dispatch<React.SetStateAction<string>>;
}

const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";

const SendHBDModal: React.FC<SendHiveModalProps> = ({
  showModal,
  setShowModal,
  toAddress,
  setToAddress,
  amount,
  setAmount,
  hiveMemo,
  setHiveMemo,
}) => {

  const handleTransfer = async () => {
    // Call sendHive with the required arguments
    await sendHBD(amount, toAddress, hiveMemo);
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
      <ModalOverlay opacity={0.2}/>
      <ModalContent backgroundColor="black" border="1px dashed limegreen">
        <Box marginTop={"20px"} display="flex" justifyContent="center">
          <Image boxSize={"128px"} src={HBD_LOGO_URL}></Image>
        </Box>
        <center>
        <ModalHeader>SEND HBD</ModalHeader>
        </center>

        <ModalCloseButton />
        <ModalBody>
          <Box border="1px solid orange" padding="10px">
            <Input
              placeholder="To Address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
            <Input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          <Input 
            placeholder="Memo (optional)"
            value={hiveMemo}
            onChange={(e) => setHiveMemo(e.target.value) }
          />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" mr={3} onClick={handleTransfer}>
            Send
          </Button>
          <Button variant="solid" backgroundColor={"red"} color="black" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SendHBDModal;
