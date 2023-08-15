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

  import PostModal from "./postModal";

  import { useNavigate } from "react-router-dom";



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
  const placeholderEarnings = 69.42; // Replace with actual placeholder value


  const PlaceholderLoadingBar = () => {
    // Placeholder LoadingBar component, you can replace this with your actual LoadingBar
    return <center>
        <Image src="https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif"></Image>
      <Text>Roll a Joint...</Text>
      </center>;
  };

  interface HiveBlogProps {
    tag?: string;
    queryType?: any;
  }

  const HiveBlog: React.FC<HiveBlogProps> = ({ queryType = "created",tag = "hive-173115" }) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [currentTag, setTag] = useState(tag);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [client, setClient] = useState(new Client(nodes[0]));
    const [nodeIndex, setNodeIndex] = useState(0);

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

    const handlePostClick = (post: any) => {
      setSelectedPost(post);
      console.log(post.body);
      console.log(post);
      onOpen(); // Open the modal
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

    const handleUploadClick = () => {
      navigate("/upload"); // Navigate to the upload page
    };
    return (
      
      <Box>
                <Flex justifyContent="center">
      <Button
        border={"1px solid limegreen"}
        padding="20px"
        alignSelf={"center"}
        marginBottom="20px" // Add space to the bottom
        onClick={handleUploadClick} // Handle the button click to navigate
      >
        Upload Something, lazy ass
      </Button>         
       </Flex>
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
          <PostModal
            title={selectedPost?.title}
            content={selectedPost?.body}
            author={selectedPost?.author}
            user={selectedPost?.user} // replace with actual value
            permlink={selectedPost?.permlink} // replace with actual value
            weight={selectedPost?.weight} // replace with actual value
            onClose={onClose}
            isOpen={isOpen}
          />
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
                cursor="pointer"
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
                  {/* Set the fixed height for thumbnails */}
                  
                  <Image
                    objectFit="cover"
                    border="1px solid limegreen"
                    borderRadius="10px"
                    src={post.thumbnail}
                    alt="Post Thumbnail"
                    height="100%" // Make the image fill the container height
                    width="100%" // Ensure the image maintains its aspect ratio
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
                  <Text color="white">Earning: ${post.earnings.toFixed(2)}</Text>
                </CardFooter>

              </Card>
            ))}
          </Box>
        )}
      </Box>
    );

  };

  export default HiveBlog;
