import { Box } from '@chakra-ui/react';
import Plaza from '../../plaza';
const EmbeddedMap: React.FC = () => {
  const mapSrc = "https://www.google.com/maps/d/u/1/embed?mid=1iiXzotKL-uJ3l7USddpTDvadGII&hl=en&ll=29.208380630280647%2C-100.5437214508988&z=4";

  return (
    <Box
      display="flex"       // Enables Flexbox layoutyarn
      justifyContent="center" // Centers content along the main axis
      alignItems="center"  // Centers content along the cross axis
      border="1px"
      borderColor="gray.200"
      boxShadow="base"
      rounded="md"
      overflow="hidden"
      width="80%"
      mx="auto"            // Sets the left and right margins to "auto" to center the Box itself
      my={4}               // Optionally adds vertical margin for spacing
    >
      <iframe
        src={mapSrc}
        width="100%"
        height="800px"
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <Plaza />
    </Box>
  );
};

export default EmbeddedMap;
