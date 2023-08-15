import React from 'react';
import { Button, Flex } from '@chakra-ui/react';
import voteOnContent from './voting'; // Import the voting function

interface PostFooterProps {
  onClose: () => void;
  user: any;  // assuming user data is available
  author: string; // assuming author data is available
  permlink: string; // assuming permlink data is available
  weight?: number; // assuming weight data is available
}

const PostFooter: React.FC<PostFooterProps> = ({ onClose, user, author, permlink, weight = 10000 }) => {
  
  const handleVote = async () => {
    if (!user || !user.name) {
      console.error("User not logged in or missing username");
      return;
    }
  
    try {
      await voteOnContent(user.name, permlink, author, weight);
      console.log("Voting successful!");
      // handle the vote result here
    } catch (error) {
      console.error("Voting failed:", error);
      // handle the error properly here
    }
  };
  
  return (
    <Flex padding="20px" justify="space-between" align="center">
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
