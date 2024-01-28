import React, { useEffect, useRef, useState } from 'react';
import {
  Flex,
  Box,
  VStack,
  Image,
  useMediaQuery,
  Button,
  Textarea,
  Spinner,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Client } from '@hiveio/dhive';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from 'lib/pages/utils/MarkdownRenderers';
import { CommentProps } from '../Feed/types';
import { CSSProperties } from 'react';
import { FaRedo } from 'react-icons/fa';
import useAuthUser from '../api/useAuthUser';

type User = {
  name: string;
} | null;

const Chat: React.FC = () => {
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const URLAuthor = "skatehacker";
  const URLPermlink = "test-advance-mode-post";

  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [commentsUpdated, setCommentsUpdated] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const user = useAuthUser();

  const client = new Client('https://api.hive.blog');

  const [loadedCommentsCount, setLoadedCommentsCount] = useState(10);

  const fetchComments = async () => {
    try {
      const allComments: CommentProps[] = await client.database.call("get_content_replies", [URLAuthor, URLPermlink]);
      const displayedComments = allComments.slice(-loadedCommentsCount);
      setComments(displayedComments.reverse());
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    const client = new Client('https://api.hive.blog');

    const fetchPostData = async () => {
      try {
        const postData = await client.database.call("get_content", [URLAuthor, URLPermlink]);
        setPost({ ...postData });
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    fetchPostData();
    fetchComments();
  }, [URLAuthor, URLPermlink, commentsUpdated]);

  useEffect(() => {
    if (isChatVisible) {
      const intervalId = setInterval(fetchComments, 5000);
      setPollingInterval(intervalId);
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isChatVisible]);

  const commentTitleStyle = {
    fontWeight: 'bold',
    color: 'yellow',
    fontSize: '20px',
    paddingLeft: '10px',
  };

  const handlePostComment = () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!");
      return;
    }

    if (!username) {
      console.error("Username is missing");
      return;
    }

    const permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    let parentAuthor = '';
    let parentPermlink = '';

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
      ["comment",
        {
          "parent_author": parentAuthor,
          "parent_permlink": parentPermlink,
          "author": username,
          "permlink": permlink,
          "title": "",
          "body": commentContent,
          "json_metadata": JSON.stringify({ tags: ["skateboard"], app: "skatehive" })
        }
      ]
    ];

    setIsPostingComment(true);

    window.hive_keychain.requestBroadcast(username, operations, "posting", async (response: any) => {
      try {
        if (response.success) {
          setCommentContent('');
          fetchComments();
        } else {
          console.error("Error posting comment:", response.message);
        }
      } catch (error) {
        console.error("Error handling post comment response:", error);
      } finally {
        setIsPostingComment(false);
      }
    });
  };

  const [isDesktop] = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setUsername(user?.user?.name || null);
  }, [user]);

  const commentCardStyle = {
    border: '1px solid teal',
    borderRadius: '10px',
    padding: '10px',
    margin: '3px',
    maxWidth: '100%',

    '@media (min-width: 768px)': {
      width: '100px',
    },
  };

  const [isSmallScreen] = useMediaQuery("(max-width: 600px)");

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: '40px',
    right: '20px',
    maxHeight: '100%',
    width: isSmallScreen ? '90%' : '40%',
    overflowY: 'auto',
    border: '1px solid white',
    borderRadius: '10px',
    padding: '10px',
    background: 'black',
    zIndex: 1000,
  };

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        setIsChatVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userFromSession = sessionStorage.getItem("user");
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };
  const chatToggleButtonStyle: CSSProperties = {
    position: 'fixed',
    bottom: '30px',
    right: isSmallScreen ? '5px' : '20px',
    backgroundColor: 'black',
    border: '1px solid limegreen',
    zIndex: 2000,
    borderRadius: '100%',
  };

  return (
    <>
      <Button style={chatToggleButtonStyle} onClick={toggleChat}>
        {isChatVisible ? '' : <img style={{ width: '50px', height: '50px', borderRadius: '100%' }} src='https://gifdb.com/images/high/pepe-frog-meme-reading-text-nervous-sweat-3m7pw9rg9d3fyf5f.gif' alt='Chat Icon'></img>}
      </Button>

      {isChatVisible && (
        <div ref={chatContainerRef} style={containerStyle}>

          <div style={{ padding: '0px', borderBottom: '1px solid white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img onClick={fetchComments} style={{ cursor: 'pointer', width: '30px', height: 'auto', borderRadius: '100%' }} src='https://gifdb.com/images/high/pepe-frog-meme-reading-text-nervous-sweat-3m7pw9rg9d3fyf5f.gif' alt='Chat Icon' />
              <p style={commentTitleStyle}>What is happening in Plaza? </p>
            </div>

            <FaRedo onClick={fetchComments} style={{ cursor: 'pointer' }} />

          </div>

          <div style={{ borderRadius: '10px', overflowY: 'auto', maxHeight: 'calc(500px - 100px)' }}>
            {isLoadingComments ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                Loading comments...
              </div>
            ) : (
              <Flex border="1px solid white" borderRadius="10px" padding="10px" direction="column" style={{ width: '100%' }}>
                {comments.map((comment) => (
                  <div key={comment.id} style={{ marginBottom: '10px' }}>
                    <Flex alignItems="center" justifyContent="start" bg="black" paddingLeft="10px">
                      <Image
                        src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                        alt={`${comment.author}'s avatar`}
                        boxSize="20px"
                        borderRadius="50%"
                        marginRight="8px"
                      />
                      <span>{comment.author}</span>
                    </Flex>

                    <Box style={commentCardStyle}>
                      <VStack align="end">
                        <ReactMarkdown
                          children={comment.body}
                          rehypePlugins={[rehypeRaw]}
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownRenderers}
                        />
                      </VStack>

                      <Flex justifyContent="flex-end" mt="4">
                        <Button
                          onClick={() => setParentId(comment.id)}
                          style={{
                            border: "1px solid limegreen",
                            backgroundColor: "black",
                            fontSize: '10px',
                            padding: '0px 0px',
                            maxHeight: '15px'
                          }}
                        >
                          Like❤️
                        </Button>
                      </Flex>
                    </Box>
                  </div>
                ))}
              </Flex>
            )}
          </div>

          <div style={{ borderTop: '1px solid white', padding: '10px' }}>
            <Button
              style={{
                backgroundColor: "transparent",
                fontSize: '15px',
                maxHeight: '15px',
                color: 'white',
              }}
              onClick={() => {
                setLoadedCommentsCount(prevCount => prevCount + 5);
                fetchComments();
              }}
            >
              + Load More
            </Button>
            <Flex direction={isDesktop ? "row" : "column"} style={{ width: "100%" }}>
              <Box width="100%" border="1px solid white" borderRadius="10px" padding="10px" margin="3px">
                {parentId && (
                  <div style={{ marginBottom: '5px' }}>
                    Replying to {comments.find((comment) => comment.id === parentId)?.author}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Textarea
                    border="1px solid white"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write anything that comes to your crooked mind..."
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                    <Button
                      fontSize="10px"
                      padding="3px 6px"
                      height="20px"
                      border="1px solid red"
                      onClick={handlePostComment}
                      disabled={isPostingComment}
                    >
                      {isPostingComment ? (
                        <Spinner size="sm" />
                      ) : (
                        "🗣 Speak up !"
                      )}
                    </Button>
                  </div>
                </div>
              </Box>
            </Flex>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
