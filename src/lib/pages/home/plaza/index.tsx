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
  Link,
} from "@chakra-ui/react";
import { Client } from "@hiveio/dhive";
import MDEditor from "@uiw/react-md-editor";
import { MarkdownRenderers } from "lib/pages/utils/MarkdownRenderers";
import moment from "moment";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { FaImage, FaVideo } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CommentProps } from "../Feed/types";
import useAuthUser from "../api/useAuthUser";
import voteOnContent from "../api/voting";
import HiveClient from "lib/pages/utils/hiveClient";
type User = {
  name: string;
} | null;

const Plaza: React.FC = () => {
  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const URLAuthor = "skatehacker";
  const URLPermlink = "test-advance-mode-post";
  // for testing purposes
  // const URLPermlink = "testing-skatehive-ipfs-gateway"
  const client = HiveClient;
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [payout, setPayout] = useState(0);
  const user = useAuthUser();
  const metadata = JSON.parse(user.user?.json_metadata || "{}");
  const [isUploading, setIsUploading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [loadedCommentsCount, setLoadedCommentsCount] = useState(15);
  const [localNetVotes, setNetVotes] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);


  const fetchComments = async () => {
    try {
      const allComments: CommentProps[] = await client.database.call(
        "get_content_replies",
        [URLAuthor, URLPermlink]
      );
      setComments(allComments.reverse());
      console.log(allComments)

      setIsLoadingComments(false);


      return allComments;



    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchPostData = async () => {

    try {
      const postData = await client.database.call("get_content", [
        URLAuthor,
        URLPermlink,
      ]);
      console.log(postData)
      setPost({ ...postData });
    } catch (error) {
      console.error("Error fetching post data:", error);
    }
  };

  useEffect(() => {
    fetchPostData();
    fetchComments();
  }
    , []);
  const getCommentsArray = (comments: any, author: string, permlink: string): CommentProps[] => {
    const originalPostKey = `${URLAuthor}/${URLPermlink}`;
    for (const commentKey in comments) {
      const comment = comments[commentKey];
      const subComments = comment.replies;

      // add a repliesFetched property to the comment
      comments[commentKey].repliesFetched = [];

      // add the sub comments to the repliesFetched property of this comment
      for (let i = 0; i < subComments.length; i++) {
        const subComment = subComments[i];
        if (subComment && subComment in comments) {
          const subCommentObject = comments[subComment];
          comments[commentKey].repliesFetched.push(subCommentObject);
        }
      }



      // set net_votes of the comment with active_votes.length
      comments[commentKey].net_votes =
        comments[commentKey].active_votes.length;
    }

    const commentsArray: CommentProps[] = [];

    // add the comments to the commentsArray
    for (const commentKey in comments) {
      const comment = comments[commentKey];

      // push the comment to the comments array only if it's a reply to the original post
      if (
        comment.parent_author === author &&
        comment.parent_permlink === permlink
      ) {
        commentsArray.push(comments[commentKey]);
      }
    }
    console.log("ARRAYC:", commentsArray)
    return commentsArray;
  };

  useEffect(() => {
    getCommentsArray(comments, URLAuthor, URLPermlink);

  }
    , [comments]);

  const handlePostComment = async () => {
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
    const beneficiaries = [
      { account: 'steemskate', weight: 3000 },
      { account: 'xvlad', weight: 2000 },
    ];

    const extensions = [
      [0, {
        beneficiaries: beneficiaries,
      }],
    ];

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

    let postCreationTimestamp = moment.utc().unix();

    window.hive_keychain.requestBroadcast(
      username,
      operations,
      "posting",
      async (response: any) => {
        await loadUpdatedComments(username, postCreationTimestamp);
      }
    );
  };
  const loadUpdatedComments = async (
    username: string,
    postCreationTimestamp: number
  ) => {
    const maxAttempts = commentContent && commentContent !== "" ? 10 : 0;
    let attempts = 0;

    while (true) {
      let data = await fetchComments();
      if (!data) throw new Error("No comments");

      const lastPostDate = moment.utc((data[0] as any).last_update).unix();
      if (
        (username === data[0].author && lastPostDate > postCreationTimestamp) ||
        attempts === maxAttempts
      )
        break;

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
    }

    chatContainerRef.current?.scrollTo(0, 0);
    setCommentContent("");
    setIsPostingComment(false);
    setIsUploading(false);
  };

  useEffect(() => {
    setUsername(user?.user?.name || null);
  }, [user]);

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



  const uploadFileToIPFS = async (file: File): Promise<void> => {
    try {
      setIsUploading(true);

      // Check if it's an MP4 video
      if (file.type.startsWith("video") && !file.type.includes("mp4")) {
        alert("Invalid video format. Please upload a .mp4 file.");
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.set("Content-Type", "multipart/form-data");

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            "pinata_api_key": process.env.PINATA_API_KEY,
            "pinata_secret_api_key": process.env.PINATA_API_SECRET,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;

        // Handle images
        if (file.type.startsWith("image")) {
          const imageMarkdown = `![](${ipfsUrl}) `;
          setCommentContent((prevContent) => prevContent + `\n${imageMarkdown}` + '\n');
        }
        // Handle videos
        else if (file.type.startsWith("video")) {
          const videoElement = `<video controls muted loop><source src="${ipfsUrl}" type="${file.type}"></video> `;
          setCommentContent((prevContent) => prevContent + `\n${videoElement}` + '\n');
        }

        // Set the file URL in the state
        setUploadedVideoUrl(ipfsUrl);

        console.log(`Uploaded ${file.type} file to Pinata IPFS:`, ipfsUrl);
      } else {
        const errorData = await response.json();
        console.error(`Error uploading ${file.type} file to Pinata IPFS:`, errorData);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Center>
      <Box ref={containerRef} style={{ borderRadius: "10px", overflowY: "auto", maxWidth: isMobile ? "100%" : "60%" }}>
        <Flex flexDirection="column" justifyContent="space-between">
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
              border: "1px solid limegreen",
              padding: "10px",
              backgroundColor: "navy",
            }}
          />
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "5px",
            }}
          >
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
              <HStack>
                {isUploading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FaImage style={{ marginRight: "5px" }} />
                    <Text color={"black"}> | </Text>
                    <FaVideo style={{ marginRight: "5px" }} />
                  </>
                )}
              </HStack>
              <input
                id="fileInput"
                type="file"
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    uploadFileToIPFS(file);
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
          {commentContent.length > 1 && (
            <Box
              style={{ border: '2px dashed limegreen', borderRadius: '5px', padding: '10px' }}
            >
              <Badge>Draft</Badge>
              <ReactMarkdown
                children={commentContent}
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={MarkdownRenderers}
              />
            </Box>
          )}

        </Flex>

        {isLoadingComments ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            Loading GMs...
          </Box>
        ) : (
          <Flex
            borderRadius="10px"
            padding="5px"
            direction="column"
            overflow="auto"
            style={{ width: "100%" }}
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
                          marginBottom={"10px"}
                        >
                          <Link href={`/profile/${comment.author}`}>
                            <Image
                              src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                              alt={`${comment.author}'s avatar`}
                              boxSize="40px"
                              borderRadius="50%"
                              margin="5px"
                            />
                          </Link>

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
                          leftIcon={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <img src="https://cdn.discordapp.com/emojis/1060351346416554136.gif?size=240&quality=lossless" alt="Image Alt Text" style={{ width: '20px', marginRight: '5px' }} />
                              <div style={{ color: "orange" }}>                          Fuck Yeah!</div>
                            </div>
                          }
                          style={{
                            border: "1px solid limegreen",
                            backgroundColor: "black",
                            fontSize: "12px",
                            color: "limegreen",
                            padding: "3px 6px",
                            marginLeft: "8px",
                          }}
                        >
                        </Button>
                      </Flex>
                    </Box>
                  </Box>
                ))}
            </InfiniteScroll>
          </Flex>
        )}
      </Box>
    </Center>
  );
};

export default Plaza;
