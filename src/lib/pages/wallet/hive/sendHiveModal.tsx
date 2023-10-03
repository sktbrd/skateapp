import React from "react";
import { Modal, Button, Input, Box, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";

interface SendHiveModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  toAddress: string;
  setToAddress: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  handleTransfer: () => Promise<void>;
}

const SendHiveModal: React.FC<SendHiveModalProps> = ({
  showModal,
  setShowModal,
  toAddress,
  setToAddress,
  amount,
  setAmount,
  handleTransfer,
}) => {
  return (
    <Modal  isOpen={showModal} onClose={() => setShowModal(false)} size="md">
      <ModalOverlay />
      <ModalContent backgroundColor="black" border="1px dashed limegreen">
        <ModalHeader>Send Hive (under development)</ModalHeader>
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleTransfer}>
            Send
          </Button>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SendHiveModal;
