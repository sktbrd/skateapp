import React, { useState, useEffect } from "react";
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

interface DelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface Delegation {
  username: string;
  delegatee: string;
  amount: string;
  unit: string;
}

const DelegationModal: React.FC<DelegationModalProps> = ({ isOpen, onClose, user }) => {
  const [delegatee, setDelegatee] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [unit, setUnit] = useState<string>("HP"); // Assuming HP is the default unit

  const handleDelegation = async () => {
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
          delegatee: "steemskate",
          amount: formattedAmount,
          unit,
        },
      };

      console.log("Sending delegation transaction...");

      const delegation = await keychain.delegation(formParamsAsObject.data as Delegation);
      console.log({ delegation });

      onClose();
    } catch (error) {
      console.error({ error });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setAmount(value);
    } else if (name === "unit") {
      setUnit(value);
    }
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
        <ModalHeader>Delegate</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mt={4}>
            <FormLabel>Amount</FormLabel>
            <Input
              type="text"
              placeholder="Enter amount to delegate"
              name="amount"
              value={amount}
              onChange={handleInputChange}
            />
          </FormControl>

        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleDelegation}>
            Delegate!
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DelegationModal;
