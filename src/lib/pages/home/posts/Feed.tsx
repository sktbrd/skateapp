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

import { useNavigate, Link } from "react-router-dom";

import * as Types from './types';

import EarningsModal from "./postModal/earningsModal"; // Replace with the correct path to EarningsModal

  const nodes = [
    "https://rpc.ecency.com",
    "https://api.deathwing.me",
    "https://api.hive.blog",
    "https://api.openhive.network",
    "https://api.hive.blog",
    "https://anyx.io",
    "https://api.pharesim.me",
  ];

  const defaultThumbnail ="https://images.ecency.com/u/hive-173115/avatar/large";
  const placeholderEarnings = 69.42; 


  const PlaceholderLoadingBar = () => {
    return <center>
        <Image src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTZrYmdtbGpjaXg4NzVheDNzOTY0aTZ0NjhvMDkwcnFpdmFnazhrNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H39AnU3gTYgPm/giphy.gif"></Image>
      <Text>VocE Vai MorRer...</Text>
      </center>;
  };



  const HiveBlog: React.FC<Types.HiveBlogProps> = ({ queryType = "created", tag = "hive-173115" }) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [currentTag, setTag] = useState(tag);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [client, setClient] = useState(new Client(nodes[0]));
    const [nodeIndex, setNodeIndex] = useState(0);
    const [comments, setComments] = useState<Types.CommentProps[]>([]);
    const [isVotersModalOpen, setVotersModalOpen] = useState(false);
    const [selectedPostForModal, setSelectedPostForModal] = useState<any | null>(null);


    const fetchPostEarnings = async (author: string, permlink: string): Promise<number> => {
      try {
        const post = await client.database.call("get_content", [author, permlink]);
        const totalPayout = parseFloat(post.total_payout_value.split(" ")[0]);
        const curatorPayout = parseFloat(post.curator_payout_value.split(" ")[0]);
        const pendingPayout = parseFloat(post.pending_payout_value.split(" ")[0]);
        const totalEarnings = totalPayout + curatorPayout + pendingPayout;
        return totalEarnings;
        console.log(totalEarnings)
      } catch (error) {
        // If a request fails, switch to the next node
        const newIndex = (nodeIndex + 1) % nodes.length;
        setNodeIndex(newIndex);
        setClient(new Client(nodes[newIndex]));
        console.log(`Switched to node: ${nodes[newIndex]}`);
        // Retry the request with the new node
        return fetchPostEarnings(author, permlink);
      }
    };
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchPosts = async () => {
      setIsLoading(true);

      try {
        const query = {
          tag: tag,
          limit: 50,
        };
        const result = await client.database.getDiscussions(queryType, query);

        const postsWithThumbnails = result.map((post) => {
          const metadata = JSON.parse(post.json_metadata);
          const thumbnail =
            Array.isArray(metadata?.image) && metadata.image.length > 0
              ? metadata.image[0]
              : defaultThumbnail;
          return { ...post, thumbnail, earnings: 0 }; // Initialize earnings to 0
        });

        // Fetch earnings for each post concurrently
        const earningsPromises = postsWithThumbnails.map((post) =>
          fetchPostEarnings(post.author, post.permlink).catch((error) => {
            console.log(error);
            return placeholderEarnings; // Use placeholder value if fetching actual earnings fails
          })
        );
        const earnings = await Promise.all(earningsPromises);

        // Update earnings for each post
        const updatedPostsWithEarnings = postsWithThumbnails.map(
          (post, index) => ({ ...post, earnings: earnings[index] })
        );
        setPosts(updatedPostsWithEarnings);
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    };

    useEffect(() => {
      fetchPosts();
    }, [tag]);

    const fetchComments = async (author: string, permlink: string): Promise<any[]> => {
      try {
        const comments = await client.database.call('get_content_replies', [author, permlink]);
        return comments;
        console.log("COMMENTS: ", comments)
      } catch (error) {
        // If a request fails, switch to the next node
        const newIndex = (nodeIndex + 1) % nodes.length;
        setNodeIndex(newIndex);
        setClient(new Client(nodes[newIndex]));
        console.log(`Switched to node: ${nodes[newIndex]}`);
        // Retry the request with the new node
        return fetchComments(author, permlink);
      }
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

    const navigate = useNavigate();

    const handleVotersModalOpen = (post: any) => {
      setSelectedPostForModal(post);
      setVotersModalOpen(true);
    };
    const handleCardClick = async (post: any) => {
      setSelectedPost(post);
      const comments = await fetchComments(post.author, post.permlink);
      setComments(comments);
      onOpen(); // Open the post modal
      console.log(post)
    };
    

    return (

      <Box>

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
                borderColor="whiten"
                bg="black"
                key={post.permlink}
                maxW="md"
                mb={4}
                onClick={() => handleCardClick(post)}
                cursor="pointer"
              >
                <CardHeader>
                  <Flex>
                    <Flex flex="1" gap="3" alignItems="center">
                    <Link to={`/${post.author}`}>
                        <Avatar
                          name={post.author}
                          border="1px solid whiten"
                          src={`https://images.ecency.com/webp/u/${post.author}/avatar/small`}
                        />
                      </Link>

                      <Box>
                        <Heading size="sm">{post.author}</Heading>
                      </Box>
                    </Flex>
                    <IconButton variant="ghost" colorScheme="gray" aria-label="See menu" />
                  </Flex>
                </CardHeader>
                <Box padding="10px" height="200px">
                  <Image
                    objectFit="cover"
                    border="1px solid whiten"
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
                <CardFooter>
                  <Text color="white" style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    position="absolute" // Keep this
                    bottom="10px" // Change from top to bottom
                    right="10px" // Keep this
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling up
                      handleVotersModalOpen(post);
                    }}
                    variant="ghost"
                    colorScheme="gray"
                    size="xs"
                    ml={2}
                  >
                    Stoken: {post.earnings.toFixed(2)}
                    <img
                      src="https://i.ibb.co/16vCTVT/coin-mental-33px.gif"
                      alt="Earning"
                      style={{ width: "18px", height: "18px", marginLeft:"7px", marginBottom: "2px" }}
                    />
                  </Button>
                  </Text>
                </CardFooter>
              </Card>
            ))}
          </Box>
        )}
  
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <PostModal
              title={selectedPost?.title}
              content={selectedPost?.body}
              author={selectedPost?.author}
              user={selectedPost?.user}
              permlink={selectedPost?.permlink}
              weight={selectedPost?.weight}
              onClose={onClose}
              isOpen={isOpen}
              comments={comments}
            />
          </ModalContent>
        </Modal>
  
        <Modal isOpen={isVotersModalOpen} onClose={() => setVotersModalOpen(false)} size="xl">
          <ModalOverlay />
          <ModalContent>
            <EarningsModal
              isOpen={isVotersModalOpen}
              onClose={() => setVotersModalOpen(false)}
              post={selectedPostForModal}
            />
          </ModalContent>
        </Modal>
      </Box>
    );

  };

  export default HiveBlog;

