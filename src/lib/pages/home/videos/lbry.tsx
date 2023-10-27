import React, { useState, useEffect } from 'react';
import { Box, Flex, Text ,Grid} from '@chakra-ui/react';
import { tapes } from './411vm';

interface VhsTapeProps {
  id: number; // Add id prop
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  imageUrl: string;
  videoUrl: string;
  isClicked: boolean;
}

const VhsTape: React.FC<VhsTapeProps> = ({
  id, // Receive the id prop
  title,
  isSelected,
  onSelect,
  imageUrl,
  videoUrl,
  isClicked,
}) => {
    const tapeStyle: React.CSSProperties = {
        width: '200px',
        height: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: isClicked ? 'yellow' : isSelected ? '#f0f0f0' : '#f0f0f0',
        padding: '10px',
        border: '1px solid #000',
        borderRadius: '8px',
        cursor: 'pointer',
        margin: "5px",
        transition: 'background-color 0.3s, font-weight 0.3s, box-shadow 0.3s',
        color: isClicked ? '#fff' : isSelected ? '#fff' : 'inherit',
        fontWeight: isClicked ? 'bold' : isSelected ? 'bold' : 'normal',
        boxShadow: isSelected ? '0px 0px 25px 3px #FFD700' : 'none', // golden glow for selected
      };
      
      const imageContainerStyle: React.CSSProperties = {
        height: '340px',  // Fixed height for the image container
        width: '100%',
        overflow: 'hidden',
      };
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '340px', // Adjust this height
    objectFit: 'cover',
    marginBottom: '-6%',
  };

  return (
    <Box
      style={tapeStyle}
      onClick={onSelect}
    >
            <Box style={imageContainerStyle}>   {/* Image container */}

      <img src={imageUrl} alt={title} style={imageStyle} />
      {/* ... Other code ... */}
    </Box>
    <label style={{ fontWeight: 'bold', marginTop: '10px', color: 'black' }}>{title}</label>

      </Box>

  );
};

const Shelf = () => {
  const [selectedTapeId, setSelectedTapeId] = useState<number | null>(1); // Initial selected id
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);



  useEffect(() => {
    // Load the initial iframe when the page loads
    const initialTape = tapes.find((tape) => tape.id === selectedTapeId);
    if (initialTape) {
      setSelectedVideoUrl(initialTape.videoUrl);
    }
  }, [selectedTapeId]);

  const handleSelectTape = (tape: { id: number, videoUrl: string }) => {
    setSelectedTapeId(tape.id);
    setSelectedVideoUrl(tape.videoUrl);
  };

  return (
    <Flex align="center" justify="center" mt={4}>
      <Flex flexDirection="column" alignItems="center" width={['95%', '80%', '70%', '60%']}>
        <Text fontSize="xl" mb={4}>
          VHS Tapes Shelf
        </Text>
        
        {selectedVideoUrl && (
          <Box border={"1px solid limegreen"}  overflow="hidden" mb={4}>
            <iframe
              src={selectedVideoUrl}
              width="1080"  // This will make the video responsive
              height="720"
              title="Selected Video"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </Box>
        )}
        <Text fontSize={"36px"}>
          Select Video by clicking on the VHS Tape
        </Text>
        <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(8, 1fr)"]} gap={4}>
    {tapes.map((tape) => (
        <VhsTape
            key={tape.id}
            id={tape.id}
            title={tape.title}
            isSelected={tape.id === selectedTapeId}
            onSelect={() => handleSelectTape(tape)}
            imageUrl={tape.imageUrl}
            videoUrl={tape.videoUrl}
            isClicked={tape.id === selectedTapeId}
        />
          ))}
        </Grid>
      </Flex>
    </Flex>
  );
};

export default Shelf;
