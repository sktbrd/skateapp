import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Text,
  Avatar,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { Client } from "@hiveio/dhive";

// Define types for author profile and author data
interface AuthorProfile {
  about?: string;
  // Add other properties of the profile if needed
}

interface Author {
  name?: string;
  posting_json_metadata?: string;
  profile?: AuthorProfile;
}

function SubscriberList() {
  // Define state variables for subscribers and loading status
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define the Hive Bridge API endpoint
    const bridgeApiUrl = 'https://api.hive.blog';

    // Define the community name (Replace with the correct community name)
    const communityName = 'hive-173115';

    // Define the request payload to get subscribers from the Hive Bridge API
    const bridgeRequestData = {
      jsonrpc: '2.0',
      method: 'bridge.list_subscribers',
      params: {
        community: communityName,
        limit: 100,
      },
      id: 1,
    };

    // Make the API request to get subscribers from the Hive Bridge API
    axios
      .post(bridgeApiUrl, bridgeRequestData)
      .then(async (response) => {
        const { data } = response;
        if (data && data.result) {
          const subscriberUsernames = data.result.map((subscriber: any) => subscriber[0]);

          // Fetch additional information for each subscriber
          const subscriberInfoPromises = subscriberUsernames.map(async (username: any) => {
            try {
              const client = new Client('https://api.hive.blog');
              const account = await client.database.getAccounts([username]);
              const metadata = JSON.parse(account[0].posting_json_metadata) as Author;
              const authorAbout = metadata.profile?.about || null;
              const witnessVotes = account[0].witness_votes;
              const hasVotedWitness = witnessVotes.includes('skatehive');
              
              // Fetch the reputation of the user
              const reputationResponse = await axios.post(
                bridgeApiUrl,
                {
                  jsonrpc: '2.0',
                  method: 'condenser_api.get_account_reputations',
                  params: [username, 1],
                  id: 1,
                }
              );
              const reputation = reputationResponse.data.result[0]?.reputation || 0;

              return {
                username,
                authorAbout,
                hasVotedWitness,
                reputation,
              };
            } catch (error) {
              console.error(`Error fetching additional info for ${username}:`, error);
              return {
                username,
                authorAbout: null,
                hasVotedWitness: false,
                reputation: 0,
              };
            }
          });

          // Wait for all promises to resolve and update state
          const subscriberInfo = await Promise.all<any>(subscriberInfoPromises);
          setSubscribers(subscriberInfo);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching subscribers from Hive Bridge API:', error);
      });
  }, []);

  return (
    <Box>
      <center>
        <Text color={"orange"} fontSize="48px" fontWeight="bold" mb={4}>
          100 Skatehive Members
        </Text>
      </center>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <Flex flexWrap="wrap">
          {subscribers.map((subscriberInfo) => (
            <Box
              key={subscriberInfo.username}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="md"
              m={2}
              width="300px" // Set a fixed width
              height="280px" // Set a fixed height
              transition="transform 0.2s"
              _hover={{ transform: 'scale(1.05)' }} // Hover effect
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                {subscriberInfo.username}
              </Text>
              <Flex align="center" flexDirection="column" justifyContent="center">
                <Avatar
                  src={`https://images.ecency.com/webp/u/${subscriberInfo.username}/avatar/small`}
                  size="lg"
                  boxSize={24}
                  borderRadius={"20%"}
                  border={"1px solid limegreen"}
                />
                <Text fontSize="lg" color="white" fontWeight="bold" textAlign="center">
                  Voted for Witness?
                  <Text>{subscriberInfo.hasVotedWitness ? '✅ Voted ' : '❌ Not Yet '}</Text>
                </Text>
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  Reputation: {subscriberInfo.reputation}
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
}

export default SubscriberList;
