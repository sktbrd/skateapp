import React, { useEffect, useState } from 'react';
import { Flex, Box, VStack, Image, useMediaQuery, Button, Textarea } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Client } from '@hiveio/dhive';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from './MarkdownRenderers';
import { MarkdownRenderersComments } from './MarkdownRenderersComments';
import CommentBox from '../home/magazine/postModal/commentBox'; // Import CommentBox
import { CommentProps } from '../home/magazine/types';

import { transform3SpeakContent } from '../utils/transform3speakvideo';

const PostPage: React.FC = () => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    const URLTag = parts[2];
    const URLAuthor = parts[3].substring(1);
    const URLPermlink = parts[4];

    const [post, setPost] = useState<any | null>(null);
    const [comments, setComments] = useState<CommentProps[]>([]);
    const [commentsUpdated, setCommentsUpdated] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const client = new Client('https://api.hive.blog');

        const fetchPostData = async () => {
            try {
                const postData = await client.database.call("get_content", [URLAuthor, URLPermlink]);
                const transformedBody = await transform3SpeakContent(postData.body);
                setPost({ ...postData, body: transformedBody });
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

        window.hive_keychain.requestBroadcast(username, operations, "posting", (response:any) => {
            if (response.success) {
                alert("Comment successfully posted!");
                setCommentContent(''); // Clear the comment box
                setCommentsUpdated(true); // Force re-render of Comments component
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
            const username = userObject.name;
            setUsername(username);
            console.log('username:', username);
        }
    }, []);

    const commentCardStyle = {
        border: '1px solid blue',
        borderRadius: '10px',
        padding: '10px',
        margin: '3px',
        width: '100%', // Set a default width for the comment cards
    
        // Media queries for responsiveness
        '@media (min-width: 768px)': {
            width: '500px', // Adjust the width as needed for larger screens
        },
    };

    return (
        <div style={containerStyle}>
            <Link to="/">
                <Button
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                    marginBottom="10px"
                >
                    Go Home
                </Button>
            </Link>
            <h1 style={titleStyle}>{post?.title}</h1>
            <Flex direction={isDesktop ? "row" : "column"} style={{ margin: 0 }}>
                <Box border="2px solid limegreen" borderRadius="10px" margin="10px" padding="10px">
                    <ReactMarkdown
                        children={post?.body}
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownRenderers}
                    />
                </Box>
                <VStack>
            <h2 style={commentTitleStyle}>Comments</h2>
            {comments.map((comment, index) => (
                <div key={index}>
                    <Box style={commentCardStyle}> {/* Apply the style here */}
                        <Flex alignItems="center">
                            <Image
                                src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                                alt={`${comment.author}'s avatar`}
                                boxSize="40px"
                                borderRadius="50%"
                                marginRight="8px"
                            />
                            <h1>{comment.author}</h1>
                        </Flex>
                        <ReactMarkdown
                            children={comment.body}
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[remarkGfm]}
                            components={MarkdownRenderersComments}
                        />
                    </Box>
                        </div>
                    ))}
            <Box border="1px solid white" borderRadius="10px" padding="10px" margin="3px">
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

        </div>
    );
};

export default PostPage;
