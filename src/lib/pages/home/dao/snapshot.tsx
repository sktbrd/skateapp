import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Text, Flex, VStack, Image, Button, Skeleton, Badge, HStack, useBreakpointValue } from '@chakra-ui/react';
import DaoStatus from './DaoStatus';
import { proposalsQuery } from './queries';
import { Proposal } from './types';
import ProposalModal from './proposalModal';
import OpenAI from 'openai';

const SkatehiveProposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const placeholderImage = '/assets/skatehive-logo.png';
  const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
  const [loadingSummaries, setLoadingSummaries] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>('');
  const [modalTitle, setModalTitle] = useState<string>('');
  const handleOpenModal = ({ body, title }: { body: string; title: string }) => {
    setModalContent(body);
    setModalTitle(title);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });
  const getSummary = async (body: string) => {
    const cachedSummary = localStorage.getItem(body);
    if (cachedSummary) {
      return cachedSummary;
      setLoadingSummaries(false);
    }
    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `Summarize the following proposal in 3 sentences: ${body}` }],
      model: 'gpt-3.5-turbo',
    });
    const summary = response.choices[0]?.message?.content || 'No summary available.';
    localStorage.setItem(body, summary);

    return summary;
  };
  const transformIpfsUrl = (ipfsUrl: string) => {
    return ipfsUrl.replace('ipfs://', 'https://snapshot.4everland.link/ipfs/');
  };
  const findIpfsImage = (body: string) => {
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
      if (response.ok) {
        const data = await response.json();
        if (data.errors) {
          console.error('GraphQL Proposals Error:', data.errors);
          return;
        }
        const fetchedProposals = data.data.proposals;
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
      (async () => {
        for (let proposal of JSON.parse(cachedProposals)) {
          proposal.summary = await getSummary(proposal.body);
        }
        setLoadingSummaries(false);
      })();
    } else {
      fetchProposals();
    }
  }, []);
  const borderColor = '1px solid white';

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex flexDirection="column" mx={isMobile ? 0 : 20}
    >
      <DaoStatus />
      <Flex justify="center">
        <Text border={borderColor} borderRadius="10px" padding="8px" fontSize="2xl" color="white">
          Proposals
        </Text>
      </Flex>

      <VStack mx="auto" maxWidth="100%" spacing={3} mt={3}>
        {loadingProposals ? (
          Array.from({ length: 10 }).map((_, index) => (
            <Flex key={index} direction="column">
              {/* ... (loading placeholders for proposals) */}
            </Flex>
          ))
        ) : (
          proposals.map((proposal) => (
            <Flex
              key={proposal.id}
              borderWidth={1}
              borderRadius="md"
              border={proposal.state === 'active' ? "1px solid gold" : (proposal.state === 'closed' ? "1px solid grey" : "1px solid white")}
              boxShadow={proposal.state === 'active' ? "0 0 10px gold" : (proposal.state === 'closed' ? "0 0 5px grey" : "0 0 5px white")}
              p={4}
              direction={isMobile ? "column" : "row"}
              backgroundColor="black"
              opacity={proposal.state === 'closed' ? 0.7 : 1}
              alignItems="center"
              minW="100%"
              onClick={() => handleOpenModal({ body: proposal.body, title: proposal.title })}
            >
              <Box minWidth="100px" minHeight="100px" mr={isMobile ? 0 : 4} mb={isMobile ? 4 : 0}>
                <Image
                  src={findIpfsImage(proposal.body)}
                  alt="Thumbnail"
                  objectFit="cover"
                  borderRadius="md"
                  border={borderColor}
                  boxSize="100px"
                  onError={(e) => {
                    e.currentTarget.src = placeholderImage;
                  }}
                />
              </Box>

              <VStack align="start" flex="1" spacing={2}>
                <Text
                  color="white"
                  fontSize={'20px'}
                  fontWeight={'bold'}
                >
                  {proposal.title}
                </Text>
                {/* add eth and nns resolver to author */}
                <Text color="white">Author: {proposal.author.slice(0, 6)}...{proposal.author.slice(-4)}</Text>
                {proposal.summary && (
                  <Text
                    color="aqua"
                    borderRadius="10px"
                    border="1px solid white"
                  >
                    🤖 GPT-Summary: {proposal.summary}
                  </Text>
                )}
                <Flex direction="row" wrap="wrap" justifyContent="right" mt={4}>
                  {proposal.choices.sort().reverse().map((choice, index) => (
                    <Button
                      key={index}
                      colorScheme={proposal.state === 'active' ? 'green' : 'gray'}
                      isDisabled={proposal.state !== 'active'}
                      size="sm"
                      m={1}
                      onClick={() => window.open(`https://snapshot.org/#/skatehive.eth/proposal/${proposal.id}`)}
                    >
                      {choice}
                    </Button>
                  ))}
                </Flex>
              </VStack>
            </Flex>
          ))
        )}
      </VStack>

      <ProposalModal isOpen={isModalOpen} onClose={handleCloseModal} proposalContent={modalContent} proposalTitle={modalTitle} />
    </Flex>
  );


};

export default SkatehiveProposals;
