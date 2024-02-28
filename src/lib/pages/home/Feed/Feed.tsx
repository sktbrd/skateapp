import {
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
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure,
  Avatar,
  Switch,
  ButtonGroup,
  HStack
} from "@chakra-ui/react";
import { Client, Discussion } from "@hiveio/dhive";
import useAuthUser from "../../../components/auth/useAuthUser";
import voteOnContent from "../../utils/hiveFunctions/voting";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorModal from "./postModal/errorModal";
import PostModal from "./postModal/postModal";

import { css } from "@emotion/react";
import * as Types from "./types";

import { MdArrowUpward } from "react-icons/md";
import EarningsModal from "./postModal/earningsModal";
import { DiscussionQueryCategory } from "@hiveio/dhive";
import truncateTitle from "lib/pages/utils/truncateTitle";
import { IoDiamond } from "react-icons/io5";


const nodes = [
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
  "Don't mall grab, or do it, you do you...",
  "'Ok to push Mongo, it is! -master yoda'",
  "Roll one, and play some stoken.quest?",
  "Remember Mirc times?",
  "Fuck instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...",
  "We will load as fast as Daryl Rolls",
  "Who was Gnartoshi Shredmoto?",
  "We have secret sections here, can you find?",
  "We dont store any data, we dont even know how to do that",
  "P-rod said that NOW the flip ins and flip outs are too much...",
  "SkateHive is really made by skaters, that actually skate, the 4 stances and more.",
  "If its a quick post, do it in Plaza. If its a long form post do it in Mag",
  "If you need help, roll a joint and joint or grab a beer and discord.gg/skateboard",
  "You can downvote stuff if you think it sucks",
  "One day you will get our /wallet and /dao pages, take your time...",
  "Do you remember your first kickflip? I dont I am a robot",
  "You Skate? Congrats this site is yours and its money is for you.",

];


const PlaceholderLoadingBar = () => {
  const randomIndex = Math.floor(Math.random() * randomSentences.length);
  const randomSentence = randomSentences[randomIndex];

  return (
    <center>
      <Text marginBottom={"12px"} >{randomSentence}</Text>

      <Image
        borderRadius={"20px"}
        boxSize="100%"
        src="/assets/pepenation.gif"
      />
    </center>
  );
};

const HiveBlog: React.FC<Types.HiveBlogProps> = ({
  // queryType = "created",
  tag = process.env.COMMUNITY || "hive-173115",
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
  const [selectedPostForModal, setSelectedPostForModal] = useState<any | null>(null);
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [displayedPosts, setDisplayedPosts] = useState<number>(20);
  const [postsToLoadInitially] = useState<number>(20); // Number of posts to load initially
  const [postsToLoadMore] = useState<number>(10); // Number of additional posts to load on "Load More" click
  const { user, isLoggedIn } = useAuthUser();
  const [hasVotedWitness, setHasVotedWitness] = useState<boolean>(false); // Step 4
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // Track modal visibility
  const [errorMessage, setErrorMessage] = useState<string>(""); // Track error message
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [queryType, setQueryType] = useState<DiscussionQueryCategory>('trending'); // Default to "created"

  const fetchPostEarnings = async (
    author: string,
    permlink: string
  ): Promise<number> => {
    try {
      const post = await client.database.call("get_content", [
        author,
        permlink,
      ]);
      const totalPayout = parseFloat(post.total_payout_value.split(" ")[0]);
      const curatorPayout = parseFloat(post.curator_payout_value.split(" ")[0]);
      const pendingPayout = parseFloat(post.pending_payout_value.split(" ")[0]);
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


  function extractFirstLink(markdownText: string): string | null {
    const regex = /!\[.*?\]\((.*?)\)/;
    const match = markdownText.match(regex);
    return match ? match[1] : null;
  }

  function getPostDataFromPosts(posts: Discussion[]) {
    return posts.map((post) => {
      const metadata = JSON.parse(post.json_metadata);
      const app = metadata.app; // Extract the app field
      const thumbnail =
        metadata.image && metadata.image.length > 0
          ? metadata.image[0]
          : extractFirstLink(post.body) || defaultThumbnail;

      return { ...post, thumbnail, earnings: 0, app }; // Include the app in the return object
    });
  }


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

      const postsWithThumbnails = getPostDataFromPosts(newPosts);

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
      setLoadedPosts((prevPosts) => [
        ...prevPosts,
        ...updatedPostsWithEarnings,
      ]);
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
      const postsWithThumbnails = getPostDataFromPosts(result);

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
    fetchInitialPosts(); // Fetch initial posts when the component mounts or queryType changes
  }, [queryType]);

  const loadMorePosts = () => {
    fetchPosts(); // Fetch more posts when "Load More" is clicked
  };

  const fetchComments = async (
    author: string,
    permlink: string
  ): Promise<any[]> => {
    try {
      let comments = await client.call("bridge", "get_discussion", {
        author,
        permlink,
        observer: user?.name || "",
      });
      // delete (the original post from the comments object
      // its key is @username/permlink
      const originalPostKey = `${author}/${permlink}`;
      delete comments[originalPostKey];

      // loop through the comments and add the sub replies to comments in its repliesFetched property
      for (const commentKey in comments) {
        const comment = comments[commentKey];
        const subComments = comment.replies;

        // add a repliesFetched property to the comment
        comments[commentKey].repliesFetched = [];

        // add the sub comments to the repliesFetched property of this comment
        for (let i = 0; i < subComments.length; i++) {
          const subComment = subComments[i];
          comments[commentKey].repliesFetched.push(comments[subComment]);
        }
        // set net_votes of the comment with active_votes.length
        comments[commentKey].net_votes =
          comments[commentKey].active_votes.length;
      }

      const commentsArray = [];

      // add the comments to the commentsArray
      for (const commentKey in comments) {
        const comment = comments[commentKey];

        // push the comment to the comments array only if its a reply to the original post
        if (
          comment.parent_author === author &&
          comment.parent_permlink === permlink
        ) {
          commentsArray.push(comments[commentKey]);
        }
      }

      return commentsArray;
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

  const handleVotersModalOpen = (post: any) => {
    setSelectedPostForModal(post);
    setVotersModalOpen(true);
  };
  const findImagesInContent = (content: string): string[] => {
    const regex = /!\[.*?\]\((.*?)\)/g; // Regular expression to match Markdown image syntax
    const matches = content.match(regex) || [];
    return matches.map((match) => match.replace(/!\[.*?\]\((.*?)\)/, "$1"));
  };

  const handleCardClick = async (post: any) => {
    const images = findImagesInContent(post.body);
    setSelectedPost(post);
    const comments = await fetchComments(post.author, post.permlink);
    setComments(comments);
    setPostUrl(post.url);
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
      ${cardHoverStyles}/* Apply hover styles when hovering over the card */
    }
  `;

  const handleVoteClick = async (post: any) => {
    if (!isLoggedIn()) {
      setErrorMessage("You have to login first ! Dãããã... ");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const username = user?.name || "";
      let weight = 10000;

      if (isVoted(post)) {
        weight = 0;
      }

      await voteOnContent(username, post.permlink, post.author, weight);

      setIsLoadingInitial(true);
      setLoadedPosts([]);
      setDisplayedPosts(20);
      setTimeout(() => {
        fetchInitialPosts();
      }, 3000);
    } catch (error) {
      console.error("Error while voting:", error);
      setErrorMessage(
        "Error While Voting! May be you already voted with the same weight. Try refreshing the page!"
      );

      setIsErrorModalOpen(true);
    }
  };

  const isVoted = (post: any) => {
    // check for user in active_votes
    const userVote = post.active_votes.find(
      (vote: any) => vote.voter === user?.name
    );
    const percentage = parseInt(userVote?.percent);

    if (userVote && (percentage > 0 || percentage < 0)) {
      return true;
    }

    return false;
  };

  const getUserVote = (post: any) => {
    // check for user in active_votes
    const userVote = post.active_votes.find(
      (vote: any) => vote.voter === user?.name
    );
    const percentage = parseInt(userVote?.percent);

    if (userVote && (percentage > 0 || percentage < 0)) {
      const vote = {
        isVoted: true,
        rshares: userVote.rshares,
        percent: percentage,
      };

      return vote;
    }

    return {
      isVoted: false,
      rshares: 0,
      percent: 0,
    };
  };

  const getVotedProperties = (post: any) => {
    // If the post has been voted on, return the voted properties
    if (isVoted(post)) {
      return {
        width: "10px",
        background: "linear-gradient(180deg, darkgreen, black)", // Change the background color
        color: "limegreen", // Change the text color

      };
    }

    // If the post has not been voted on, return an empty object
    return {
      width: "10px",
      color: "white",
      border: "1px solid white",
    };
  };

  const getVotedHoverProperties = (post: any) => {
    // If the post has been voted on, return the voted properties
    if (isVoted(post)) {
      // red hover
      return {
        backgroundColor: "black", // Change the color on hover
        color: "mediumspringgreen", // Change the text color on hover


      };
    }

    // If the post has not been voted on, return normal hover properties
    return {
      backgroundColor: "mediumspringgreen", // Change the color on hover
      color: "black", // Change the text color on hover
      boxShadow:
        "0 0 8px darkgoldenrod, 0 0 8px darkgoldenrod, 0 0 8px darkgoldenrod", // Add an underglow effect
      border: "2px solid darkgreen",
    };
  };

  return (
    <Box marginTop={"0"} padding={"8px"}>
      {isLoadingInitial ? (
        <PlaceholderLoadingBar />
      ) : (
        <>
          <ErrorModal
            isOpen={isErrorModalOpen}
            onClose={() => setIsErrorModalOpen(false)}
            errorMessage={errorMessage}
          />



          <Box display="flex" justifyContent="right" marginRight={"20px"} marginBottom={'5px'}>
            <ButtonGroup size="sm" isAttached variant="outline" colorScheme="green">
              <Button
                onClick={() => setQueryType("created")}
                isActive={queryType === "created"}
              >
                Most Recent
              </Button>
              <Button
                onClick={() => setQueryType("trending")}
                isActive={queryType === "trending"}
              >
                Trending
              </Button>
            </ButtonGroup>
          </Box>


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
                  backgroundSize: "100% auto",
                  backgroundPosition: "center top",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <CardHeader>
                  <Flex
                    css={cardStyles} /* Apply the cardStyles CSS */
                    borderRadius="10px"
                    justifyContent="center" /* Center the content horizontally */
                    alignItems="center"
                    position="relative"
                    marginTop={"20px"}
                  >
                    <Heading color="white" fontSize="28px" style={{ textShadow: "0 0 20px rgba(0, 255, 0, 0.7)" }}>
                      {post.author}
                    </Heading>

                    {post.app === "Skatehive App" || post.app === "skatehive" ?
                      <Box position="absolute" right="0" display="flex" alignItems="center" paddingRight={"10px"}>
                        <Tooltip label="This post was created with the Skatehive app. This guys knows stuff" placement="right-start" bg={"black"} borderRadius={'10px'} border={'1px dashed gold'}>
                          <Box display="inline-flex" alignItems="center">
                            <IoDiamond size={'30px'} color="black" style={{ filter: 'drop-shadow(0 0 1px gold) drop-shadow(0 0 1px gold)' }} />
                          </Box>
                        </Tooltip>
                      </Box>
                      : null}
                  </Flex>
                </CardHeader>


                <Box padding="20px" marginBottom={"10px"} height="200px">
                  <Image
                    key={post.id}
                    objectFit={"cover"}
                    border="1px solid #134a2f"
                    borderRadius="10px"
                    src={post.thumbnail || defaultThumbnail}
                    alt="Post Thumbnail"
                    height="100%"
                    minH={"200px"}
                    width="100%"
                    bg={"black"}
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      e.currentTarget.src = defaultThumbnail; // Replace with the default thumbnail on error
                    }}
                  />
                </Box>
                <CardBody>
                  <Box //the box around the blogpost title
                    //border="1px solid limegreen"
                    borderRadius="0px"
                    minWidth="100%"
                    minHeight="100%"
                    style={{
                      //style of the speech bubble
                      // backgroundImage: `url('https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23tGLtmE5K6ovFdVS4tYwA5yfJ4S3vnByzcg7BshwvCN1r5Jbmz8NmNm9CUKBm91FVFqT.png')`,
                      backgroundSize: "100% 100%", // stretches the speech bubble as big as the div and dynamically changes
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      marginBottom: "-40px", // makes the speech bubble extend beyond the div
                      paddingBottom: "30px", // for some reason it needs this part too?
                    }}
                  >
                    <Text
                      fontWeight="semibold"
                      color="grey"
                      paddingLeft="5px"
                      paddingTop="10px"
                      paddingRight="5px"
                      textAlign="center" // Center horizontally
                      display="flex" // Use flexbox to center vertically
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
                            ? `url('/assets/money.gif')`
                            : "none",
                    backgroundSize: "100% auto",
                    backgroundPosition: "center bottom",
                    backgroundRepeat: "no-repeat",
                    overflow: "hidden",
                    borderRadius: "10px",
                  }}
                >
                  <Text
                    color="white"
                    marginTop="2px"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Link to={`profile/${post.author}`}>
                      <Avatar
                        border="0px solid limegreen"
                        borderRadius="10px"
                        src={`https://images.ecency.com/webp/u/${post.author}/avatar/small`}
                        boxSize={"60px"}

                      />
                    </Link>

                    <Tooltip
                      color={"white"}
                      backgroundColor={"black"}
                      border={"1px dashed limegreen"}
                      label={
                        <div style={{ color: "limegreen" }}>
                          45% - 🛹 Author + Benef. <br /> 50% - 🧡 Voters <br />{" "}
                          5% - 🏦 Treasury* <br />
                          <br /> Click to Learn More{" "}
                        </div>
                      }
                      aria-label="View Voters"
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
                        style={{

                          fontSize: `${Math.min(
                            46,
                            13 + post.earnings * 1.2
                          )}px`,
                          textShadow: "2px 2px 1px rgba(0, 0, 0, 1)",
                          transition: "background-color 0.3s ease-in-out", // Add a transition for a smoother effect
                        }}
                        _hover={{
                          backgroundColor: "transparent", // Set the background color to transparent on hover
                        }}
                      >
                        <span
                          style={{ color: "" }}
                        >
                          $
                        </span>
                        {post.earnings.toFixed(2)}

                        {/* <img //spinning stoken coin
                          src="https://i.ibb.co/16vCTVT/coin-mental-33px.gif"
                          alt="spinning stoken coin"
                          style={{
                            // Dynamically set the size based on earnings
                            width: `${Math.min(
                              250,
                              18 + post.earnings * 0.6
                            )}px`,
                            height: `${Math.min(
                              250,
                              18 + post.earnings * 0.6
                            )}px`,
                            marginLeft: "7px",
                            marginBottom: "2px",
                          }}
                        /> */}
                      </Button>
                    </Tooltip>
                  </Text>

                  <Box marginLeft="auto">
                    <Tooltip
                      backgroundColor={"black"}
                      border={"1px dashed limegreen"}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img src="https://cdn.discordapp.com/emojis/1060351346416554136.gif?size=240&quality=lossless" alt="Image Alt Text" style={{ width: '20px', marginRight: '5px' }} />
                          <div style={{ color: "orange" }}>Stoke!</div>
                        </div>
                      }
                      aria-label="View Voters"

                    >
                      <IconButton
                        icon={<MdArrowUpward />}
                        backgroundColor="black"
                        color="white"
                        size="sm"
                        borderRadius="40%"
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
            <Button
              variant="outline"
              colorScheme="green"
              onClick={loadMorePosts}
            >
              Load More
            </Button>
          </Box>
          {isLoadingMore && <PlaceholderLoadingBar />}
        </>
      )
      }
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
            json_metadata={selectedPost?.json_metadata}
            images={selectedPost?.images}
            thumbnail={selectedPost?.thumbnail}
            createdAt={selectedPost?.created}
          />
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isVotersModalOpen}
        onClose={() => setVotersModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <EarningsModal
            isOpen={isVotersModalOpen}
            onClose={() => setVotersModalOpen(false)}
            post={selectedPostForModal}
          />
        </ModalContent>
      </Modal>
    </Box >
  );
};

export default HiveBlog;
