import React from 'react';
import { Box, Image, Text, Flex, Heading, ModalCloseButton, Divider } from "@chakra-ui/react";
import * as Types from '../types';
import { Link } from 'react-router-dom';

function slugify(text: string) {
  return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
}

const PostHeader: React.FC<Types.PostHeaderProps> = ({ title, author, avatarUrl, permlink, postUrl, onClose }) => {
  const peakdUrl = `https://peakd.com${postUrl}`;

  return (
    <Flex justifyContent="center" alignItems="center">
      <Box display="flex" alignItems="center">
        <Link to={`/profile/${author}`} >
          <Box borderRadius="full" border="2px solid #d7a917" display="flex" alignItems="center" p="4">
            <Image boxSize="2rem" borderRadius="full" src={avatarUrl} alt={author} mr="4" border="2px solid #d7a917" />
            <Text fontSize="md" color={"#b4d701"}>{author} </Text>
          </Box>
        </Link>
      </Box>
      <Box borderRadius="10px" border="2px solid #d7a917" flex="1" ml="4">
        <Heading padding="10px" as="h5" size="md" color={"#b4d701"} >
          {title}
        </Heading>
      </Box>
      <a href={peakdUrl} target="_blank" rel="noopener noreferrer">
        <Image src="https://i.ibb.co/VpC46P5/image.png" boxSize="1.5rem" ml="4" />
      </a>
      <ModalCloseButton onClick={onClose} color={"#d7a917"}/>
    </Flex>  
  );
}

export default PostHeader;
