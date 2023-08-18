import React from 'react';
import { Button, Flex, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box, Text } from '@chakra-ui/react';
import voteOnContent from '../../api/voting';
import { useState } from 'react';

interface PostFooterProps {
  onClose: () => void;
  user: any;  // assuming user data is available
  author: string; // assuming author data is available
  permlink: string; // assuming permlink data is available
  weight?: number; // assuming weight data is available
}

const PostFooter: React.FC<PostFooterProps> = ({ onClose, user, author, permlink, weight = 10000 }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const getFeedbackText = (value: number) => {
    if (value === -10000) return "I hate it";
    if (value === -5000) return "I don't care for it";
    if (value === 0) return "Skaters can do better";
    if (value === 5000) return "That's kind of cool";
    if (value === 10000) return "That's fucking awesome";
    return "";
  };
  

  const handleVote = async () => {
    if (!user || !user.name) {
      console.error("User not logged in or missing username");
      return;
    }
  
    try {
      await voteOnContent(user.name, permlink, author, sliderValue);
      console.log("Voting successful!");
      // handle the vote result here
    } catch (error) {
      console.error("Voting failed:", error);
      // handle the error properly here
    }
  };
  
  return (
    <Flex border="1px limegreen solid" padding="20px" justify="space-between" align="center">
      <hr color='white'></hr>

      <Button
        bg="#121212"
        color="#fff"
        borderRadius="4px"
        p={2}
        onClick={onClose}
        _hover={{ bg: 'limegreen', color: '#020202' }}
        border={"1px solid limegreen"}
      >
        Close
      </Button>
      <Box width="60%">
        <Text textAlign="center"> Your opinion on this post</Text>
        <Slider 
          min={-10000} 
          max={10000} 
          step={5000} 
          value={sliderValue} 
          onChange={(value) => setSliderValue(value)}
        >
          <SliderTrack bg="limegreen">
            <SliderFilledTrack bg="yellow" />
          </SliderTrack>
          <SliderThumb boxSize={6}>
          </SliderThumb>
        </Slider>
        <Text color="yellow" mt={2} textAlign="center">
          {getFeedbackText(sliderValue)}
        </Text>
      </Box>
      <Button
        bg="limegreen"
        color="#020202"
        borderRadius="4px"
        p={2}
        onClick={handleVote} // Call the handleVote function when the "Vote" button is clicked
        _hover={{ bg: '#020202', color: 'limegreen' }}
      >
        Vote
      </Button>
    </Flex>
  );
}

export default PostFooter;
