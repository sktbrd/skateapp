import React from 'react';
import { Box, Image, Text, Flex, Heading, ModalCloseButton, Divider } from "@chakra-ui/react";
import * as Types from '../types';

const PostHeader: React.FC<Types.PostHeaderProps> = ({ title, author, avatarUrl, onClose }) => { 
  return (
    <Flex justifyContent="center" alignItems="center">
      <Box borderRadius="full" border="1px solid limegreen" display="flex" alignItems="center" p="4">
        <Image boxSize="2rem" borderRadius="full" src={avatarUrl} alt={author} mr="4" />
        <Text fontSize="md">{author}</Text>

      </Box>
      <Box borderRadius="10px" border="1px solid limegreen" flex="1">
        <Heading padding="10px" as="h5" size="xs">
          {title}
        </Heading>
      </Box>
      <ModalCloseButton onClick={onClose} />
    </Flex>  
  );
}

export default PostHeader;
