import React from 'react';
import { Flex, Box, Grid, Image, Text, VStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
interface Card {
  imageUrl: string;
  subtitle: string;
  url?: string;
  hoverImageUrl?: string;
  price?: string;
}

const cardData: Card[] = [
  {
    imageUrl: '/assets/meias/meiasanguepreto.jpg',
    hoverImageUrl: '', // Specify hover image URL
    subtitle: 'Sangue',
    url: '',
    price: 'Valor: 100,00'
    },
    {
    imageUrl: '/assets/meias/meiaolhos.jpg',
    subtitle: 'Olhos',
    price: 'Valor: 100,00'
    },

  {
    imageUrl: '/assets/meias/meiaossobranca.jpg',
    subtitle: 'Ossos',
    price: 'Valor: 100,00'
  },
  {
    imageUrl: '/assets/meias/meiaossopreto.jpg',
    subtitle: 'Ossos',
    price: 'Valor: 100,00'
  },
  {
    imageUrl: '/assets/meias/meiasanguebranca.jpg',
    subtitle: 'Sangue',
    hoverImageUrl: '',
    price: 'Valor: 100,00'
  },
  {
    imageUrl: '/assets/meias/meiavela.jpg',
    subtitle: 'Velas',
    url: '',
    hoverImageUrl: '',
    price: 'Valor: 100,00'
  },
  {
    imageUrl: '/assets/meias/meiavelaelogo.jpg',
    subtitle: 'Vela e corvo',
    price: 'Valor: 100,00'
  },
  {
    imageUrl: '/assets/meias/meiaverme.jpg',
    subtitle: 'Vermes',
    url: '',
    price: 'Valor: 100,00'
    
  },

];

const Store: React.FC = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
      <>
        <center>
          <Text fontSize={"48px"}>
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
              borderWidth="1px"
              borderRadius="lg"
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
                    src='/assets/crlogo.ico'
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
                        fontSize="lg"
                        fontWeight="bold"
                        marginLeft={'8px'}
                        color={'white'}
                    >
                        {card.subtitle}
                    </ChakraLink>
                    </Flex>
                    {card.price && <Text fontSize="md" color="white">{card.price}</Text>}
                </center>
                </VStack>

            </Box>
          ))}
        </Grid>
      </>
    );
};

export default Store;