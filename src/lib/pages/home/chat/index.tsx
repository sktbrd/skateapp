import React, { useEffect, useState } from 'react';
import {
  Flex,
  Box,
  VStack,
  Image,
  useMediaQuery,
  Button,
  Textarea,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Client } from '@hiveio/dhive';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from './MarkdownRenderers';
import { MarkdownRenderersComments } from './MarkdownRenderersComments';
import CommentBox from '../magazine/postModal/commentBox';
import { CommentProps } from '../magazine/types';
import ContentRenderer from './CustomRenderers';
type User = {
  name: string;
  // ... other properties ...
} | null;


const Chat: React.FC = () => {
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const URLTag = parts[2];
  const URLAuthor = "skatehacker";
  const URLPermlink = "test-advance-mode-post";

  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [commentsUpdated, setCommentsUpdated] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    const client = new Client('https://api.hive.blog');

    const fetchPostData = async () => {
      try {
        const postData = await client.database.call("get_content", [URLAuthor, URLPermlink]);
        setPost({ ...postData});
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsData: CommentProps[] = await client.database.call("get_content_replies", [URLAuthor, URLPermlink]);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchPostData();
    fetchComments();
  }, [URLAuthor, URLPermlink, commentsUpdated]);

  const containerStyle = {
    width: '100%',
    margin: 0,
    padding: '10px',
    marginTop: '-30px',
  };

  const titleStyle = {
    fontWeight: 'bold',
    color: 'yellow',
    fontSize: '26px',
    padding: '10px',
    border: '1px solid limegreen',
    borderRadius: '10px',
  };

  const commentTitleStyle = {
    fontWeight: 'bold',
    color: 'yellow',
    fontSize: '20px',
    paddingBottom: '8px',
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

    const operations = [
      ["comment",
        {
          "parent_author": URLAuthor,
          "parent_permlink": URLPermlink,
          "author": username,
          "permlink": permlink,
          "title": "",
          "body": commentContent,
          "json_metadata": JSON.stringify({ tags: ["skateboard"], app: "pepeskate" })
        }
      ]
    ];

    window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
      if (response.success) {
        alert("Comment successfully posted!");
        setCommentContent(''); // Clear the comment box
        setCommentsUpdated(true); // Force re-render of Comments component
        window.location.reload();
      } else {
        console.error("Error posting comment:", response.message);
      }
    });
  };

  const [isDesktop] = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const userObject = JSON.parse(storedUser);
      const storedUsername = userObject.name;
      setUsername(storedUsername);
      console.log('username:', storedUsername);
      console.log(post);
    }
  }, []);

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

  const contentBoxStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '10px',
    border: '2px solid orange',
    borderRadius: '10px',
  };

  const userFromSession = sessionStorage.getItem("user");
  const user: User = userFromSession ? JSON.parse(userFromSession) : null;

  return (
    <div style={containerStyle}>
                <Flex direction="column" style={{ width: '100%' }}>
            <center>
              <h1 style={commentTitleStyle}>SkateHive Chat</h1>
            </center>
            {comments.map((comment, index) => (
              <div key={index}>
                <Box
                  style={{
                    ...commentCardStyle,
                    width: '100%',
                  }}
                >
                  <Flex justifyContent="space-between">
                  <Flex  alignItems="center">
                    <Image
                      src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                      alt={`${comment.author}'s avatar`}
                      boxSize="40px"
                      borderRadius="50%"
                      marginRight="8px"
                    />
                    <h1>{comment.author}</h1>

                  </Flex>
                  <Flex>

                  <ReactMarkdown
                    children={comment.body}
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownRenderersComments}
                  />
                  </Flex>
                  </Flex>
                </Box>
              </div>
            ))}
          </Flex>
          <Flex direction={isDesktop ? "row" : "column"} style={{ marginTop: 10, width: "100%" }}>
  <VStack
    style={{
      ...contentBoxStyle,
      width: "100%", // Set the width to 100%
      margin: '0 auto',
      padding: '10px',
      border: '1px solid orange',
      borderRadius: '10px',
    }}
  >
    <center>
      <h1 style={commentTitleStyle}>Say something about it 💬</h1>
    </center>
    <Box width="100%" border="1px solid white" borderRadius="10px" padding="10px" margin="3px">
      <Textarea
        border="1px solid white"
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="Write the first thing that comes to your wasted head..."
      />
      <Button border="1px solid white" mt="10px" onClick={handlePostComment}>
        Submit Comment
      </Button>
    </Box>
  </VStack>
</Flex>

      <Flex>
        <Link to="/">
          <Button variant="outline" colorScheme="blue" size="sm" marginBottom="10px">
            Go Back
          </Button>
        </Link>
      </Flex>
    </div>
  );
};

export default Chat;
