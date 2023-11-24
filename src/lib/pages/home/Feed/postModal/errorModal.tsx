import React from 'react';
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Text } from '@chakra-ui/react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, errorMessage }) => {
    
  return (
    <Modal  isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent padding={"10px"} border={"1px dashed limegreen"} backgroundColor="black">
        <ModalHeader>Error</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text color={"white"}>{errorMessage}</Text>
          <Box mt={4}>
            <Button colorScheme="red" onClick={onClose}>
              Close
            </Button>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>

  );
};

export default ErrorModal;
