import React, { useEffect, useState } from 'react';
import { HStack, Flex, Box, VStack } from '@chakra-ui/react';
import { Client } from '@hiveio/dhive';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from '../home/magazine/postModal/MarkdownRenderers';
import CommentBox from '../home/magazine/postModal/commentBox';
import { CommentProps } from '../home/magazine/types';

const PostPage: React.FC = () => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    const URLTag = parts[2];
    const URLAuthor = parts[3].substring(1);
    const URLPermlink = parts[4];

    const [post, setPost] = useState<any | null>(null);
    const [comments, setComments] = useState<CommentProps[]>([]);
    const [commentsUpdated, setCommentsUpdated] = useState(false);

    useEffect(() => {
        const client = new Client('https://api.hive.blog');

        const fetchPostData = async () => {
            try {
                const postData = await client.database.call("get_content", [URLAuthor, URLPermlink]);
                setPost(postData);
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

    const boxStyle = {
        border: '1px solid limegreen',
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '10px',
    };

    const titleStyle = {
        fontWeight: 'bold',
        color: 'yellow',
        fontSize: '26px',
        paddingBottom: '10px',
    };

    const commentTitleStyle = {
        fontWeight: 'bold',
        color: 'yellow',
        fontSize: '20px',
        paddingBottom: '8px',
    };

    return (
      <div>
        <h1 style={titleStyle}>{post?.title}</h1>
        <Flex>
            <HStack>
                <VStack>
                <Box style={boxStyle}>
                    <ReactMarkdown
                        children={post?.body}
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownRenderers}
                    />
                                    </Box>
                </VStack>
                <VStack>
                <Box style={boxStyle}>
                    <h2 style={commentTitleStyle}>Comments</h2>
                    {comments.map((comment, index) => (
                        <div key={index} style={boxStyle}>
                            <p>{comment.author}</p>
                            <p>{comment.body}</p>
                            {/* Add more fields from the CommentProps interface */}
                        </div>
                    ))}
                </Box>
                <CommentBox 
                    user=""
                    parentAuthor={URLAuthor}
                    parentPermlink={URLPermlink}
                    onCommentPosted={() => setCommentsUpdated(true)}
                />
                </VStack>
            </HStack>
        </Flex>
      </div>
    );
};

export default PostPage;
