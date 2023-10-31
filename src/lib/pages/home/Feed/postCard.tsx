import React from 'react';
import { Box, Heading, Text, Divider, Image } from '@chakra-ui/react';

interface PostCardProps {
  post: Post;
}

interface Post {
  post_id: number;
  author: string;
  title: string;
  body: string;
  created: string;
  thumbnail: string;
  // Add other post properties here
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding="16px"
      marginBottom="16px"
      backgroundColor="white"
      boxShadow="md"
    >
      <Image
        src={post.thumbnail}
        alt="Post Thumbnail"
        marginBottom="8px"
        borderRadius="lg"
        maxHeight="200px" // Set the maximum height for the thumbnail
      />
      <Heading as="h2" size="md" marginBottom="4px">
        {post.title}
      </Heading>
      <Text fontSize="sm" color="gray.600" marginBottom="8px">
        Author: {post.author} | Created: {post.created}
      </Text>
      {/* Display other post properties as needed */}
      <Divider marginTop="8px" />
    </Box>
  );
};

export default PostCard;
