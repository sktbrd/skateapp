import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Text, List, ListItem, Flex, VStack, Image, Button, Skeleton, Badge, HStack, useBreakpointValue, useMediaQuery } from '@chakra-ui/react';
import DaoStatus from './DaoStatus';
import { proposalsQuery } from './queries';
import { Proposal } from './types';

import OpenAI from 'openai'; // Import OpenAI if not already done

const SnapShot: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const placeholderImage = '/assets/skatehive-logo.png';
  const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
  const [loadingSummaries, setLoadingSummaries] = useState<boolean>(true);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });

  const getSummary = async (body: string) => {
    // Check if the summary is cached in local storage
    const cachedSummary = localStorage.getItem(body);
    console.log('cachedSummary', cachedSummary);
    if (cachedSummary) {
      console.log('Using cached summary:', cachedSummary);
      return cachedSummary; // Return the cached summary immediately
      setLoadingSummaries(false);
    }
  
    // If not cached, make the API call
    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `Summarize the following proposal in 3 sentences: ${body}` }],
      model: 'gpt-3.5-turbo',
    });
    console.log('response', response);
    const summary = response.choices[0]?.message?.content || 'No summary available.';
  
    // Cache the summary in local storage
    localStorage.setItem(body, summary);
    console.log('summary', summary);
  
    console.log('Summary fetched and cached.');
  
    return summary;
  };
  
  

  const transformIpfsUrl = (ipfsUrl: string) => {
    return ipfsUrl.replace('ipfs://', 'https://snapshot.4everland.link/ipfs/');
  };

  const findImage = (body: string) => {
    const imgRegex = /!\[.*?\]\((.*?)\)/;
    const match = body.match(imgRegex);
    const imageUrl = match ? match[1] : placeholderImage;
    return imageUrl.startsWith('ipfs://') ? transformIpfsUrl(imageUrl) : imageUrl;
  };

  const fetchProposals = async () => {
    try {
      const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: proposalsQuery }),
      });
      console.log('response2', response);
      if (response.ok) {
        const data = await response.json();
        if (data.errors) {
          console.error('GraphQL Proposals Error:', data.errors);
          return;
        }

        const fetchedProposals = data.data.proposals;
        console.log('fetchedProposals', fetchedProposals);
        setProposals(fetchedProposals);
        setLoadingProposals(false);

        setLoadingSummaries(true);
        for (let proposal of fetchedProposals) {
          proposal.summary = await getSummary(proposal.body);
        }

        setLoadingSummaries(false);
      } else {
        console.error('Error fetching proposals:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setLoadingProposals(false);
    }
  };

  const query = proposalsQuery;

  useEffect(() => {
    const cachedProposals = localStorage.getItem('proposals');

    if (cachedProposals) {
      setProposals(JSON.parse(cachedProposals));
      setLoadingProposals(false);
      setLoadingSummaries(true);

      // Fetch summaries for cached proposals
      (async () => {
        for (let proposal of JSON.parse(cachedProposals)) {
          proposal.summary = await getSummary(proposal.body);
        }
        setLoadingSummaries(false);
      })();
    } else {
      // Fetch fresh proposals
      fetchProposals();
    }
  }, []);

// ...
const [isMobile] = useMediaQuery('(max-width: 768px)');

return (
  <Flex flexDirection="column">
    <DaoStatus />
    <Box p={4} backgroundColor="black" borderRadius="10px" border="1px solid limegreen">
      <Text fontSize="2xl" color="limegreen">
        Governance
      </Text>
      <List mt={3} spacing={3}>
        {loadingProposals ? (
          Array.from({ length: 10 }).map((_, index) => (
            <ListItem key={index}>
              {/* ... (loading placeholders for proposals) */}
            </ListItem>
          ))
        ) : (
          proposals.map((proposal) => (
            <ListItem key={proposal.id}>

              <Flex
                borderWidth={1}
                borderRadius="md"
                p={4}
                flexDirection="column"
                backgroundColor="black"
                border="1px solid limegreen"
                boxShadow="md"
                opacity={proposal.state === 'closed' ? 0.7 : 1}
              >

                <Flex padding="2px" flexDirection="column">
                  {!isMobile && ( // Check if not mobile
                    <Image
                      src={findImage(proposal.body)}
                      alt="Thumbnail"
                      boxSize="150px"
                      border="1px solid limegreen"
                      borderRadius="md"
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                      mb={4}
                    />
                    
                  )}
                  
                  <Flex flexDirection={!isMobile ? "row" : "column"}>
                    {isMobile && (
                      <Image
                        src={findImage(proposal.body)}
                        alt="Thumbnail"
                        boxSize="150px"
                        border="1px solid limegreen"
                        borderRadius="md"
                        onError={(e) => {
                          e.currentTarget.src = placeholderImage;
                        }}
                        mr={4}
                      />
                    )}
                    <VStack align="start" flex="1">

                      <Text 
                        border="1px solid limegreen" 
                        padding="10px" 
                        color="white" 
                        borderRadius="10px" 
                        fontSize="xl"
                      >
                        {proposal.title}
                      </Text>
                      <HStack>
                        <Badge 
                          variant="solid" 
                          colorScheme={proposal.state === 'closed' ? 'red' : 'green'} 
                          mb={2}
                        >
                          {proposal.state === 'closed' ? 'Closed' : 'Open'}
                        </Badge>
                        <Text flexWrap="-moz-initial" color="white" mt={2} fontStyle="italic">
                Author: {proposal.author}
              </Text>
                      </HStack>
                      {loadingSummaries ? (
                        <Skeleton height="20px" width="100%" mt={2} />
                      ) : (
                        <Text 
                          padding="5px" 
                          color="yellow" 
                          borderRadius="10px" 
                          border="1px solid limegreen" 
                          mt={2}
                        >
                          🤖 GPT-Summary: {proposal.summary}
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                </Flex>

                <Flex borderRadius="10px" flexDirection="row" justifyContent="space-between">
                  <Flex flexDirection="row">
                    {proposal.choices.sort().reverse().map((choice, index) => (
                      <Button
                        key={index}
                        backgroundColor="black"
                        border="1px solid orange"
                        mr={2}
                        mb={2}
                        borderRadius="md"
                        onClick={() => {
                          if (proposal.state === 'closed') {
                            alert("Voting is closed. You're late to vote! Lazy Ass...");
                          } else {
                            window.open(
                              `https://snapshot.org/#/skatehive.eth/proposal/${proposal.id}`, // Replace with the actual snapshot URL
                              '_blank'
                            );
                          }
                        }}
                      >
                        {choice}
                      </Button>
                    ))}

                  </Flex>

                </Flex>
              </Flex>

            </ListItem>
          ))
        )}
      </List>
    </Box>
  </Flex>
);

};

export default SnapShot;
