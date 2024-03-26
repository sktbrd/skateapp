import React from 'react';
import { Flex, Box, Grid, Image, Text, VStack, Link as ChakraLink, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import BuyModal from './buyModal2';
import { color } from 'framer-motion';
import cardData from './cardData';


const Store: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [buyingIndex, setBuyingIndex] = useState<number | null>(null);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [hiveMemo, setHiveMemo] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const handleOpenModal = () => {
    setShowModal(true);
    console.log(showModal)
  };
  const handleBuy = (index: number) => {
    setBuyingIndex(index);
    handleOpenModal();
    console.log(`Compra do item ${index + 1}`);
  }

  return (
    <>
      <center>
        <Text fontSize={"48px"} color={"#b4d701"} >
          LOJA
        </Text>
      </center>

      <Grid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={4}
        p={4}
      >
        {cardData.map((card, index) => (
          <Box
            key={index}
            borderWidth="3px"
            borderRadius="lg"
            borderColor={"white"}
            overflow="hidden"
            style={{ filter: 'initial' }}
            bg='black'
          >
            <RouterLink to={card.url || '/'}>
              <div
                style={{
                  width: '100%',
                  paddingTop: '100%',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'initial',
                    transition: 'transform 0.3s ease-in-out',
                    transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                  }}
                  src={hoveredIndex === index ? card.hoverImageUrl || card.imageUrl : card.imageUrl}
                  alt={`Image ${index + 1}`}
                />
                <Image
                  boxSize={10}
                  src='/assets/lojabless/blesslogo.png'
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    transform: 'scale(0)',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                />
              </div>
            </RouterLink>

            <VStack spacing={2} align="center" p={4}>
              <center>
                <Flex alignItems="center">
                  <Image
                    boxSize={10}
                    src='/assets/crlogo.ico'
                  />
                  <ChakraLink
                    as={RouterLink}
                    to={card.url || '/'}
                    fontSize="sm"
                    fontWeight="bold"
                    marginLeft={'8px'}
                    color={'white'}
                  >
                    {card.subtitle}
                  </ChakraLink>
                </Flex>
                {card.price && <Text fontSize="md" color="white">{card.price}</Text>}
                <Button onClick={() => handleBuy(index)} background={"white"} color={"black"}>Comprar</Button>
              </center>
            </VStack>
            <BuyModal
              showModal={showModal}
              email={email}
              setShowModal={setShowModal}
              toAddress={toAddress}
              setToAddress={setToAddress}
              amount={amount}
              setAmount={setAmount}
              hiveMemo={hiveMemo}
              setHiveMemo={setHiveMemo}
              nome={nome}
              setNome={setNome}
              setEmail={setEmail}
              buyingIndex={buyingIndex}
              cardData={cardData}
            />

          </Box>
        ))}
      </Grid>

    </>

  );
};

export default Store;