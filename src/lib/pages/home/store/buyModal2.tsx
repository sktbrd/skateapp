import React, { useEffect, useState } from "react";
import axios from "axios";
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
  nome: string;
  setNome: React.Dispatch<React.SetStateAction<string>>;
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
  nome,
  setNome,
  email,
  setEmail,
  amount,
  setAmount,
  hiveMemo,
  setHiveMemo,
  buyingIndex,
  cardData,  


}) => {

  const [cep, setCep] = useState("");
  const [complemento, setComplemento] = useState("");


  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
  });

  const initialAmount = "13.000";

  useEffect(() => {
    console.log("HiveMEMO:", hiveMemo);
  }, [hiveMemo]);

  useEffect(() => {
    if (cep.length === 8) {
      fetchAddressByCep();
    }
}, [cep]);



  const handleTransfer = async () => {
    try {
      
      // Parse the amount to a float with 3 decimal places
      const parsedAmount = parseFloat(amount).toFixed(3);
      const selectedCard = buyingIndex !== null ? cardData[buyingIndex] : null;

      function criarHiveMemo(email: string, endereco: string, card: Card, address: any): string {
        // Combine os valores de e-mail e endereço em uma única string
        const hivememo: string = `E-mail: ${email} | Nome: ${nome} | Nome da Meia: ${card.subtitle}| Logradouro: ${address.street} | Cidade: ${address.city} | Estado: ${address.state}| Complemento: ${complemento}`;
        setHiveMemo(hivememo)
        console.log("HiveMEMO:", hiveMemo)
        return hivememo;
      }

      if (selectedCard) {
        // Initialize the KeychainSDK
        const keychain = new KeychainSDK(window);

        // Criar hiveMemo temporário
        const tempHiveMemo = criarHiveMemo(email, nome, selectedCard, address,);

        // Atualizar o estado hiveMemo
        setHiveMemo((prevHiveMemo) => {
          if (prevHiveMemo !== tempHiveMemo) {
            console.log("HiveMEMO atualizado:", tempHiveMemo);
            return tempHiveMemo;
          }
          return prevHiveMemo;
        });
        
        if (!cep || !complemento || !nome || !email) {
          alert("Por favor, preencha todos os campos obrigatórios.");
          return;
        }



  
        // Define the transfer parameters
        const transferParams = {
          data: {
            username: "pepe", // Replace with the sender's username
            to: "crowsnight",
            amount: initialAmount, // Use the parsed amount with 3 decimal places
            memo: tempHiveMemo,
            enforce: false,
            currency: "HBD",
          },
        };
  
        const transfer = await keychain.transfer(transferParams.data);
        console.log({ transfer });
      }
    } catch (error) {
      console.error("Transfer error:", error);
    }
  };

  const criarHiveMemo = (email: string, nome: string, card: Card): string => {
    const hivememo: string = `E-mail: ${email} | Nome: ${nome} | Nome da Meia: ${card.subtitle}`;
    return hivememo;
  };
  // Seu componente React
  const fetchAddressByCep = async () => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const { logradouro, localidade, uf } = response.data;

      setAddress({
        street: logradouro,
        city: localidade,
        state: uf,
      });
    } catch (error) {
      console.error("Error fetching address:", error);
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
             placeholder="CEP"
             value={cep}
             onChange={(e) => setCep(e.target.value)}
             color={"white"}
             maxLength={8}
            />
            <Input
            placeholder="Complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            color={"white"}
            />


          <Input 
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value) }
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