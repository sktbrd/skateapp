import { Box, Flex, HStack, Text, Center } from '@chakra-ui/react';
import Plaza from '../plaza';
const EmbeddedMap: React.FC = () => {
  const mapSrc = "https://www.google.com/maps/d/u/1/embed?mid=1iiXzotKL-uJ3l7USddpTDvadGII&hl=en&ll=29.208380630280647%2C-100.5437214508988&z=4";

  return (
    <Flex m={5} flexDirection={"column"}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        border="1px"
        borderColor="gray.200"
        boxShadow="base"
        rounded="md"
        overflow="hidden"
        width="80%"
        mx="auto"
        my={4}
      >
        <iframe
          src={mapSrc}
          width="100%"
          height="500px"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </Box>
      <Center>

        <Box>
          <Text fontSize="sm" color="gray.500">
            The map above is a collection of skate spots from the SkateHive Spotbook. If you would like to add a spot, please visit follow the steps
          </Text>
          <ul>
            <li>
              <Text fontSize="sm" color="gray.500">
                1. Take a photo of the spot. Try not to include people in the photo.
              </Text>
            </li>
            <li>
              <Text fontSize="sm" color="gray.500">
                2. Find the coordinates of the spot. Latitude, then Longitude. This can be found by turning location services on with your photos on your phone.
              </Text>
            </li>
            <li>
              <Text fontSize="sm" color="gray.500">
                3. Visit the SkateHive Spotbook and submit the spot.
              </Text>
            </li>
          </ul>
        </Box>
      </Center>

      <Plaza URLPermlink="about-the-skatehive-spotbook" URLAuthor="web-gnar" />

    </Flex>
  );
};

export default EmbeddedMap;
