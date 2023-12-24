import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Text, Flex, VStack, Image, Button, Skeleton, Badge, HStack, useBreakpointValue, useMediaQuery, SimpleGrid } from '@chakra-ui/react';
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
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const borderColor = '1px solid white';

  return (
    <Flex flexDirection="column" >
      <DaoStatus />
      <Flex justify="center">
        <Text border={borderColor} borderRadius="10px" padding="8px" fontSize="2xl" color="white">
          Governance
        </Text>
      </Flex>

      <SimpleGrid mx="auto" maxWidth="100%" columns={{ base: 1, md: 2 }} spacing={3} mt={3}>
        {loadingProposals ? (
          Array.from({ length: 10 }).map((_, index) => (
            <Flex key={index} direction="column">
              {/* ... (loading placeholders for proposals) */}
            </Flex>
          ))
        ) : (
          proposals.map((proposal) => (
            <Flex key={proposal.id} borderWidth={1} borderRadius="md" border="1px solid white" p={4} direction="column" backgroundColor="black" boxShadow="md" opacity={proposal.state === 'closed' ? 0.7 : 1}>
              <Box minWidth="100%" mb={2} minHeight="50px" >
                <Text
                  padding="5px"
                  color="white"
                  onClick={() => handleOpenModal({ body: proposal.body, title: proposal.title })}
                  cursor="pointer"
                  fontSize={'30px'}
                  fontStyle={'bold'}
                >
                  {proposal.title}
                </Text>
              </Box>
              <Box padding={"30px"} width="100%" height={'auto'} boxSize={"272px"} mx="auto">
                <Image
                  src={findImage(proposal.body)}
                  alt="Thumbnail"
                  objectFit="cover"
                  borderRadius="md"
                  border={borderColor}
                  aspectRatio={1}
                  onError={(e) => {
                    e.currentTarget.src = placeholderImage;
                  }}
                />
              </Box>

              <VStack paddingLeft="5px" align="start" width="100%">

                <HStack alignContent="center" mb={2}>
                  <Badge
                    variant="subtle"
                    colorScheme={proposal.state === 'closed' ? 'red' : 'green'}
                  >
                    {proposal.state === 'closed' ? 'Closed' : 'Active'}
                  </Badge>
                  <Text color="white">Autor: {proposal.author.slice(0, 6)}...{proposal.author.slice(-4)}</Text>
                </HStack>
                {loadingSummaries ? (
                  <Skeleton height="20px" width="100%" mt={2} />
                ) : (
                  <Box minHeight="20px"> {/* Altura mínima ajustada para garantir consistência */}
                    <Text
                      padding="5px"
                      color="aqua"
                      borderRadius="10px"
                      border="1px solid white"
                      cursor="pointer"
                      onClick={() => handleOpenModal({ body: proposal.body, title: proposal.title })}
                      mt={2}
                    >
                      🤖 GPT-Summary: {proposal.summary}
                    </Text>
                  </Box>
                )}
              </VStack>
              <Flex borderRadius="10px" flexDirection="row" justifyContent="space-between" mt={4} minHeight="50px"> {/* Altura mínima ajustada para garantir consistência */}
                <Flex flexDirection="row" justifyContent="center" width="100%">
                  {proposal.choices.sort().reverse().map((choice, index) => (
                    <Button
                      key={index}
                      color="white"
                      backgroundColor="black"
                      border="1px solid orange"
                      mr={2}
                      mb={2}
                      borderRadius="md"
                      onClick={() => {
                        if (proposal.state === 'closed') {
                          alert("Votação encerrada. Você está atrasado para votar!");
                        } else {
                          window.open(
                            `https://snapshot.org/#/skatehive.eth/proposal/${proposal.id}`,
                            '_blank'
                          );
                        }
                      }}
                      textTransform="uppercase"
                    >
                      {choice}
                    </Button>

                  ))}
                </Flex>
              </Flex>
            </Flex>

          ))
        )}

      </SimpleGrid>
      <ProposalModal isOpen={isModalOpen} onClose={handleCloseModal} proposalContent={modalContent} proposalTitle={modalTitle} />
    </Flex>
  );
};

export default SkatehiveProposals;
