import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Image,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { Client } from "@hiveio/dhive";
import MDEditor from "@uiw/react-md-editor";
import { MarkdownRenderers } from "lib/pages/utils/MarkdownRenderers";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { FaImage } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CommentProps } from "../Feed/types";
import useAuthUser from "../api/useAuthUser";
import voteOnContent from "../api/voting";

type User = {
  name: string;
} | null;

const Plaza: React.FC = () => {
  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const URLAuthor = "skatehacker";
  const URLPermlink = "test-advance-mode-post";

  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [commentsUpdated, setCommentsUpdated] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [payout, setPayout] = useState(0);
  const user = useAuthUser();
  const metadata = JSON.parse(user.user?.json_metadata || "{}");
  const client = new Client("https://api.hive.blog");
  const [isUploading, setIsUploading] = useState(false); // New state for tracking upload loading
  const [showSplash, setShowSplash] = useState(true);

  const [loadedCommentsCount, setLoadedCommentsCount] = useState(15);
  const [localNetVotes, setNetVotes] = useState(0);

  useEffect(() => {
    console.log(loadedCommentsCount);
  }, [loadedCommentsCount]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const allComments: CommentProps[] = await client.database.call(
        "get_content_replies",
        [URLAuthor, URLPermlink]
      );
      setComments(allComments.reverse());
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchPostData = async () => {
    const client = new Client("https://api.hive.blog");

    try {
      const postData = await client.database.call("get_content", [
        URLAuthor,
        URLPermlink,
      ]);
      setPost({ ...postData });
    } catch (error) {
      console.error("Error fetching post data:", error);
    }
  };

  useEffect(() => {
    fetchPostData();
    fetchComments();
    setShowSplash(false);
  }, []);

  const handlePostComment = () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!");
      return;
    }
    if (!username) {
      console.error("Username is missing");
      return;
    }
    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    let parentAuthor = "";
    let parentPermlink = "";

    if (parentId) {
      const parentComment = comments.find((comment) => comment.id === parentId);
      if (parentComment) {
        parentAuthor = parentComment.author;
        parentPermlink = parentComment.permlink;
      }
    } else {
      parentAuthor = URLAuthor;
      parentPermlink = URLPermlink;
    }

    const operations = [
      [
        "comment",
        {
          parent_author: parentAuthor,
          parent_permlink: parentPermlink,
          author: username,
          permlink: permlink,
          title: "",
          body: commentContent,
          json_metadata: JSON.stringify({
            tags: ["skateboard"],
            app: "skatehive",
          }),
        },
      ],
    ];

    setIsPostingComment(true);

    window.hive_keychain.requestBroadcast(
      username,
      operations,
      "posting",
      async (response: any) => {
        // Show the splash screen
        setShowSplash(true);

        // Set a timeout to hide the splash screen after 5 seconds
        setTimeout(() => {
          setShowSplash(false);
        }, 5000);
        fetchComments();
        setCommentContent("");
      }
    );

    setIsPostingComment(false);
  };

  useEffect(() => {
    setUsername(user?.user?.name || null);
  }, [user]);

  const containerStyle: CSSProperties = {
    position: "fixed",
    bottom: "40px",
    right: "20px",
    width: "60%",
    overflowY: "auto",
    borderRadius: "10px",
    padding: "10px",
    zIndex: 1000,
  };

  const postContainerStyle: CSSProperties = {
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid gray",
  };

  const isMobile = window.innerWidth < 768;

  const handleVote = async (comment: CommentProps) => {
    if (!user || !user?.user?.name) {
      console.error("Username is missing");
      return;
    }

    try {
      await voteOnContent(
        user.user.name,
        comment.permlink,
        comment.author,
        10000
      );
    } catch (error: any) {
      console.error("Error voting:", error);
    }
  };

  const uploadFileToIPFS = async (file: File): Promise<string | null> => {
    try {
      const PINATA_API_KEY = process.env.PINATA_API_KEY;
      const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
      setIsUploading(true); // Set loading state to true when starting the upload

      if (file.type.startsWith("video/mp4") || file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("file", file);
        formData.set("Content-Type", "multipart/form-data");

        const response = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_API_SECRET,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;

          setUploadedImageUrl(ipfsUrl);
          return ipfsUrl;
        } else {
          const errorData = await response.json();
          console.error("Error uploading file to Pinata IPFS:", errorData);
          return null;
        }
      } else {
        alert(
          "Invalid file type. Only video files (MP4) and images are allowed."
        );
        console.error(
          "Invalid file type. Only video files (MP4) and images are allowed."
        );
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    } finally {
      setIsUploading(false); // Set loading state to false after upload completion (success or failure)
    }
  };

  const addImageToMarkdown = async () => {
    if (uploadedImageUrl) {
      setCommentContent(
        (prevContent) => `${prevContent}\n![Image](${uploadedImageUrl})`
      );
    }
  };

  console.log("dataLength", loadedCommentsCount);
  console.log("hasMore", comments.length !== loadedCommentsCount);

  return (
    <Center>
      <Box
        style={{
          maxWidth: isMobile ? "100%" : "60%",
          padding: "0 10px",
          boxSizing: "border-box",
        }}
      >
        {showSplash && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 1001,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
              }}
            >
              <Center>
                <VStack>
                  <Image
                    src={
                      metadata?.profile?.profile_image ||
                      "https://images.ecency.com/webp/u/skatehive/avatar/small"
                    }
                    alt="SkateHive logo"
                    boxSize="100px"
                    borderRadius="50%"
                    margin="5px"
                  />
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    textAlign="center"
                    marginBottom="10px"
                  >
                    After Posting, scroll down to the bottom to see your post,
                    sorry for that!
                  </Text>
                </VStack>
              </Center>
            </div>
          </div>
        )}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Flex alignItems="center" justifyContent="start" paddingLeft="10px">
            <Image
              src={
                metadata?.profile?.profile_image ||
                "https://images.ecency.com/webp/u/skatehive/avatar/small"
              }
              alt={`${URLAuthor}'s avatar`}
              boxSize="40px"
              borderRadius="50%"
              margin="5px"
            />
            <Text>{metadata?.profile?.name || "You"}</Text>
          </Flex>
          <MDEditor
            value={commentContent}
            onChange={(value, event, state) => setCommentContent(value || "")}
            preview="edit"
            height={200}
            style={{
              borderRadius: "5px",
              border: "1px solid #1da1f2",
              padding: "10px",
            }}
          />
          <ReactMarkdown
            children={commentContent}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={MarkdownRenderers}
          />
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "5px",
            }}
          >
            {isUploading && <Spinner size="sm" />}
            <label
              htmlFor="fileInput"
              style={{
                cursor: "pointer",
                display: "inline-block",
                padding: "10px",
                border: "1px solid limegreen",
                borderRadius: "5px",
                backgroundColor: "limegreen",
                color: "white",
              }}
            >
              <FaImage style={{ marginRight: "5px" }} />

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);

                    uploadFileToIPFS(file).then((url) => {
                      if (url) {
                        setUploadedImageUrl(url);
                        addImageToMarkdown(); // Call addImageToMarkdown after setting the uploadedImageUrl
                      }
                    });
                  }
                }}
              />
            </label>

            <Button
              fontSize="14px"
              padding="6px 10px"
              color="limegreen"
              bg={"transparent"}
              border={"1px solid limegreen"}
              onClick={handlePostComment}
              disabled={isPostingComment}
            >
              {isPostingComment ? <Spinner size="sm" /> : "🗣 Say it"}
            </Button>
          </Box>
        </Box>

        <Box
          ref={containerRef}
          style={{
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          {isLoadingComments ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
            >
              Loading comments...
            </Box>
          ) : (
            <Flex
              borderRadius="10px"
              padding="5px"
              direction="column"
              overflow="auto"
              style={{ width: "100%" }}
              id="postsTl"
              height="calc(100vh - 250px)"
            >
              <InfiniteScroll
                dataLength={loadedCommentsCount}
                next={() => setLoadedCommentsCount((val) => val + 15)}
                hasMore={comments.length !== loadedCommentsCount}
                scrollableTarget="postsTl"
                loader={
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="200px"
                  >
                    Loading comments...
                  </Box>
                }
              >
                {comments
                  .slice(0, loadedCommentsCount)
                  .map((comment, index) => (
                    <Box key={comment.id}>
                      <Box style={postContainerStyle}>
                        <HStack justifyContent={"space-between"}>
                          <Flex
                            alignItems="center"
                            justifyContent="start"
                            paddingLeft="10px"
                          >
                            <Image
                              src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                              alt={`${comment.author}'s avatar`}
                              boxSize="40px"
                              borderRadius="50%"
                              margin="5px"
                            />
                            <span>{comment.author}</span>
                          </Flex>

                          <Tooltip
                            label="Yes you can earn $ by tweeting here, make sure you post cool stuff that people will fire up!"
                            aria-label="A tooltip"
                            placement="top"
                            bg={"black"}
                            color={"yellow"}
                            border={"1px dashed yellow"}
                          >
                            <Badge
                              marginBottom={"27px"}
                              colorScheme="yellow"
                              fontSize="sm"
                            >
                              {comment.total_payout_value !== 0
                                ? `${comment.pending_payout_value}`
                                : "0.000 "}
                            </Badge>
                          </Tooltip>
                        </HStack>
                        <Divider />
                        <ReactMarkdown
                          children={comment.body}
                          rehypePlugins={[rehypeRaw]}
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownRenderers}
                        />

                        <Flex justifyContent="flex-end" mt="4">
                          <Button
                            onClick={() => handleVote(comment)}
                            style={{
                              border: "1px solid limegreen",
                              backgroundColor: "black",
                              fontSize: "12px",
                              color: "limegreen",
                              padding: "3px 6px",
                              marginLeft: "8px",
                            }}
                          >
                            Vote 👍
                          </Button>
                        </Flex>
                      </Box>
                    </Box>
                  ))}
              </InfiniteScroll>
            </Flex>
          )}
        </Box>
      </Box>
    </Center>
  );
};

export default Plaza;
