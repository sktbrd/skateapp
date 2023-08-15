// PostHeader.tsx

import React from 'react';
import { Box, Image, Text, Flex, Heading, ModalCloseButton } from "@chakra-ui/react";

interface PostHeaderProps {
  title: string;
  author: string;
  avatarUrl: string;
  onClose: () => void;
}

const PostHeader: React.FC<PostHeaderProps> = ({ title, author, avatarUrl, onClose }) => { 
  return (
    <Flex justify="flex" align="center">
      <Box>
        <Image boxSize="2rem" borderRadius="full" src={avatarUrl} alt={author} mr="4" />
        <Text fontSize="md">{author}</Text>
      </Box>
      <Heading padding={"10px"} as="h3" size="md">
        {title}
      </Heading>
      <ModalCloseButton onClick={onClose} /> 
    </Flex>
  );
}


export default PostHeader;
