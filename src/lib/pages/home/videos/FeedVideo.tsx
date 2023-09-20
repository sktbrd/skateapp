import React, { useEffect, useState } from 'react';
import { Client, Discussion } from '@hiveio/dhive';
import ReactHtmlParser from 'react-html-parser';
import { Text as ChakraText, Modal, ModalOverlay, ModalContent, useDisclosure } from '@chakra-ui/react';
import { Avatar, Button, Box, SimpleGrid } from '@chakra-ui/react';
import PostModal from '../magazine/postModal/postModal';



const nodes = [
  "https://rpc.ecency.com",
  "https://api.deathwing.me",
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.pharesim.me",
];

function transform3SpeakContent(content: string): string {
  const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9]+\/[a-zA-Z0-9]+))\)/;
  const match = content.match(regex);
  if (match) {
    const videoID = match[3];
    const iframe = `<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://3speak.tv/embed?v=${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    content = content.replace(regex, iframe);
  }
  return content;
}

const adjustVideoSize = (iframe: string): string => {
  const odyseeDomains = ["odysee.com", "lbry.tv"]; // You can add more domains to this list in the future if needed

  if (iframe.includes("youtube.com") || odyseeDomains.some(domain => iframe.includes(domain))) {
    iframe = iframe.replace(/width\s*=\s*"\d+"/, '').replace(/height\s*=\s*"\d+"/, '').replace('<iframe', '<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen allow-scripts');
    return iframe;
  }

  return iframe;
};





const HiveVideos: React.FC = () => {
  const [posts, setPosts] = useState<Discussion[]>([]);
  const [client, setClient] = useState(new Client(nodes[0]));
  const [selectedPost, setSelectedPost] = useState<Discussion | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = {
          tag: 'hive-173115',
          limit: 30,
        };
        const result: Discussion[] = await client.database.getDiscussions('created', query);
        setPosts(result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPosts();
  }, []);

  const extractIframes = (markdownContent: string): string[] => {
    const iframeRegex = /<iframe[^>]*src="([^"]*)"[^>]*><\/iframe>/g;
    const matches = markdownContent.match(iframeRegex) || [];
    return matches.map(adjustVideoSize);
  };

  const openPostModal = (post: Discussion) => {
    setSelectedPost(post);
    console.log("Selected post:", post);
    onOpen();
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
        {posts.map((post, index) => {
          let modifiedContent = transform3SpeakContent(post.body);
          const iframes = extractIframes(modifiedContent);
          return iframes.length > 0 ? (
            iframes.map((iframe, i) => (
              <Box key={`${index}-${i}`} border="2px solid limegreen" borderRadius="md" m={2} p={2}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={`https://images.hive.blog/u/${post.author}/avatar`} size="md" borderRadius="8px" />
                  <ChakraText ml={2}>{post.author}</ChakraText>
                </Box>
                <Box position="relative" width="100%" paddingBottom="56.25%">
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '1px solid limegreen' }}>
                    {ReactHtmlParser(iframe)}
                  </div>
                </Box>
                <Box textAlign="right">
                  <br></br>
                  <Button border="1px solid limegreen" onClick={() => openPostModal(post)}>Open Original Post</Button>
                </Box>
              </Box>
            ))
          ) : null;
        })}
      </SimpleGrid>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {selectedPost && (
            <PostModal
              title={selectedPost.title}
              content={selectedPost.body}
              author={selectedPost.author}
              user={selectedPost.author} // Replace with the actual user if needed
              permlink={selectedPost.permlink}
              weight={0} // Replace with the actual weight if needed
              onClose={onClose}
              isOpen={isOpen}
              comments={[]} // Replace with the actual comments if needed
              postUrl={selectedPost.url}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default HiveVideos;
