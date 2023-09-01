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

  const defaultThumbnail ="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTZrYmdtbGpjaXg4NzVheDNzOTY0aTZ0NjhvMDkwcnFpdmFnazhrNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H39AnU3gTYgPm/giphy.gif";
  const placeholderEarnings = 69.42; 


  const PlaceholderLoadingBar = () => {
    return <center>
        <Image src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTZrYmdtbGpjaXg4NzVheDNzOTY0aTZ0NjhvMDkwcnFpdmFnazhrNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H39AnU3gTYgPm/giphy.gif"></Image>
      <Text>VocE Vai MorRer...</Text>
      </center>;
  };



  const HiveBlog: React.FC<Types.HiveBlogProps> = ({ queryType = "created", tag = "rockandroll" }) => {
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
          key={post.permlink}
          maxW="md"
          mb={4}
          onClick={() => handleCardClick(post)}
          cursor="pointer"
          position="relative"
          overflow="hidden"
          border = "1px solid white"
          borderRadius="40% 40% 3% 3%" // Semi-circular curved top
          color="white"
          backgroundImage={`linear-gradient(rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.5)), url('https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimg03.deviantart.net%2F6979%2Fi%2F2014%2F268%2Fd%2F5%2Fgrave_stone_texture_by_timyouster-d80g5gk.jpg&f=1&nofb=1&ipt=ac41425d7743105e5e8d4bd06fd297eb58a9580c2b16d481676aedc44afc891b&ipo=images')`}

        >
<CardHeader>
  <Flex flexDirection="column" alignItems="center">
    <Box position="relative" marginBottom="2pc"> {/* Create a container for the avatar */}
      <Avatar
        name={post.author}
        border="1px solid white"
        src={`https://images.ecency.com/webp/u/${post.author}/avatar/small`}
        position="absolute" // Position the avatar absolutely
        top="-10px" // Adjust the top value to center the avatar
        left="50%" // Move the avatar to the center horizontally
        transform="translateX(-50%)" // Center the avatar precisely
      />
    </Box>
    <Link to={`/${post.author}`}>
      <Box justifyContent="center" textAlign="center"> {/* Center the author title */}
        <Box>
          <Heading size="sm">{post.author}</Heading>
        </Box>
      </Box>
    </Link>
    <IconButton variant="ghost" colorScheme="gray" aria-label="See menu" />
  </Flex>
</CardHeader>

                <Box padding="10px" height="200px" >
                  <Image
                    objectFit="cover"
                    border="1px solid white"
                    borderRadius="50px"
                    src={post.thumbnail}
                    alt="Post Thumbnail"
                    height="100%"
                    width="100%"
                  />
                </Box>
                <CardBody padding="5px">
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
