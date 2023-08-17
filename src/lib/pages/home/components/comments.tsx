import React from 'react';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export interface CommentProps {
    author: string;
    body: string;
    created: string;
    net_votes: number;
}

const Comment: React.FC<CommentProps> = ({ author, body, created, net_votes }) => {
  const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;


  return (
    <Box border="1px solid limegreen" borderRadius="5px" padding="15px" margin="10px">
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
      <Text fontSize="sm">Votes: {net_votes}</Text>
    </Flex>
    </Box>
  );
};

interface CommentsProps {
  comments: CommentProps[];
}

const Comments: React.FC<CommentsProps> = ({ comments }) => {
  return (
    <Box>
      {comments.map((comment, index) => (
        <Comment key={index} {...comment} />
      ))}
    </Box>
  );
};

export default Comments;
