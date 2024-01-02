import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, VStack, Image, HStack } from '@chakra-ui/react';
import axios from 'axios';

interface CommunityTotalPayout {
  totalHBDPayout: number;
}

const CommunityTotalPayout: React.FC<{ communityTag: string }> = ({ communityTag }) => {
  const [totalHBDPayout, setTotalHBDPayout] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // format the dollar amount
  const formattedNumber = totalHBDPayout.toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hiveHubResponse = await axios.get(`https://stats.hivehub.dev/communities?c=${communityTag}`);
        const hiveInfo = hiveHubResponse.data['hive-173115'];

        // Remove the dollar sign and convert the string to a number
        const totalPayoutNumber = parseFloat(hiveInfo.total_payouts_hbd.replace('$', ''));

        setTotalHBDPayout(totalPayoutNumber);
        setLoading(false);
      } catch (error: any) {
        setTotalHBDPayout(49400.00);
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
        maxWidth="240px"
        borderRadius="md"
        boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
        background="linear-gradient(0deg, black, darkgreen, black)"
        color="chartreuse"
        border={"1px solid limegreen"}
       
      >
        {loading ? (
          <VStack>

          <Image boxSize={"24px"} src='https://64.media.tumblr.com/12da5f52c1491f392676d1d6edb9b055/870d8bca33241f31-7b/s400x600/fda9322a446d8d833f53467be19fca3811830c26.gif'></Image>

          <Text fontSize={"12px"} color={"chartreuse"} >Loading...</Text>
          </VStack>        ) : error ? (
          <Text fontSize="18px">Error: {error}</Text>
        ) : (
          <Flex justifyContent="center" flexDirection="column" alignItems="center">
            <HStack>

            <Text fontSize="28px" marginBottom="5px" >
              🛹
            </Text>
            <Text  color={"lightgreen"} fontSize="25px" fontWeight="bold" marginBottom="5px" fontFamily={'mono'} textShadow={"1px 1px 15px black"} >
            <span style={{ fontFamily: "serif", color: "chartreuse",  }}>
                          $
                        </span>{formattedNumber}
            </Text>
            <Text color={"limegreen"} fontSize="8px" fontWeight="bold" textShadow={"1px 1px 15px black"}> Total Generated to Skaters </Text>
            </HStack>
            
          </Flex>
        )}
      </Box>
    </center>
  );
};

export default CommunityTotalPayout;

