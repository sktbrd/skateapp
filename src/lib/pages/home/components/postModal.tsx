import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import PostHeader from './postHeader';
import PostFooter from './modalFooter';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  author: string;
  user: any;
  permlink: string;
  weight: number; // Change this to allow any number value
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, title, content, author, user, permlink, weight }) => {
  const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [charactersToShow, setCharactersToShow] = useState(0);
  const [userScrolled, setUserScrolled] = useState(false);

  const handleScroll = () => {
    const isAtBottom =
      modalContainerRef.current!.scrollTop >=
      (modalContainerRef.current!.scrollHeight || 0) - (modalContainerRef.current!.offsetHeight || 0);
    setUserScrolled(!isAtBottom);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCharactersToShow((prevChars) => {
        if (prevChars >= content.length) {
          clearInterval(timer);
          return prevChars;
        } else {
          return prevChars + 1;
        }
      });
    }, 5);

    return () => clearInterval(timer);
  }, [content]);

  useEffect(() => {
    if (modalContainerRef.current && !userScrolled) {
      modalContainerRef.current.scrollTop = modalContainerRef.current.scrollHeight;
    }
  }, [charactersToShow, userScrolled]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" >
      <ModalOverlay />
      <ModalContent backgroundColor={"black"} border={"1px solid limegreen"}>
        <ModalHeader>
          <PostHeader title={title} author={author} avatarUrl={avatarUrl} onClose={onClose} /> 
        </ModalHeader>
        <ModalBody ref={modalContainerRef} onScroll={handleScroll}>
          <ReactMarkdown
            children={content.slice(0, charactersToShow)}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, alt, src, title, ...props }) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img {...props} alt={alt} src={src} title={title} style={{ maxWidth: '100%', height: 'auto' , borderRadius:"10px", border:'1px solid limegreen' }} />
                </div>
              ),
              a: ({node, children, ...props}) => <a {...props} style={{ color: 'yellow' }}>{children}</a>,
              h1: ({node, children, ...props}) => <h1 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '24px' }}>{children}</h1>,
              h2: ({node, children, ...props}) => <h2 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '20px' }}>{children}</h2>,
              h3: ({node, children, ...props}) => <h3 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '18px' }}>{children}</h3>,
              blockquote: ({node, children, ...props}) => <blockquote {...props} style={{ borderLeft: '3px solid limegreen', paddingLeft: '10px', fontStyle: 'italic' }}>{children}</blockquote>,            
              ol: ({node, children, ...props}) => <ol {...props} style={{ paddingLeft: '20px' }}>{children}</ol>,
              ul: ({node, children, ...props}) => <ul {...props} style={{ paddingLeft: '20px' }}>{children}</ul>,
              iframe: ({ node, ...props }) =>(
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <iframe {...props} style={{ border: '1px solid limegreen', borderRadius:'10px', maxWidth: '100%', height: '280px' }} /> 
                </div>
               ),
              
              

            }}
          />
        </ModalBody>
        <PostFooter onClose={onClose} user={user} author={author} permlink={permlink} weight={weight} /> 
      </ModalContent>
    </Modal>
  );
};

export default PostModal;
