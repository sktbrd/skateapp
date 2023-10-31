import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive"; // Import dhive Client

const FollowersList: React.FC = () => {
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const limit = 1000; // Set your desired limit

  const fetchFollowersFunction = async (username: string) => {
    const client = new dhive.Client('https://api.hive.blog'); // Use a Hive node URL

    try {
      // Fetch the list of followers
      const followlist = await client.call('condenser_api', 'get_following', [
        username,
        null,
        'blog',
        limit,
      ]);

      // Extract the follower names from the response
      const followers = followlist.map((followerData: any) => followerData.following);

      return followers;
    } catch (error) {
      console.error("Error fetching followers:", error);
      throw error;
    }
  };

  const handleGetFollowersClick = async () => {
    if (usernameInput) {
      setLoading(true); // Set loading to true while fetching
      try {
        const result = await fetchFollowersFunction(usernameInput);
        setFollowers(result);
      } catch (error) {
        // Handle error here
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="xl">Followers List</Text>
      <Input
        placeholder="Enter a username"
        value={usernameInput}
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      <Button
        mt={2}
        colorScheme="teal"
        onClick={handleGetFollowersClick}
        disabled={loading}
      >
        Get Followers
      </Button>
      {loading ? (
        <Spinner size="lg" mt={4} />
      ) : (
        <VStack mt={4} align="start">
          {followers.map((follower) => (
            <Text key={follower}>{follower}</Text>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default FollowersList;
