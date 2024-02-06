import { Box, Flex, HStack, Text, Image, useBreakpointValue } from '@chakra-ui/react';
import Plaza from '../plaza';

const EmbeddedMap: React.FC = () => {
  const mapSrc = "https://www.google.com/maps/d/u/1/embed?mid=1iiXzotKL-uJ3l7USddpTDvadGII&hl=en&ll=29.208380630280647%2C-100.5437214508988&z=4";

  // Use useBreakpointValue to adjust the width and padding responsively
  const boxWidth = useBreakpointValue({ base: "90%", sm: "80%", md: "75%", lg: "70%" });
  const paddingX = useBreakpointValue({ base: 2, sm: 4, md: 6 });
  const paddingY = useBreakpointValue({ base: 2, sm: 4 });
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <>

      <Flex flexDirection={"column"} align="center">
        <Box
          borderRadius={"10px"}
          bg="linear-gradient(90deg, yellow 0%, white 100%)"
          p={{ base: 0, md: 5 }} // Apply responsive padding
          width={boxWidth} // Use the responsive width
          maxWidth="100%" // Ensure it doesn't get too wide on larger screens
          mx="auto" // Center the box
          overflow="hidden" // Prevent content from overflowing
        >
          {/* Conditional rendering based on isMobile */}
          <iframe
            src={mapSrc}
            width="100%"
            height="500px"
            style={{ border: "0", borderRadius: "10px" }} // Add some styling to iframe
            allowFullScreen
          ></iframe>

          <Flex flexDirection={{ base: "column", md: "row" }} p={paddingY}>
            {!isMobile && (
              <Image
                p={paddingX}
                src="https://i.ibb.co/yqr3KQR/image.png"
                boxSize="300px" // Ensure the image is not too large on mobile
              />
            )}
            <Box p={paddingX} textAlign="center" maxWidth="600px">
              <Text fontSize="sm" color="black">
                The map above is a collection of skate spots from the SkateHive Spotbook. If you would like to add a spot, please follow these steps:
              </Text>
              <Text fontSize="sm" color="black" mt={2}>
                1. Take a photo of the spot. Try not to include people in the photo.
              </Text>
              <Text fontSize="sm" color="black">
                2. Find the coordinates of the spot. Latitude, then Longitude. This can be found by turning location services on with your photos on your phone.
              </Text>
              <Text fontSize="sm" color="black">
                3. Visit the SkateHive Spotbook and submit the spot.
              </Text>
            </Box>
          </Flex>
        </Box>

      </Flex>
      <Plaza URLPermlink="about-the-skatehive-spotbook" URLAuthor="web-gnar" compWidth='80%' />

    </>

  );
};

export default EmbeddedMap;
