import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";

import { Client } from "@hiveio/dhive";

import { useEffect, useState } from "react";

import PostModal from "./postModal/postModal";
import Comments from "./postModal/comments";
  
import { compileFunction } from "vm";

import * as Types from './types';

const nodes = [
  "https://rpc.ecency.com",
  "https://api.deathwing.me",
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.pharesim.me",
];

const defaultThumbnail = "https://images.ecency.com/u/hive-173115/avatar/large";
const placeholderEarnings = 69.42; // Replace with actual placeholder value

const PlaceholderLoadingBar = () => {
  return (
    <center>
      <Image src="https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif" />
      <Text>Roll a Joint...</Text>
    </center>
  );
};


const GnarsBlog = ({ tags }: Types.GnarsBlogProps) => {
  const [posts, setPosts] = useState<Types.Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Types.Post | null>(null);
  const [client, setClient] = useState(new Client(nodes[0]));
  const [nodeIndex, setNodeIndex] = useState(0);
  const [comments, setComments] = useState<Types.CommentProps[]>([]);


  const fetchPostEarnings = async (
    author: string,
    permlink: string
  ): Promise<number> => {
    try {
      const post = await client.database.call("get_content", [author, permlink]);
      const totalPayout = parseFloat(post.total_payout_value.split(" ")[0]);
      const curatorPayout = parseFloat(post.curator_payout_value.split(" ")[0]);
      const pendingPayout = parseFloat(post.pending_payout_value.split(" ")[0]);
      const totalEarnings = totalPayout + curatorPayout + pendingPayout;
      return totalEarnings;
    } catch (error) {
      const newIndex = (nodeIndex + 1) % nodes.length;
      setNodeIndex(newIndex);
      setClient(new Client(nodes[newIndex]));
      console.log(`Switched to node: ${nodes[newIndex]}`);
      return fetchPostEarnings(author, permlink);
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchPosts = async () => {
    setIsLoading(true);

    try {
      const tagQuery = tags.map((tag) => `tag:${tag}`).join(' OR ');

      const query = {
        limit: tags.length * 2, // Fetch 2 posts for each tag
        tag: tagQuery,
      };
      const result = await client.database.getDiscussions("created", query);

      const postsWithThumbnails: Types.Post[] = result.map((post) => {
        const metadata = JSON.parse(post.json_metadata);
        const thumbnail =
          Array.isArray(metadata?.image) && metadata.image.length > 0
            ? metadata.image[0]
            : defaultThumbnail;
        return { ...post, thumbnail, earnings: 0, user: "", weight: 0 };
      });

      const updatedPostsWithEarnings: Types.Post[] = await Promise.all(
        postsWithThumbnails.map(async (post) => {
          try {
            const earnings = await fetchPostEarnings(post.author, post.permlink);
            return { ...post, earnings };
          } catch (error) {
            console.log(error);
            return { ...post, earnings: placeholderEarnings };
          }
        })
      );

      setPosts(updatedPostsWithEarnings);
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [tags]);

  const handlePostClick = (post: Types.Post) => {
    setSelectedPost(post);
    console.log(post.body);
    console.log(post);
    onOpen();
  };

  const calculateGridColumns = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1400) {
      return 5;
    } else if (screenWidth >= 1100) {
      return 4;
    } else if (screenWidth >= 800) {
      return 3;
    } else if (screenWidth >= 500) {
      return 2;
    } else {
      return 1;
    }
  };
  const [gridColumns, setGridColumns] = useState(calculateGridColumns());

  useEffect(() => {
    const handleResize = () => {
      setGridColumns(calculateGridColumns());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {selectedPost && ( // Conditionally render PostModal when selectedPost is not null
            <PostModal
              title={selectedPost.title}
              content={selectedPost.body}
              author={selectedPost.author}
              user={selectedPost.user}
              permlink={selectedPost.permlink}
              weight={selectedPost.weight}
              onClose={onClose}
              isOpen={isOpen}
              comments={comments}
            />
          )}
        </ModalContent>
      </Modal>
      {isLoading ? (
        <PlaceholderLoadingBar />
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={`repeat(${gridColumns}, minmax(280px, 1fr))`}
          gridGap={1}
        >
          {posts.map((post) => (
            <Card
              border="1px"
              borderColor="limegreen"
              bg="black"
              key={post.permlink}
              maxW="md"
              mb={4}
              onClick={() => handlePostClick(post)}
            >
              <CardHeader>
                <Flex>
                  <Flex flex="1" gap="3" alignItems="center">
                    <Avatar
                      name={post.author}
                      src={`https://images.ecency.com/webp/u/${post.author}/avatar/small`}
                    />
                    <Box>
                      <Heading size="sm">{post.author}</Heading>
                    </Box>
                  </Flex>
                  <IconButton
                    variant="ghost"
                    colorScheme="gray"
                    aria-label="See menu"
                  />
                </Flex>
              </CardHeader>
              <Box padding="10px" height="200px">
                <Image
                  objectFit="cover"
                  border="1px solid limegreen"
                  borderRadius="10px"
                  src={post.thumbnail}
                  alt="Post Thumbnail"
                  height="100%"
                  width="100%"
                />
              </Box>
              <CardBody>
                <Text>{post.title}</Text>
              </CardBody>
              <CardFooter
                flexWrap="wrap"
                sx={{
                  "& > button": {
                    minW: "136px",
                  },
                }}
              >
                <Text fontSize="sm" color="gray.500" ml="auto">
                  Earnings: ${post.earnings.toFixed(2)}
                </Text>
              </CardFooter>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default GnarsBlog;
