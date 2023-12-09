import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Image, VStack, HStack } from '@chakra-ui/react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First API call
        const hiveHubResponse = await axios.get(`https://stats.hivehub.dev/communities?c=${communityTag}`);
        const hiveInfo = hiveHubResponse.data['hive-173115'];
        const totalHBDPayout = parseFloat(hiveInfo.total_payouts_hbd.replace('$', '')) || 0;

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
      <Box
        margin="0px"
        padding="5px"
        minW={"300px"}
        borderRadius="md"
        border={"2px solid limegreen"}
        boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
        background="linear-gradient(45deg, white, limegreen)"
        color="white"
        
      >
        {communityStats ? (
          <Flex  m={"5px"} justifyContent="space-between" flexDirection="row">
            {/* Display total HBD payouts from the first API call
            <Flex paddingLeft="10%" flexDirection="column">
              <center>
                <Text fontSize="48px">🎁</Text>
                <Text color="black">${totalpay.toFixed(2)}</Text>
                <Text>Total Payouts</Text>
              </center>
            </Flex> */}

            {/* Display community stats from the second API call */}
            <Flex flexDirection="column">
              <center>
              <HStack marginEnd={"10px"}>

                <Text m="-2px" fontSize="28px">📜</Text>
                <Text fontSize={"18px"} fontWeight="bold"  color="black">{communityStats.numberOfPosts}</Text>
                <Text fontSize="8px" marginLeft={"-5px"} marginTop={"8px"} color={"black"}> Posts/Comments this Round</Text>
                </HStack>
              </center>
            </Flex>

            <Flex flexDirection="column">
              <center>
              <HStack marginEnd={"10px"}>

                <Text  m="-2px"  fontSize="28px">💰</Text>
                
                <Text fontSize={"18px"} fontWeight="bold" color="black">${communityStats.totalPayout.toFixed(2)}</Text>
                <Text  fontSize="8px" marginLeft={"-5px"} marginTop={"8px"} color={"black"}>Rewards this Round</Text>
                </HStack>

              </center>
            </Flex>

            <Flex flexDirection="column">
              <center>
              <HStack marginEnd={"10px"}>

                <Text  m="-2px" fontSize="28px">👨‍💻</Text>
                <Text fontSize={"18px"} fontWeight="bold"  color="black">{communityStats.numberOfAuthors}</Text>
                <Text  fontSize="8px" marginLeft={"-5px"} marginTop={"8px"} color={"black"}>Active Users</Text>
                </HStack>
              </center>
            </Flex>
          </Flex>
        ) : (
          <VStack>

          <Image boxSize={"60px"} src='https://64.media.tumblr.com/12da5f52c1491f392676d1d6edb9b055/870d8bca33241f31-7b/s400x600/fda9322a446d8d833f53467be19fca3811830c26.gif'></Image>

          <Text color={"black"}>Loading...</Text>
          </VStack>
        )}
      </Box>
    </center>
  );
};

export default CommunityStats;
