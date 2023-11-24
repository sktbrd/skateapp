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

interface PowerDown {
  username: string;
  hive_power: string; // Remove the optional operator
}



const PowerDownModal: React.FC<PowerUpModalProps> = ({ isOpen, onClose, user }) => {
  const [amount, setAmount] = useState<string>("");

  const handlePowerDown = async () => {
    try {
      const keychain = new KeychainSDK(window);

      const amountValue = parseFloat(amount);

      if (isNaN(amountValue)) {
        console.error("Invalid amount");
        return;
      }

      const formattedAmount = amountValue.toFixed(3);

      const formParamsAsObject = {
        data: {
          username: user?.name || "",
          hive_power: formattedAmount,
        },
      };

      console.log("Sending transaction...");

      const powerdown = await keychain.powerDown(formParamsAsObject.data as PowerDown);
      console.log({ powerdown });

      onClose();
    } catch (error) {
      console.error({ error });
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

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
        <ModalHeader>Power Down</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input
              type="text"
              placeholder="Enter amount to power down"
              value={amount}
              onChange={handleInputChange}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handlePowerDown}>
            Power Down
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PowerDownModal;
