import React, { useState, useEffect } from 'react';
import { Flex, Image, Box, Heading, Text, Stack, Select } from '@chakra-ui/react';
import axios from 'axios';

interface Post {
  post_id: number;
  author: string;
  title: string;
  body: string;
  created: string;
  json_metadata: any;
}

const defaultThumbnail =
  "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fc.tenor.com%2FZco-fadJri4AAAAd%2Fcode-matrix.gif&f=1&nofb=1&ipt=9a9b3c43e852a375c62be78a0faf338d6b596b4eca90e5c37f75e20725a3fc67&ipo=images";

const FeedSelector: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string>('trending');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.post(
          'https://api.hive.blog',
          {
            jsonrpc: '2.0',
            method: 'bridge.get_ranked_posts',
            params: {
              sort: selectedFeed,
              tag: 'hive-173115',
              observer: '',
            },
            id: 1,
          }
        );

        const postData = response.data.result;

        if (postData && postData.length > 0) {
          setPosts(postData);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [selectedFeed]);

  const handleFeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFeed(event.target.value);
  };

  return (
    <Stack spacing={4}>
      <Heading as="h1" size="xl">
        Posts with Tag: hive-173115
      </Heading>
      <Select value={selectedFeed} onChange={handleFeedChange}>
        <option value="trending">Trending</option>
        <option value="hot">Hot</option>
        <option value="created">Created</option>
        <option value="promoted">Promoted</option>
        <option value="payout">Payout</option>
        <option value="payout_comments">Payout Comments</option>
        <option value="muted">Muted</option>
        {/* Add other feed options here */}
      </Select>
      {posts.map((post) => (
        <Box key={post.post_id} p={4} borderWidth="1px" borderRadius="lg">
          <Heading as="h2" size="md">
            {post.title}
          </Heading>
          <Flex>
            <Image
              src={
                post.json_metadata.image && post.json_metadata.image[0]
                  ? post.json_metadata.image[0]
                  : defaultThumbnail
              }
              alt="Post Thumbnail"
              marginBottom="8px"
              borderRadius="lg"
              maxHeight="200px"
            />
          </Flex>
          <Text>Author: {post.author}</Text>
          <Text>Created: {post.created}</Text>
          {/* Display other post properties as needed */}
        </Box>
      ))}
    </Stack>
  );
};

export default FeedSelector;
