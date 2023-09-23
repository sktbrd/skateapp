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

import * as Types from "./types";
import { css } from "@emotion/react";

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

const defaultThumbnail =
  "https://images.ecency.com/u/hive-173115/avatar/large";
const placeholderEarnings = 69.42;

const randomSentences = [
  "Don't mall grab, or do it, you do you...",
  "'Ok to push Mongo it is (master YODA)'",
  "Roll one and play some stoken.quest",
  "Remember Mirc times ?",
  "Fuck instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating proof of stoke...", 
  "We will as fast as Daryl on a hill"
];

const PlaceholderLoadingBar = () => {
  const randomIndex = Math.floor(Math.random() * randomSentences.length);
  const randomSentence = randomSentences[randomIndex];

  return (
    <center>
      <Image src="https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif" />
      <Text>{randomSentence}</Text>
    </center>
  );
};

const HiveBlog: React.FC<Types.HiveBlogProps> = ({
  queryType = "created",
  tag = "hive-173115",
}) => {
  const [loadedPosts, setLoadedPosts] = useState<any[]>([]);
  const [currentTag, setTag] = useState(tag);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); // Loading state for initial posts
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading state for "Load More"
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [client, setClient] = useState(new Client(nodes[0]));
  const [nodeIndex, setNodeIndex] = useState(0);
  const [comments, setComments] = useState<Types.CommentProps[]>([]);
  const [isVotersModalOpen, setVotersModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState<any | null>(
    null
  );
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [displayedPosts, setDisplayedPosts] = useState<number>(15 );
  const [postsToLoadInitially] = useState<number>(15); // Number of posts to load initially
  const [postsToLoadMore] = useState<number>(10); // Number of additional posts to load on "Load More" click

  const fetchPostEarnings = async (
    author: string,
    permlink: string
  ): Promise<number> => {
    try {
      const post = await client.database.call("get_content", [author, permlink]);
      const totalPayout = parseFloat(post.total_payout_value.split(" ")[0]);
      const curatorPayout = parseFloat(
        post.curator_payout_value.split(" ")[0]
      );
      const pendingPayout = parseFloat(
        post.pending_payout_value.split(" ")[0]
      );
      const totalEarnings = totalPayout + curatorPayout + pendingPayout;
      return totalEarnings;
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
    setIsLoadingMore(true); // Set loading state when "Load More" is clicked

    try {
      const query = {
        tag: currentTag,
        limit: displayedPosts + postsToLoadMore, // Load more posts
      };
      const result = await client.database.getDiscussions(queryType, query);

      // Exclude already loaded posts from the new result
      const newPosts = result.slice(displayedPosts);

      const postsWithThumbnails = newPosts.map((post) => {
        const metadata = JSON.parse(post.json_metadata);
        const thumbnail =
          Array.isArray(metadata?.image) && metadata.image.length > 0
            ? metadata.image[0]
            : defaultThumbnail;
        return { ...post, thumbnail, earnings: 0 }; // Initialize earnings to 0
      });

      // Fetch earnings for each new post concurrently
      const earningsPromises = postsWithThumbnails.map((post) =>
        fetchPostEarnings(post.author, post.permlink).catch((error) => {
          console.log(error);
          return placeholderEarnings; // Use placeholder value if fetching actual earnings fails
        })
      );
      const earnings = await Promise.all(earningsPromises);

      // Update earnings for each new post
      const updatedPostsWithEarnings = postsWithThumbnails.map(
        (post, index) => ({ ...post, earnings: earnings[index] })
      );

      // Append the new posts to the existing ones
      setLoadedPosts((prevPosts) => [...prevPosts, ...updatedPostsWithEarnings]);
      setDisplayedPosts(displayedPosts + postsToLoadMore); // Update the displayed posts count
    } catch (error) {
      console.log(error);
    }

    setIsLoadingMore(false); // Clear loading state after new posts are loaded
  };

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setIsLoadingInitial(true); // Set loading state for initial posts

      try {
        const query = {
          tag: currentTag,
          limit: postsToLoadInitially, // Load initial posts
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

        // Fetch earnings for each initial post concurrently
        const earningsPromises = postsWithThumbnails.map((post) =>
          fetchPostEarnings(post.author, post.permlink).catch((error) => {
            console.log(error);
            return placeholderEarnings; // Use placeholder value if fetching actual earnings fails
          })
        );
        const earnings = await Promise.all(earningsPromises);

        // Update earnings for each initial post
        const updatedPostsWithEarnings = postsWithThumbnails.map(
          (post, index) => ({ ...post, earnings: earnings[index] })
        );

        // Set the initial loaded posts
        setLoadedPosts(updatedPostsWithEarnings);
      } catch (error) {
        console.log(error);
      }

      setIsLoadingInitial(false); // Clear loading state for initial posts
    };

    fetchInitialPosts(); // Fetch initial posts when the component mounts
  }, [tag]);

  const loadMorePosts = () => {
    fetchPosts(); // Fetch more posts when "Load More" is clicked
  };

  const fetchComments = async (author: string, permlink: string): Promise<any[]> => {
    try {
      const comments = await client.database.call("get_content_replies", [
        author,
        permlink,
      ]);
      return comments;
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
    console.log(post)

    setSelectedPost(post);
    const comments = await fetchComments(post.author, post.permlink);
    setComments(comments);
    setPostUrl(post.url); // Move this line here
    onOpen();
  };
  const cardHoverStyles = css`
  transform: scale(1.01); /* Increase size by 5% */
  transition: transform 0.2s ease-in-out; /* Add a smooth transition effect */
  box-shadow: 0 0 150px rgba(0, 128, 0, 0.5); /* Add a green box shadow for the glow effect */
`;

const cardStyles = css`
  border-radius: 10px;
   /* Add a higher z-index to display the card above other cards */
  /* ... (other styles) */
  &:hover {
    ${cardHoverStyles} /* Apply hover styles when hovering over the card */
  }
`;

const truncateTitle = (title:any, maxCharacters = 60) => {
  // Capitalize todas as letras do título
  title = title.toUpperCase();

  if (title.length <= maxCharacters) {
    return title;
  } else {
    const truncatedTitle = title.substring(0, maxCharacters - 3) + '...';
    return truncatedTitle;
  }
};


  return (
    <Box>
      {isLoadingInitial ? (
        <PlaceholderLoadingBar />
      ) : (
        <>
          <Box
            display="grid"
            gridTemplateColumns={`repeat(${gridColumns}, minmax(280px, 1fr))`}
            gridGap={1}
          >
            {loadedPosts.map((post) => (
              <Card
                border="1px"
                borderColor="limegreen"
                bg="black"
                key={post.permlink}
                maxW="md"
                mb={4}
                onClick={() => handleCardClick(post)}
                cursor="pointer"
                css={cardStyles} /* Apply the cardStyles CSS */
              >
                <CardHeader>
                  <Flex>
                    <Flex
                      css={cardStyles} /* Apply the cardStyles CSS */

                      flex="1"
                      gap="3"
                      borderRadius="10px"
                      alignItems="center"
                    >
                      <Link to={`profile/${post.author}`}>
                        <Avatar
                          name={post.author}
                          border="1px solid limegreen"
                          borderRadius="10px"
                          src={`https://images.ecency.com/webp/u/${post.author}/avatar/small`}
                        />
                      </Link>

                      <Box>
                        <Heading color="white" size="sm">{post.author}</Heading>
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
                  <Box
                    border="1px solid limegreen"
                    borderRadius="10px"
                    minWidth="100%"
                    minHeight="100%"
                    >
                                    
                  <Text 
                    fontWeight="semibold"
                    color="orange"
                    padding="13px"
                    >
                    {truncateTitle(post.title)}
                    </Text>

                  </Box>

                </CardBody>
                <CardFooter>
                  
                  <Text
                    color="white"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Button
                      position="absolute"
                      bottom="10px"
                      right="10px"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVotersModalOpen(post);
                      }}
                      variant="ghost"
                      colorScheme="green"
                      size="s"
                      ml={2}
                    >
                     $ {post.earnings.toFixed(2)}
                      <img
                        src="https://i.ibb.co/16vCTVT/coin-mental-33px.gif"
                        alt="Earning"
                        style={{
                          width: "18px",
                          height: "18px",
                          marginLeft: "7px",
                          marginBottom: "2px",
                        }}
                      />
                    </Button>
                  </Text>
                </CardFooter>
              </Card>
            ))}
          </Box>
          <Box display="flex" justifyContent="center">
            <Button variant="outline" colorScheme="green" onClick={loadMorePosts}>
              Load More
            </Button>
          </Box>
          {isLoadingMore && <PlaceholderLoadingBar />} {/* Show loading bar below posts on "Load More" */}
        </>
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
              postUrl={selectedPost?.url}
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
