import React from "react";
import { Modal, Button, Input } from "@chakra-ui/react";

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
    <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
      {/* Modal Content */}
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
      <Button onClick={handleTransfer}>Send</Button>
    </Modal>
  );
};

export default SendHiveModal;
