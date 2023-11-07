import React from 'react';
import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Button,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderersUpload } from 'lib/pages/utils/MarkdownRenderersUpload';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalContent: string;
  proposalTitle: string;
}

import { useEffect } from 'react';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  proposalContent,
  proposalTitle,
}) => {
  const [positiveOpinion, setPositiveOpinion] = useState<string>('Loading positive opinion...');
  const [negativeOpinion, setNegativeOpinion] = useState<string>('Loading negative opinion...');

  const generateOpinions = async (proposalBody: string) => {
    try {
      // Construct prompts for generating opinions
      const positivePrompt = `Generate a positive opinion about the following proposal:\n"${proposalBody}"`;
      const negativePrompt = `Generate a negative opinion about the following proposal:\n"${proposalBody}"`;

      // Send requests to OpenAI's GPT-3 model for positive and negative opinions
      const positiveResponse = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates opinions.' },
          { role: 'user', content: positivePrompt },
        ],
        model: 'gpt-3.5-turbo',
      });

      const negativeResponse = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates opinions.' },
          { role: 'user', content: negativePrompt },
        ],
        model: 'gpt-3.5-turbo',
      });

      // Extract the positive and negative opinions from the responses
      const positiveOpinion = positiveResponse.choices[0]?.message?.content || 'No positive opinion generated.';
      const negativeOpinion = negativeResponse.choices[0]?.message?.content || 'No negative opinion generated.';
      
      setPositiveOpinion(positiveOpinion);
      setNegativeOpinion(negativeOpinion);

      console.log('Positive Opinion:', positiveOpinion);
      console.log('Negative Opinion:', negativeOpinion);
    } catch (error) {
      console.error('Error generating opinions:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Call the function to generate opinions when the modal is opened
      generateOpinions(proposalContent);
    }
  }, [isOpen, proposalContent]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minWidth={"60%"} backgroundColor={"black"} border={"1px solid white"}>
        <ModalHeader color="orange" fontSize="42px">{proposalTitle}</ModalHeader>
        <Divider />
        <ModalCloseButton />
        <ModalBody>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Proposal</Tab>
              <Tab>Ai generate LOVE</Tab>
              <Tab>Ai generated HATE</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownRenderersUpload}
                >
                  {proposalContent}
                </ReactMarkdown>
              </TabPanel>
              <TabPanel>
                <Text color="white">Positive Opinion</Text>
                <center>
                <Image boxSize={"120px"} src="https://cdn3.emoji.gg/emojis/6156_pepe_angel.png" />
                </center>
                <Text whiteSpace="pre-wrap">{positiveOpinion}</Text>
              </TabPanel>
              <TabPanel>
                <Text color="white">Negative Opinion</Text>
                <center>

                <Image boxSize={"120px"} src="https://i.ibb.co/fq343qf/image.png" />
                </center>

                <Text whiteSpace="pre-wrap">{negativeOpinion}</Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProposalModal;
