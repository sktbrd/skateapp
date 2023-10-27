import React, { useEffect, useState } from 'react';
import { Box, Text, Image, Flex, Button, Tooltip } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import useAuthUser from '../../api/useAuthUser';
import voteOnContent from '../../api/voting';

import * as Types from '../types'; 




const Comment: React.FC<Types.CommentProps> = ({ author, body, created, net_votes, permlink }) => {
    const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;
    const { user } = useAuthUser();

    const handleVote = async () => {
        if (!user || !user.name) {
            console.error("Username is missing");
            return;
        }

        try {
            await voteOnContent(user.name, permlink, author, 10000);
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    return (
        <Box border="1px solid white" borderRadius="5px" padding="15px" margin="10px">
            <Flex padding="5px" alignItems="center">
                <Image src={avatarUrl} borderRadius="full" boxSize="40px" mr="3" />
                <Text fontWeight="bold">@{author}</Text>
            </Flex>
            <ReactMarkdown 
        children={body}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ node, alt, src, title, ...props }) => (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img {...props} alt={alt} src={src} title={title} style={{ maxWidth: '100%', height: 'auto', borderRadius:"10px", border:'1px solid limegreen' }} />
            </div>
          ),
          a: ({node, children, ...props}) => <a {...props} style={{ color: 'yellow' }}>{children}</a>,
          p: ({node, children, ...props}) => <p {...props} style={{ color: 'white' }}>{children}</p>,
          h1: ({node, children, ...props}) => <h1 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '24px' }}>{children}</h1>,
          h2: ({node, children, ...props}) => <h2 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '20px' }}>{children}</h2>,
          h3: ({node, children, ...props}) => <h3 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '18px' }}>{children}</h3>,
          blockquote: ({node, children, ...props}) => <blockquote {...props} style={{ borderLeft: '3px solid limegreen', paddingLeft: '10px', fontStyle: 'italic' }}>{children}</blockquote>,
          ol: ({node, children, ...props}) => <ol {...props} style={{ paddingLeft: '20px' }}>{children}</ol>,
          ul: ({node, children, ...props}) => <ul {...props} style={{ paddingLeft: '20px' }}>{children}</ul>,
        }}
      />
            <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="sm">{new Date(created).toLocaleString()}</Text>
                <Button leftIcon={<span>🛹</span>} variant="outline" size="sm" onClick={handleVote}>
                    {net_votes}
                </Button>
            </Flex>
        </Box>
    );
};

const Comments: React.FC<Types.CommentsProps> = ({ comments, commentPosted }) => {
    const [localComments, setLocalComments] = useState<Types.CommentProps[]>(comments);

    useEffect(() => {
        if (commentPosted) {
            // Logic to re-fetch comments when a new one is posted
            // For now, I'm just simulating a re-fetch by setting the local state
            // Replace this with your actual fetch logic
            setLocalComments(comments);
        }
    }, [commentPosted, comments]);

    return (
        <Box>
            {localComments.map((comment, index) => (
                <Comment key={index} {...comment} />
            ))}
        </Box>
    );
};

export default Comments;
