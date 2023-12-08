import React, { useState, useEffect } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import axios from 'axios';

interface CommunityStats {
  communityName: string;
  totalPayout: number;
  numberOfPosts: number;
  numberOfAuthors: number;
}

const CommunityStats: React.FC<{ communityTag: string }> = ({ communityTag }) => {
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalHBDPayout, setTotalHBDPayout] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First API call
        const hiveHubResponse = await axios.get(`https://stats.hivehub.dev/communities?c=${communityTag}`);
        const hiveInfo = hiveHubResponse.data['hive-173115'];
        setTotalHBDPayout(hiveInfo.total_payouts_hbd)

        // Second API call
        const hiveBlogResponse = await axios.post('https://api.hive.blog', {
          jsonrpc: '2.0',
          method: 'bridge.get_payout_stats',
          params: { limit: 150 },
          id: 1,
        });

        const items = hiveBlogResponse.data.result.items;
        const skateHiveStats = items.find((item: any) => item[1].toLowerCase() === 'skatehive');

        if (skateHiveStats) {
          const [, , totalPayout, numberOfPosts, numberOfAuthors] = skateHiveStats;
          setCommunityStats({
            communityName: 'SkateHive', // Add the community name for the second API call
            totalPayout,
            numberOfPosts,
            numberOfAuthors,
          });
        } else {
          setError('SkateHive community not found');
        }

        setLoading(false);
      } catch (error: any) {
        setError(`Error fetching community stats: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [communityTag]);

  return (
    <center>
      <Box margin="10px" padding="10px" maxWidth="88.5%" borderWidth="1px" borderRadius="md">
        {communityStats ? (
          <Flex justifyContent="space-between" flexDirection="row">
            {/* Display total HBD payouts from the first API call */}
            <Flex paddingLeft="10%" flexDirection="column">
              <center>
                <Text fontSize="48px">🎁</Text>
                <Text color="orange">${totalHBDPayout}</Text>
                <Text>Total Payouts </Text>
              </center>
            </Flex>

            {/* Display community stats from the second API call */}
            <Flex flexDirection="column">
              <center>
                <Text fontSize="48px">📜</Text>
                <Text color="orange">{communityStats.numberOfPosts}</Text>
                <Text>Posts in this Round</Text>
              </center>
            </Flex>

            <Flex flexDirection="column">
              <center>
                <Text fontSize="48px">💰</Text>
                <Text color="orange">${communityStats.totalPayout.toFixed(2)}</Text>
                <Text>Pending Rewards</Text>
              </center>
            </Flex>

            <Flex paddingRight="10%" flexDirection="column">
              <center>
                <Text fontSize="48px">👨‍💻</Text>
                <Text color="orange">{communityStats.numberOfAuthors}</Text>
                <Text>Active Users</Text>
              </center>
            </Flex>
          </Flex>
        ) : (
          <Text>Loading...</Text>
        )}
      </Box>
    </center>
  );
};

export default CommunityStats;
