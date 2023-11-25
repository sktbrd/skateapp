import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import { KeychainSDK } from "keychain-sdk";

interface User {
  balance: string;
  hbd_balance: string;
  savings_hbd_balance: string;
  vesting_shares: string;
  delegated_vesting_shares: string;
  received_vesting_shares: string;
  name?: string;
}

interface PowerUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface PowerUp {
  username: string;
  recipient: string;
  hive: string;
}

const PowerUpModal: React.FC<PowerUpModalProps> = ({ isOpen, onClose, user }) => {
  const [amount, setAmount] = useState<string>("");

  const handlePowerUp = async () => {
    try {
      const keychain = new KeychainSDK(window);

      const amountValue = parseFloat(amount);

      if (isNaN(amountValue)) {
        console.error("Invalid amount");
        return;
      }

      const formattedAmount = amountValue.toFixed(3); // Format the amount to have 3 decimal places

      const formParamsAsObject = {
        data: {
          username: user?.name || "",
          recipient: user?.name || "",
          hive: formattedAmount,
        },
      };

      // You can add any additional checks or processing before making the transaction
      console.log("Sending transaction...");

      const powerup = await keychain.powerUp(formParamsAsObject.data as PowerUp);
      console.log({ powerup });

      // Additional logic after successful transaction, if needed

      // Close the modal
      onClose();
    } catch (error) {
      console.error({ error });
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false}>
      <ModalOverlay
        display="flex"
        alignItems="center"
        justifyContent="center"
        background="rgba(0, 0, 0, 0.5)"
      />
      <ModalContent bg={"black"} border={"1px solid limegreen"} borderRadius="8px">
        <ModalHeader>Power Up</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input
              type="text"
              placeholder="Enter amount to power up"
              value={amount}
              onChange={handleInputChange}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handlePowerUp}>
            Power Up
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PowerUpModal;
