import React, { useState } from 'react';
import { Button, Flex, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box, Text } from '@chakra-ui/react';
import voteOnContent from '../home/api/voting';
import useAuthUser from '../home/api/useAuthUser';

import * as Types from '../home/Feed/types';

const VotingBox: React.FC<Types.PostFooterProps> = ({ onClose, author, permlink, weight = 10000 }) => {
  const user = useAuthUser();
  const [sliderValue, setSliderValue] = useState(5000);

  const getFeedbackText = (value: number) => {
    if (value === -10000) return "I hate it";
    if (value === -5000) return "I don't care for it";
    if (value === 0) return "Skaters can do better";
    if (value === 5000) return "That's kind of cool";
    if (value === 10000) return "That's awesome";
    return "";
  };

  const handleVote = async () => {
    if (!user || !user.user?.name) {
      console.error("User not logged in or missing username");
      return;
    }

    try {
      await voteOnContent(user.user.name, permlink, author, sliderValue);
      console.log("Voting successful!");
      // handle the vote result here
    } catch (error) {
      console.error("Voting failed:", error);
      // handle the error properly here
    }
  };

  const emojiByAmount: { [key: string]: string } = {
    "-10000": "💩",
    "-5000": "💀",
    "0": "😐",
    "5000": "🙂",
    "10000": "🛹",
  };

  const skateEmojiStyle: React.CSSProperties = {
    fontSize: '2em',
    position: 'absolute',
    top: '50%',
    left: `${(sliderValue + 10000) / 20000 * 100}%`,
    transform: 'translate(-50%, -50%)',
    cursor: 'grab',
  };

  return (
    <Flex flexDirection="column" alignItems="center" minWidth="100%" borderRadius="10px" border="1px white solid" padding="20px">
      <Box width="100%" marginBottom="20px" position="relative">
        <Text textAlign="center"> Your opinion on this post</Text>
        <Slider 
          min={-10000} 
          max={10000} 
          step={5000} 
          value={sliderValue} 
          onChange={(value) => setSliderValue(value)}
        >
          <SliderTrack bg="white">
            <SliderFilledTrack bg="yellow" />
          </SliderTrack>
          <span role="img" aria-label="Skateboard" style={skateEmojiStyle}>{emojiByAmount[sliderValue.toString()]}</span>
        </Slider>
        <Text color="yellow" mt={2} textAlign="center">
          {getFeedbackText(sliderValue)}
        </Text>
      </Box>
      <Flex justifyContent="flex-end" width="100%" alignItems="flex-end">
        <Button
          bg="white"
          color="#020202"
          borderRadius="4px"
          border="1px solid limegreen"
          p={2}
          onClick={handleVote}
          _hover={{ bg: 'yellow', color: 'black' }}
        >
          Vote
        </Button>
      </Flex>
    </Flex>
  );
}

export default VotingBox;
