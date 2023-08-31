import React, { useEffect, useState } from 'react';
import { Flex, Box, VStack, Image, useMediaQuery } from '@chakra-ui/react';
import { Client } from '@hiveio/dhive';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from './MarkdownRenderers';
import { MarkdownRenderersComments } from './MarkdownRenderersComments';
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

    const containerStyle = {
        width: '100%', // Occupy the full available width
        margin: 0, 
        padding: '20px',
    };
    
    const boxStyle = {
        border: '2px solid orange',
        padding: '10px',
        borderRadius: '10px',
        width: '100%', // Occupy the full available width
    };
    const boxStyleMobile = {
        border: '1px solid orange',
        borderRadius: '10px',
        width: '100%', // Occupy the full available width
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

    // Use Chakra-UI's useMediaQuery hook to detect screen size
    const [isDesktop] = useMediaQuery("(min-width: 768px)");

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>{post?.title}</h1>
            <br></br>
            <Flex direction={isDesktop ? "row" : "column"}>
                <Box style={{ ...boxStyle, margin: isDesktop ? '20px' : '0' }}>
                    <ReactMarkdown
                        children={post?.body}
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownRenderers}
                    />
                </Box>
                <Box style={boxStyle}>
                    <VStack>
                        <h2 style={commentTitleStyle}>Comments</h2>
                        {comments.map((comment, index) => (
                            <div key={index} style={boxStyle}>
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
                            </div>
                        ))}
                    </VStack>
                    <CommentBox 
                        user=""
                        parentAuthor={URLAuthor}
                        parentPermlink={URLPermlink}
                        onCommentPosted={() => setCommentsUpdated(true)}
                    />
                </Box>
            </Flex>
        </div>
    );
};

export default PostPage;
