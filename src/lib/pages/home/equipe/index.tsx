import React from 'react';
import { Flex, Box, Grid, Image, Text, VStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
interface Card {
  imageUrl: string;
  subtitle: string;
  url?: string;
  hoverImageUrl?: string;
}

const cardData: Card[] = [
  {
    imageUrl: '../../../../assets/team/baba.png',
    hoverImageUrl: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimg1.wikia.nocookie.net%2F__cb20120603213349%2Fsonicpokemon%2Fimages%2F7%2F77%2FPikachu.png&f=1&nofb=1&ipt=4b3752fce892cbbbde3e01e1d1bbc9bb6ac25a8520fb33e66be90fc1628a8cef&ipo=images', // Specify hover image URL
    subtitle: 'Baba de Lex',
    url: '/profile/babaskt'
    },
    {
    imageUrl: '../../../../assets/team/zero.png',
    subtitle: 'Zero ',
    },

  {
    imageUrl: '../../../../assets/team/bodao.png',
    subtitle: 'Matheus BodÃ¥o',
  },
  {
    imageUrl: '../../../../assets/team/emo.png',
    subtitle: 'Guilherme',
  },
  {
    imageUrl: '../../../../assets/team/harleyvladson.png',
    subtitle: 'Xvlad 666',
    hoverImageUrl: '../../../../assets/team/vlad_hover.gif',
  },
  {
    imageUrl: '../../../../assets/team/pharra.png',
    subtitle: 'PharRat',
    url: 'https://www.instagram.com/pharraskt/',
    hoverImageUrl: '../../../../assets/team/pharra_hover.gif',
  },
  {
    imageUrl: '../../../../assets/team/defon.jpg',
    subtitle: 'Defon',
    url: 'https://crowsnight.vercel.app/profile/doblershiva'
  },
  {
    imageUrl: '../../../../assets/team/bruno.png',
    subtitle: 'Bruno Boaz',
    url: 'https://www.instagram.com/chriscobracole/'
  },

];

const Equipe: React.FC = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
      <>
        <center>
          <Text fontSize={"48px"}>
            MONSTROS
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
              style={{ filter: 'grayscale(100%)' }}
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
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease-in-out',
                      transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                    }}
                    src={hoveredIndex === index ? card.hoverImageUrl || card.imageUrl : card.imageUrl}
                    alt={`Image ${index + 1}`}
                  />
                  <Image
                    boxSize={10}
                    src='https://i.pinimg.com/originals/00/10/0a/00100af8e857761d150425dbc8213d69.gif'
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
                      src='https://i.pinimg.com/originals/00/10/0a/00100af8e857761d150425dbc8213d69.gif'
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
                </center>
              </VStack>
            </Box>
          ))}
        </Grid>
      </>
    );
};

export default Equipe;