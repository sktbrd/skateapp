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
  Image
} from "@chakra-ui/react";

// Import the KeychainSDK
import { KeychainSDK } from "keychain-sdk";
import { Card } from "@chakra-ui/react";

interface Card {
  imageUrl: string;
  subtitle: string;
  url?: string;
  hoverImageUrl?: string;
  price?: string;
}


interface SendHiveModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  endereco: string;
  setEndereco: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  toAddress: string;
  setToAddress: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  hiveMemo: string;
  setHiveMemo: React.Dispatch<React.SetStateAction<string>>;
  buyingIndex: number | null;
  cardData: Card[];

}

const BuyModal: React.FC<SendHiveModalProps> = ({
  showModal,
  setShowModal,
  endereco,
  setEndereco,
  email,
  setEmail,
  amount,
  setAmount,
  hiveMemo,
  setHiveMemo,
  buyingIndex,
  cardData,  


}) => {

  const initialAmount = "13.000";


  const handleTransfer = async () => {
    try {
      // Parse the amount to a float with 3 decimal places
      const parsedAmount = parseFloat(amount).toFixed(3);
      function criarHiveMemo(email: string, endereco: string): string {
        // Combine os valores de e-mail e endereço em uma única string
        const hivememo: string = `E-mail: ${email} | Endereço: ${endereco}`;
        setHiveMemo(hivememo)
        console.log("HiveMEMO:", hiveMemo)
        return hivememo;
      }

      // Initialize the KeychainSDK
      const keychain = new KeychainSDK(window);
      console.log(endereco)
      console.log("Email:" , email)
      criarHiveMemo(email,endereco)
      console.log(hiveMemo)
      // Define the transfer parameters
      const transferParams = {
        data: {
          username: "pepe", // Replace with the sender's username
          to: "crowsnight",
          amount: initialAmount, // Use the parsed amount with 3 decimal places
          memo: hiveMemo, 
          enforce: false,
          currency: "HBD",
        },
      };


      
      // Perform the transfer using Keychain's transfer method
      const transfer = await keychain.transfer(transferParams.data);

      // Check if the transfer was successful and handle the response
      console.log({ transfer });
      // You can handle success and show a confirmation message to the user
    } catch (error) {
      // Handle errors, such as if Keychain is not available, the user denies the transfer, etc.
      console.error("Transfer error:", error);
      // You can display an error message to the user
    }
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
      <ModalOverlay opacity={0.2}/>
      <ModalContent bg="black" border="3px solid #5e317a">
        <ModalHeader color="#b4d701" margin={"auto"}>{buyingIndex !== null ? cardData[buyingIndex].subtitle : ""}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box border="3px solid #5e317a" padding="10px">

          {buyingIndex !== null && (
            <Image
              src={cardData[buyingIndex].imageUrl}
              alt={`Image ${buyingIndex + 1}`}
              style={{ width: "50%", marginTop: "10px", maxWidth: "100%", display: "block", margin: "auto" }}

            />
          )}

          
            <Input
              placeholder="60 🩸"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              readOnly
              defaultValue={initialAmount}
              color={'white'}
            />
          <Input 
            placeholder="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value) }
            color={'white'}
            
          />

         <Input 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value) }
            color={'white'}
            
          />
          
          </Box>
        </ModalBody>
        <ModalFooter margin={"auto"}>
          <Button colorScheme="purple" mr={3} onClick={handleTransfer}>
            Comprar
          </Button>
          <Button colorScheme="purple" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BuyModal;