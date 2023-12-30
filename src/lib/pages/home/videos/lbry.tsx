import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Grid, HStack, Center, Table, Tr, Td, Th, Thead, Tbody } from '@chakra-ui/react';
import { tapes } from './411';

interface VhsTapeProps {
  id: number;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  imageUrl: string;
  videoUrl: string;
  isClicked: boolean;
  soundtrack?: Record<string, string[]> | {} | null; // Updated type
}

const VhsTape: React.FC<VhsTapeProps> = ({
  id,
  title,
  isSelected,
  onSelect,
  imageUrl,
  videoUrl,
  soundtrack,
  isClicked,
}) => {
  const tapeStyle: React.CSSProperties = {
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: isClicked ? 'yellow' : isSelected ? '#f0f0f0' : '#f0f0f0',
    padding: '10px',
    border: '1px solid #000',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: "20px",
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
      bg={"blue"}
    >

      <img src={imageUrl} alt={title} style={imageStyle} />
      <label style={{ fontWeight: 'bold', marginTop: '10px', color: 'black' }}>{title}</label>

    </Box>

  );
};
const Shelf = () => {
  const [selectedTapeId, setSelectedTapeId] = useState<number | null>(2);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedVideoSoundtrack, setSelectedVideoSoundtrack] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    const initialTape = tapes.find((tape) => tape.id === selectedTapeId);
    if (initialTape) {
      setSelectedVideoUrl(initialTape.videoUrl);
      handleSelectTape(initialTape); // Handle the initial tape selection
    }
  }, [selectedTapeId]);

  const handleSelectTape = (tape: { id: number; videoUrl: string; soundtrack?: Record<string, string[]> | {} }) => {
    setSelectedTapeId(tape.id);
    setSelectedVideoUrl(tape.videoUrl);

    if (tape.soundtrack && Object.keys(tape.soundtrack).length > 0) {
      setSelectedVideoSoundtrack(tape.soundtrack);
    } else {
      setSelectedVideoSoundtrack(null);
    }
  };

  return (
    <Flex minW="100%" height="100%" >
      <Box
        overflowY="auto"
        height="100vh"
        p={4}
        width="320px" // Set a fixed width for the left component
      >
        <Text fontSize="xl" mb={4}>
          📼 VHS Tapes Shelf
        </Text>
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
      </Box>
      <Box>
        <Center>
          {selectedVideoUrl && (
            <Box
              border={"3px solid limegreen"}
              borderRadius={"15px"}>
              <iframe
                src={selectedVideoUrl}
                width="814px"
                height="615px"
                title="Selected Video"
                frameBorder="0"
                allowFullScreen
                style={{ borderRadius: '15px' }} // Set the desired border radius
              ></iframe>

            </Box>
          )}
        </Center>
        {selectedVideoSoundtrack && (
          <Box>
            <Text fontSize="xl" mb={4}>
              📼 Soundtrack
            </Text>
            <Table variant="simple" overflowY="auto" minW={"1300px"}>
              <Thead>
                <Tr>
                  <Th>Section</Th>
                  <Th>Tracks</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.keys(selectedVideoSoundtrack).map((section) => (
                  <Tr key={section}>
                    <Td>{section}</Td>
                    <Td maxW="300px" isTruncated>{selectedVideoSoundtrack[section].join(', ')}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

        )}
      </Box>
    </Flex >
  );
};

export default Shelf;


