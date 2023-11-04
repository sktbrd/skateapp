import React, { useState, useEffect } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td ,Flex} from '@chakra-ui/react';
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
  const [communityName, setCommunityName] = useState<string | null>(null);
const [totalPayout, setTotalPayout] = useState<number | null>(null);
const [numberOfPosts, setNumberOfPosts] = useState<number | null>(null);
const [numberOfAuthors, setNumberOfAuthors] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('https://api.hive.blog', {
          jsonrpc: '2.0',
          method: 'bridge.get_payout_stats',
          params: { limit: 100 },
          id: 1,
        });

        const items = response.data.result.items;

        // Find the SkateHive community stats
        const skateHiveStats = items.find((item: any) => item[1].toLowerCase() === 'skatehive');
        console.log('skateHiveStats', skateHiveStats);
        if (skateHiveStats) {
          const [communityName, , totalPayout, numberOfPosts, numberOfAuthors] = skateHiveStats;
          console.log('communityName', communityName);
          setCommunityStats({
            communityName,
            totalPayout,
            numberOfPosts,
            numberOfAuthors,
          });
          console.log('communityStats', communityStats);
        } else {
          setError('SkateHive community not found');
        }

        setLoading(false);
      } catch (error) {
        setError('Error fetching community stats');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <center>

    <Box margin={"10px"} padding={"10px"} maxWidth={"88.5%"} borderWidth="1px" borderRadius="md">
      {communityStats ? (
        <Flex justifyContent={'space-between'} flexDirection="row">

          <Flex  paddingLeft={"10%"} flexDirection="column">
          <center>
          <Text fontSize={"48px"}>📜</Text>
          <Text color={"orange"}>{communityStats.numberOfPosts}</Text>

          <Text>Posts in this Round</Text> 
            </center>
          </Flex>
          <Flex flexDirection="column">
            <center>
             <Text fontSize={"48px"}>💰</Text>
             <Text color={"orange"}> ${communityStats.totalPayout.toFixed(2)}</Text>

          <Text>Pending Rewards</Text> 
            </center>
          </Flex>
          <Flex paddingRight={"10%"} flexDirection="column">
          <center>
          <Text fontSize={"48px"}>👨‍💻</Text>
          <Text color={"orange"}>   {communityStats.numberOfAuthors}</Text>

          <Text>Active Users </Text>
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
