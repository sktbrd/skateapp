import React from 'react';
import { Button, Flex, Slider, SliderTrack, SliderFilledTrack, Box, Text } from '@chakra-ui/react';
import voteOnContent from '../../api/voting';
import { useState } from 'react';
import HiveLogin from '../../api/HiveLoginModal';

import * as Types from '../types'

const PostFooter: React.FC<Types.PostFooterProps> = ({ onClose, user, author, permlink, weight = 10000 }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const getFeedbackText = (value: number) => {
    if (value === -10000) return "Seu fraco!";
    if (value === -5000) return "Não gostei muito.";
    if (value === 0) return "Tenta outra vez!";
    if (value === 5000) return "Boa, bloder!";
    if (value === 10000) return "Você é trevoso!";
    return "";
  };
  

  const handleVote = async () => {
    // Assuming you have a DOM element for displaying error messages with an id "error-message"
    const errorMessageElement = document.getElementById("error-message");
  
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
  
      // Use a type assertion to cast 'error' to the 'Error' type
      const errorMessage = (error as Error).message || "An unknown error occurred.";
      alert(`Voting failed: ${errorMessage}`);
    }
  };
  const emojiByAmount: { [key: string]: string } = {
    "-10000": "💩",
    "-5000": "💀",
    "0": "😐",
    "5000": "🙂",
    "10000": "🛹",
  };
  
  const skateEmojiStyle = {
    fontSize: '2em',
    position: 'absolute',
    top: '50%',
    left: `${(sliderValue + 10000) / 20000 * 100}%`,
    transform: 'translate(-50%, -50%)',
    cursor: 'grab',
  } as React.CSSProperties
  
  
  
  return (
    <Flex border="1px white solid" padding="20px" justify="space-between" >
      <Button
        bg="#121212"
        color="#fff"
        borderRadius="4px"
        p={2}
        onClick={onClose}
        _hover={{ bg: 'white', color: '#020202' }}
        border={"1px solid white"}
      >
        Fechar
      </Button>
      <Box width="40%">
        <Text textAlign="center"> Sua opnião sobre esse post</Text>
        <Slider 
          min={-10000} 
          max={10000} 
          step={5000} 
          value={sliderValue} 
          onChange={(value) => setSliderValue(value)}
        >
          <SliderTrack bg="white">
            <SliderFilledTrack bg="red" />
          </SliderTrack>
          <span role="img" aria-label="Skateboard" style={skateEmojiStyle}>{emojiByAmount[sliderValue.toString()]}</span>
        </Slider>
        
        <Text color="white" mt={2} textAlign="center">
          {getFeedbackText(sliderValue)}
        </Text>
      </Box>
      <Button
        bg="black"
        color="white"
        borderRadius="4px"
        border="1px solid white"
        p={2}
        onClick={handleVote}
        _hover={{ bg: 'white', color: 'black' }}
      >
        Votar
      </Button>
    </Flex>
  );
  
}

export default PostFooter;
