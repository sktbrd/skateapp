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
  Tooltip,
} from "@chakra-ui/react";
import { Client } from "@hiveio/dhive";
import voteOnContent from "../api/voting";
import useAuthUser from "../api/useAuthUser";

import { useEffect, useState } from "react";
import PostModal from "./postModal/postModal";
import ErrorModal from "./postModal/errorModal";
import { useNavigate, Link } from "react-router-dom";

import * as Types from "./types";
import { css } from "@emotion/react";

import EarningsModal from "./postModal/earningsModal"; // Replace with the correct path to EarningsModal
import { MdArrowUpward } from 'react-icons/md';
import { Style } from "util";
interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

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
  "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fc.tenor.com%2FZco-fadJri4AAAAd%2Fcode-matrix.gif&f=1&nofb=1&ipt=9a9b3c43e852a375c62be78a0faf338d6b596b4eca90e5c37f75e20725a3fc67&ipo=images";
const placeholderEarnings = 69.42;

const randomSentences = [
  // "Have a spooky Skateboarding!",
  "Don't mall grab, or do it, you do you...",
  "'Ok to push Mongo, it is! -master yoda'",
  "Roll one, and play some stoken.quest?",
  "Remember Mirc times ?",
  "Fuck instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...", 
  "We will load as fast as Daryl Rolls",
  "Who was Gnartoshi Shredamoto?",
  "We have secret sections here, can you find?"
];
const SPECIAL_TAG = "crowsnight666";


const PlaceholderLoadingBar = () => {
  const randomIndex = Math.floor(Math.random() * randomSentences.length);
  const randomSentence = randomSentences[randomIndex];

  return (
    <center>
      <Image boxSize="300px" src="https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif" />
      <Text>{randomSentence}</Text>
    </center>
  );
};

const HiveBlog: React.FC<Types.HiveBlogProps> = ({
  queryType = "created",
  tag = process.env.COMMUNITY || 'hive-173115'
  
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
  const [displayedPosts, setDisplayedPosts] = useState<number>(20 );
  const [postsToLoadInitially] = useState<number>(20); // Number of posts to load initially
  const [postsToLoadMore] = useState<number>(10); // Number of additional posts to load on "Load More" click
  const { user, isLoggedIn } = useAuthUser();
  const [hasVotedWitness, setHasVotedWitness] = useState<boolean>(false); // Step 4
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // Track modal visibility
  const [errorMessage, setErrorMessage] = useState<string>(""); // Track error message

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

  useEffect(() => {
    fetchInitialPosts(); // Fetch initial posts when the component mounts
  }, [currentTag]);

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
  // full caps for title of post
  title = title.toUpperCase();

  if (title.length <= maxCharacters) {
    return title;
  } else {
    const truncatedTitle = title.substring(0, maxCharacters - 3) + '...';
    return truncatedTitle;
  }
};
const handleVoteClick = async (post: any) => {
  // Check if the user is logged in before allowing them to vote
  if (!isLoggedIn()) {
    // Handle the case where the user is not logged in, e.g., show a login prompt
    console.log("User is not logged in. Show a login prompt.");
    setErrorMessage("You have to login first ! Dãããã... ")
    setIsErrorModalOpen(true)
    return;
  }

  // Perform the voting action
  try {
    // You may need to retrieve the user's username and other information here
    const username = user?.name || ""; // Replace with the actual username
    let weight = 10000; // Replace with the desired voting weight

    if (isVoted(post)) {
      weight = 0; // If the post has been voted on, set the weight to 0 to remove the vote
    }

    // Call the voteOnContent function to vote on the post
    await voteOnContent(username, post.permlink, post.author, weight);

    // Handle successful vote
    console.log("Vote successful!");

    // set loading and then rerender the component
    setIsLoadingInitial(true);
    setLoadedPosts([]);
    setDisplayedPosts(20);
    setTimeout(() => {
      fetchInitialPosts();
    }, 3000);
  } catch (error) {
    // Handle voting error
    console.error("Error while voting:", error);
    setErrorMessage("Error While Voting!")

    setIsErrorModalOpen(true); // Open the error modal
  }
};
const cardStyleGradient = css`
background-color: "linear-gradient(to top, #0D0D0D, #1C1C1C, #000000)",
`;

const isVoted = (post: any) => {
  // check for user in active_votes
  const userVote = post.active_votes.find((vote: any) => vote.voter === user?.name);
  const percentage = parseInt(userVote?.percent);

  if (userVote && (percentage > 0 || percentage < 0)) {
    return true;
  }

  return false;
}

const getUserVote = (post: any) => {
  // check for user in active_votes
  const userVote = post.active_votes.find((vote: any) => vote.voter === user?.name);
  const percentage = parseInt(userVote?.percent);

  if (userVote && (percentage > 0 || percentage < 0)) {
    const vote = {
      isVoted: true,
      rshares: userVote.rshares,
      percent: percentage,
    };

    console.log(vote, post.permlink)

    return vote;
  }

  return {
    isVoted: false,
    rshares: 0,
    percent: 0,
  };
}

const getVotedProperties = (post: any) => {
  // If the post has been voted on, return the voted properties
  if (isVoted(post)) {
    return {
      width: '10px',
      backgroundColor: 'mediumspringgreen', // Change the background color
      color: 'mediumvioletred', // Change the text color
    };
  }

  // If the post has not been voted on, return an empty object
  return {
    width: '10px'
  };
}

const getVotedHoverProperties = (post: any) => {
  // If the post has been voted on, return the voted properties
  if (isVoted(post)) {
    // red hover
    return {
      backgroundColor: 'mediumvioletred', // Change the color on hover
      color: 'mediumspringgreen', // Change the text color on hover
      boxShadow: '0 0 8px red, 0 0 8px red, 0 0 8px red', // Add an underglow effect
      border: "2px solid red"
    };
  }

  // If the post has not been voted on, return normal hover properties
  return {
    backgroundColor: 'mediumspringgreen', // Change the color on hover
    color: 'mediumvioletred', // Change the text color on hover
    boxShadow: '0 0 8px darkgoldenrod, 0 0 8px darkgoldenrod, 0 0 8px darkgoldenrod', // Add an underglow effect
    border: "2px solid darkgreen" 
  };
}


return (
  <Box>
    {isLoadingInitial ? (
      <PlaceholderLoadingBar />
    ) : (
      <>
        <ErrorModal
          isOpen={isErrorModalOpen}
          onClose={() => setIsErrorModalOpen(false)}
          errorMessage={errorMessage}
        />
        <Box
          display="grid"
          gridTemplateColumns={`repeat(${gridColumns}, minmax(280px, 1fr))`}
          gridGap={1}
        >
          {loadedPosts.map((post) => (
            <Card
              //border="1px"
              //borderColor="limegreen"
              bg="linear-gradient(to top,  black, #070807, black)"
              key={post.permlink}
              maxW="md"
              mb={2}
              onClick={() => handleCardClick(post)}
              cursor="pointer"
              css={cardStyles} /* Apply the cardStyles CSS */
              style={{
                backgroundImage: `url('https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/EoiK3LBjuqLaVD9nZEAP6So8j7LFhq9G5S68GSkB99WbwHQs37pXjXpfu5BECdazJh6.png`, // Replace 'your-image-url.jpg' with your image URL
                backgroundSize: '100% auto',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
                
                
              }}
            >


              <CardHeader>
                <Flex
                  css={cardStyles} /* Apply the cardStyles CSS */
                  borderRadius="10px"
                  justifyContent="center" /* Center the content horizontally */
                  alignItems="center"
                
                >
                  <Heading 
                  color="white"
                  paddingTop={"10px"}
                  size="lg"
                  style={{
                    textShadow: '0 0 20px rgba(0, 255, 0, 0.7)', // Apply a green glow behind the text
                    fontStyle: '', // Make the text italic
                  }} 
                  >
                    {post.author}
                  </Heading>
                </Flex>
              </CardHeader>

                            
              <Box padding="20px" height="200px"> 
                <Image 
                  objectFit="cover"
                  border="1px solid limegreen"
                  borderRadius="20px"
                  src={post.thumbnail}
                  alt="Post Thumbnail"
                  height="100%"
                  width="100%"
                />
              </Box>
              <CardBody>
                
                <Box //the box around the blogpost title
                  //border="1px solid limegreen"
                  borderRadius="0px"
                  minWidth="100%"
                  minHeight="100%"

                  style={{ //style of the speech bubble
                    backgroundImage: `url('https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23tGLtmE5K6ovFdVS4tYwA5yfJ4S3vnByzcg7BshwvCN1r5Jbmz8NmNm9CUKBm91FVFqT.png')`,
                    backgroundSize: '100% 100%', // stretches the speech bubble as big as the div and dynamically changes 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat', 
                    marginBottom: '-40px', // makes the speech bubble extend beyond the div
                    paddingBottom: '40px', // for some reason it needs this part too?
                  }}
                >
                  <Text fontWeight="semibold" 
                        color="orange" 
                        paddingLeft="5px"
                        paddingTop="10px"
                        paddingRight="5px"
                        textAlign="center" // Center horizontally
                        display="flex"     // Use flexbox to center vertically
                        justifyContent="center" // Center vertically
                        alignItems="center"
                        >
                    {truncateTitle(post.title)}
                  </Text>
              </Box>
          </CardBody>

              <CardFooter
                
              style={{
                
                backgroundImage:
                    post.earnings > 30
                    ? `url('https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/EocCPiTarW3qvJ2tp67PbkHCwcpac51SkMpTqDg6HjTQZYDncJvxkikLToUUBEHWG8A.gif')`
                    : post.earnings >= 10 && post.earnings <= 20
                    ? `url('https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/EnymbnXgVUtxPZPsL3n1nQRYkhnv1VBGfV3ABoPLqN5VKgdjhV9wiH9hBtz8e1iVTXF.gif')`
                    : post.earnings >= 20 && post.earnings <= 30
                    ? `url('https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23u5bNzQ1Witg6qMPYBbgxzPzAx8iR8TDYWA5goRhanYgcqTGofXvPd9vMdDVogKoSwTb.gif')`
                    : 'none',
                    backgroundSize: '100% auto',
                    backgroundPosition: 'center bottom',
                    backgroundRepeat: 'no-repeat',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    
                
              }}

              
            >
              
              
                <Text
                  color="white"
                  marginTop = "2px"
                  style={{ display: "flex", alignItems: "center" }} >

                <Link to={`profile/${post.author}`}>
                      <Image
                        border="1px solid limegreen"
                        borderRadius="10px"
                        src={`https://images.ecency.com/webp/u/${post.author}/avatar/small`}
                        width="105%"
                        height="105%"
                        style={{
                          boxShadow: '0 8px 12px rgba(0, 0, 0, 0.8)', // Adding a drop shadow
                        }}
                      />
                    </Link>

                    
                
                <Tooltip color={"white"} backgroundColor={"black"} border={"1px dashed limegreen"} label={<div style={{color: 'limegreen'}}>45% - 🛹 Author + Benef. <br /> 50% - 🧡 Voters <br /> 5%  - 🏦 Treasury* <br /><br /> Click to Learn More  </div>} aria-label="View Voters">
                <Button
                      position="absolute"
                      bottom="10px"
                      right="10px"
                      onClick={(e) => {e.stopPropagation(); handleVotersModalOpen(post);}}
                      variant="ghost"
                      colorScheme="green"
                      size="s"
                      ml={2}
                      style={{
                          fontFamily: 'Helvetica',
                          fontSize: `${Math.min(46, 13 + (post.earnings * 1.2))}px`,
                          textShadow: '2px 2px 1px rgba(0, 0, 0, 1)',
                          transition: 'background-color 0.3s ease-in-out' // Add a transition for a smoother effect
                      }}
                      _hover={{
                          backgroundColor: 'transparent' // Set the background color to transparent on hover
                      }}
                  >

                    
                    <span style={{ fontFamily: 'serif', color: 'chartreuse'}}>
                    
                      $</span>{post.earnings.toFixed(2)}
                    
                    
                    
        
                    <img //spinning stoken coin
                      src="https://i.ibb.co/16vCTVT/coin-mental-33px.gif"
                      alt="spinning stoken coin"
                      style={{
                        // Dynamically set the size based on earnings
                        width: `${Math.min(250, 18 + (post.earnings * 0.6))}px`, 
                        height: `${Math.min(250, 18 + (post.earnings * 0.6))}px`, 
                        marginLeft: "7px",
                        marginBottom: "2px",
                      }}
                    />
                  </Button>
                </Tooltip>

                </Text>

                <Box marginLeft="auto">
                <Tooltip backgroundColor={"black"} border={"1px dashed limegreen"} label={<div style={{color: 'orange'}}>Wow!</div>} aria-label="View Voters">

                <IconButton
                    icon={<MdArrowUpward />}
                    backgroundColor="black"
                    color="white"
                    size="sm"
                    borderRadius="50%"
                    aria-label="Upvote"
                    border="1px"
                    borderColor="limegreen"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click event from propagating
                      handleVoteClick(post);
                  
                    }}

                    style={getVotedProperties(post)} // Apply the voted properties


                    _hover={getVotedHoverProperties(post)} // Apply the hover properties
                    
                  />

                                  </Tooltip>

                </Box>
                


              </CardFooter>
            </Card>
          ))}
        </Box>
        <Box display="flex" justifyContent="center">
          <Button variant="outline" colorScheme="green" onClick={loadMorePosts}>
            Load More
          </Button>
        </Box>
        {isLoadingMore && <PlaceholderLoadingBar />}
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
          userVote={selectedPost ? getUserVote(selectedPost) : null}
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