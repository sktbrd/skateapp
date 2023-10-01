import React, { useEffect, useState } from 'react';
import { Box, Text, Image, Button } from "@chakra-ui/react";
import { VoteHistoryQuery, CurrationHistoryQuery } from './quries';
import { Link as ChakraLink } from "@chakra-ui/react";

const SQL_ENDPOINT = 'https://www.stoken.quest/sql';

interface votesLeaderboardProps {
  username: string;
}

interface UniqueAuthors {
  username: string;
  profileImage: string;
  totalVotes: number;
  totalVoteRewards: number;
}

const VotesLeaderboard: React.FC<votesLeaderboardProps> = ({ username }) => {
  const [voteHistory, setVoteHistory] = useState([] as any);
  const [uniqueAuthors, setUniqueAuthors] = useState([] as UniqueAuthors[]);
  const [batchSize, setBatchSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const getVoteHistory = async () => {
    // post request to hivesql edpoint
    const response = await fetch(SQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: VoteHistoryQuery(username),
      }),
    });

    const data = await response.json();

    setVoteHistory(data);

    // create an array of unique authors and their total votes, total vote rewards
    let uniqueAuthors: UniqueAuthors[] = [];

    data.forEach((vote: any) => {
      const author = vote.author;

      const authorIndex = uniqueAuthors.findIndex((author) => author.username === vote.author);

      if (authorIndex === -1) {
        uniqueAuthors.push({
          username: author,
          profileImage: "https://images.ecency.com/u/" + author + "/avatar",
          totalVotes: 1,
          totalVoteRewards: vote.vote_value,
        });
      } else {
        uniqueAuthors[authorIndex].totalVotes += 1;
        uniqueAuthors[authorIndex].totalVoteRewards += vote.vote_value;
      }
    });

    setUniqueAuthors(uniqueAuthors);
  };

  const getLeaderboard = async () => {
    await getVoteHistory();

    // sort the unique authors by total vote rewards
    setUniqueAuthors((uniqueAuthors) => uniqueAuthors.sort((a, b) => b.totalVoteRewards - a.totalVoteRewards));

    setIsLoading(false);
  };

  useEffect(() => {
    if (username.length > 0)
    getLeaderboard();
  }, [username]);

  return (
    <Box
      w="100%"
      h="100%"
      borderRadius="xl"
      boxShadow="dark-lg"
      p="4"
    >
      <Text fontSize="xx-large" align="center" fontWeight="bold" mb="4">
        Skaters Leaderboard
      </Text>
    
        {
        /* 
        all the unique authors and their total votes, total vote rewards
        presested in tiles with their profile image, username, total votes, total vote rewards
        next to each other in small tiles, in a box container with grid with their rank 
        show the top 10 authors first, then a button to show the next 10, and so on
        */
        }
      {isLoading ? (
        <Text align="center">Loading...</Text>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gridGap="15px"
          width="100%"
          padding="10px"
        >
          {/* get the unique authors till the batch size */}
          
          {uniqueAuthors.slice(0, batchSize).map((author) => (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              borderRadius="12px"
              border="2px solid red"
              padding="10px"
            >
              <Text fontSize="large" align="center" fontWeight="bold" mb="4">
                {uniqueAuthors.indexOf(author) + 1}
              </Text>
              <Image
                src={author.profileImage}
                borderRadius="12px"
                boxSize="75px"
              />
              <Text
                textAlign="center"
                borderRadius="12px"
                fontWeight="700"
                fontSize="18px"
                color="white"
                padding="10px"
              >
                <ChakraLink href={`https://peakd.com/@${author.username}`} isExternal>
                  @{author.username}
                </ChakraLink>
              </Text>
              <Text
                textAlign="center"
                borderRadius="12px"
                fontWeight="700"
                fontSize="18px"
                color="white"
                padding="10px"
              >
                {author.totalVotes} votes
              </Text>
              <Text
                textAlign="center"
                borderRadius="12px"
                fontWeight="700"
                fontSize="18px"
                color="white"
                padding="10px"
              >
                ${author.totalVoteRewards.toFixed(3)}
              </Text>
            </Box>
          ))}          
        </Box>
      )}

      {!isLoading ? (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
      >
        <Button
          mt="4"
          colorScheme="teal"
          onClick={() => setBatchSize(batchSize + 10)}
        >
          Load More
        </Button>
      </Box>
      ) : null}
    </Box>
  );
};

export default VotesLeaderboard;