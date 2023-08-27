import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Text, List, ListItem, Flex, VStack, Image, Button } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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
}

const SnapShot: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const placeholderImage = 'https://via.placeholder.com/150';

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (response.ok) {
          const data = await response.json();
          setProposals(data.data.proposals);
        }
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    };

    fetchProposals();
  }, []);

  const findImage = (body: string) => {
    const imgRegex = /!\[.*?\]\((.*?)\)/;
    const match = body.match(imgRegex);
    return match ? match[1] : placeholderImage;
  };

  return (
    <Box p={4} backgroundColor={'black'} border={'1px solid limegreen'}>
      <Text fontSize="2xl" color="limegreen">Governance</Text>
      <List mt={4} spacing={4}>
        {proposals.map((proposal) => (
          <ListItem key={proposal.id}>
            <Flex borderWidth={1} borderRadius="md" p={4} flexDirection="column" backgroundColor={'black'} border={'1px solid limegreen'}>
              <ReactMarkdown children={proposal.title} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} />
              <Image src={findImage(proposal.body)} alt="Thumbnail" boxSize="150px" />
              <ReactMarkdown children={proposal.body.length > 100 ? proposal.body.substring(0, 100) + '...' : proposal.body} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} />
              <Flex align="center" mt={2}>
                {proposal.choices.sort().map((choice, index) => (
                    <Button key={index} colorScheme="green" mr={2}>{choice}</Button>
                ))}
                </Flex>
              <Text mt={2} fontStyle="italic" color="limegreen">
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
