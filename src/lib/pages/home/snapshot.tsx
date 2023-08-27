import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Text, List, ListItem, Flex, VStack, Image, Button } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

interface Proposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  state: string;
  author: string;
  space: {
    id: string;
    name: string;
  };
  summary?: string; // Add a summary field to the Proposal interface
}

const SnapShot: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const placeholderImage = 'https://i.ibb.co/X7q7xtm/image.png';

  const openai = new OpenAI({
    // Please dont steal my keys, thanks  :)
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true
  });

  const getSummary = async (body: string) => {
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: `Summarize the following proposal: ${body}` }],
      model: "gpt-3.5-turbo",
    });
    return response.choices[0]?.message?.content || "No summary available.";
  };

  const query = `
    {
      proposals (
        first: 10,
        skip: 0,
        where: {
          space_in: ["skatehive.eth"],
          state: "closed"
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        author
        space {
          id
          name
        }
      }
    }
  `;

  useEffect(() => {
    const fetchProposals = async () => {
        try {
          const response = await fetch('https://hub.snapshot.org/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({ query }),
          });
      

        if (response.ok) {
          const data = await response.json();
          const fetchedProposals = data.data.proposals;

          // Get summary for each proposal
          for (let proposal of fetchedProposals) {
            proposal.summary = await getSummary(proposal.body);
          }

          setProposals(fetchedProposals);
        }
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    };

    fetchProposals();
  }, []);

  const transformIpfsUrl = (ipfsUrl: string) => {
    return ipfsUrl.replace('ipfs://', 'https://snapshot.4everland.link/ipfs/');
  };

  const findImage = (body: string) => {
    const imgRegex = /!\[.*?\]\((.*?)\)/;
    const match = body.match(imgRegex);
    const imageUrl = match ? match[1] : placeholderImage;
    return imageUrl.startsWith('ipfs://') ? transformIpfsUrl(imageUrl) : imageUrl;
  };

  return (
    <Box p={4} backgroundColor={'black'} border={'1px solid limegreen'}>
      <Text fontSize="2xl" color="limegreen">Governance</Text>
      <List mt={4} spacing={4}>
        {proposals.map((proposal) => (
          <ListItem key={proposal.id}>
            <Flex 
              borderWidth={1} 
              borderRadius="md" 
              p={4} 
              flexDirection="column" 
              backgroundColor={'black'} 
              border={'1px solid limegreen'}
              boxShadow="md"
            >
              <Flex>
                <Image 
                  src={findImage(proposal.body)} 
                  alt="Thumbnail" 
                  boxSize="150px" 
                  border={'1px solid limegreen'}
                  borderRadius={'md'}
                  onError={(e) => { e.currentTarget.src = placeholderImage; }}
                  mr={4}
                />
                <VStack align="start">
                  <ReactMarkdown children={proposal.title} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} />
                  <Text color="white" mt={2}>{proposal.summary}</Text> {/* Display the summary */}
                </VStack>
              </Flex>
              <Flex align="center" mt={2} wrap="wrap">
                {proposal.choices.sort().map((choice, index) => (
                  <Button key={index} backgroundColor="black" border="1px solid orange" mr={2} mb={2} borderRadius="md">{choice}</Button>
                ))}
              </Flex>
              <Text color="white" mt={2} fontStyle="italic">
                Author: {proposal.author}
              </Text>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SnapShot;
