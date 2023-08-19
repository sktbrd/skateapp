import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody
} from '@chakra-ui/react';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import PostHeader from './postHeader';
import PostFooter from './modalFooter';
import Comments from './comments';
import voteOnContent from '../../api/voting';
import useAuthUser from '../../api/useAuthUser';
import CommentBox from './commentBox';


import * as Types from '../types';

const PostModal: React.FC<Types.PostModalProps> = ({ isOpen, onClose, title, content, author, permlink, weight, comments = [] }) => {
  
  const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;
  const { user } = useAuthUser();
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Transform the content for 3speak videos
  content = transform3SpeakContent(content);

  //  ---------------------------------------Scroll Effect -------------------------------
  const [userScrolled, setUserScrolled] = useState(false);

  const handleScroll = () => {
    const isAtBottom =
      modalContainerRef.current!.scrollTop >=
      (modalContainerRef.current!.scrollHeight || 0) - (modalContainerRef.current!.offsetHeight || 0);
    setUserScrolled(!isAtBottom);
  };
  const [charactersToShow, setCharactersToShow] = useState(0); // Start from 0

  useEffect(() => {
    const timer = setInterval(() => {
      setCharactersToShow((prevChars) => {
        if (prevChars >= content.length) {
          clearInterval(timer);
          return prevChars;
        } else if (prevChars < 400) { // Scroll effect for the first 300 characters
          return prevChars + 1;
        } else { // Display the entire content after the scroll effect
          clearInterval(timer);
          return content.length;
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

  //  ---------------------------------------Scroll Effect -------------------------------

  //  ---------------------------------------Voting Button -------------------------------

  const [sliderValue, setSliderValue] = useState(0);
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };
  const handleVote = async () => {
    if (!user || !user.name) {  // Use user.name to get the username
        console.error("Username is missing");
        return;
    }

    try {
      await voteOnContent(user.name, permlink, author, sliderValue);
      // Optionally, update the UI to reflect the new vote count or state
    } catch (error) {
        console.error("Error voting:", error);
        // Optionally, show an error message to the user
    }
  };

  //  ---------------------------------------Voting Button -------------------------------
  //  ---------------------------------------Comment Button -------------------------------
  const [commentPosted, setCommentPosted] = useState(false);
  const [commentsKey, setCommentsKey] = useState<number>(Date.now());
  const handleNewComment = () => {
    setCommentsKey(Date.now());
  };

  //  ---------------------------------------Comment Button -------------------------------

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" >
      <ModalOverlay />
      <ModalContent backgroundColor={"black"} border={"1px solid limegreen"}>
        <ModalHeader>
          <PostHeader title={title} author={author} avatarUrl={avatarUrl} onClose={onClose} /> 
        </ModalHeader>
        <ModalBody ref={modalContainerRef} onScroll={handleScroll}>
        <ReactMarkdown
            children={charactersToShow >= content.length ? content : content.slice(0, charactersToShow)}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, alt, src, title, ...props }) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img {...props} alt={alt} src={src} title={title} style={{ maxWidth: '100%', height: 'auto' , borderRadius:"10px", border:'1px solid limegreen' }} />
                </div>
              ),
              a: ({node, children, ...props}) => <a {...props} style={{ color: 'yellow' }}>{children}</a>,
              h1: ({node, children, ...props}) => <h1 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '26px', paddingBottom: '10px' }}>{children}</h1>,
              h2: ({node, children, ...props}) => <h2 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '20px', paddingBottom: '8px' }}>{children}</h2>,
              h3: ({node, children, ...props}) => <h3 {...props} style={{ fontWeight: 'bold',color: 'yellow', fontSize: '18px', paddingBottom: '6px' }}>{children}</h3>,
              blockquote: ({node, children, ...props}) => <blockquote {...props} style={{ borderLeft: '3px solid red', paddingLeft: '10px', fontStyle: 'italic' }}>{children}</blockquote>,            
              ol: ({ node, ordered, children, ...props }) => {
                // Handle the ordered attribute properly
                const listType = ordered ? "1" : "decimal";
                return <ol {...props} style={{ listStyleType: listType, paddingLeft: '20px' }}>{children}</ol>;
              },              
              ul: ({ node, ordered, children, ...props }) => {
                if (ordered === false) {
                  return null; // Omit the entire <ul> element if ordered is false
                }
                return <ul {...props} style={{ paddingLeft: '20px' }}>{children}</ul>;
              },
              hr: ({node, children, ...props}) => <hr {...props} style={{ paddingBottom: '20px' }}>{children}</hr>,
              br: ({node, children, ...props}) => <br {...props} style={{ paddingBottom: '20px' }}>{children}</br>,
              iframe: ({ node, ...props }) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <iframe 
                    {...props} 
                    style={{ 
                      border: '1px solid limegreen', 
                      borderRadius: '10px', 
                      width: '560px', // This is a common width for landscape videos
                      height: '315px', // This height maintains a 16:9 aspect ratio with the width
                    }} 
                  /> 
                </div>
              ),
            }}
          />
        </ModalBody>
        <Comments comments={comments} commentPosted={commentPosted} />
        <CommentBox 
            user={user} 
            parentAuthor={author} 
            parentPermlink={permlink} 
            onCommentPosted={() => setCommentPosted(!commentPosted)}
        />
        <PostFooter onClose={onClose} user={user} author={author} permlink={permlink} weight={weight} /> 
      </ModalContent>
    </Modal>
  );
};

function transform3SpeakContent(content:any) {
  const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9]+\/[a-zA-Z0-9]+))\)/;

  const match = content.match(regex);
  if (match) {
    const videoURL = match[2];
    const videoID = match[3];
    const iframe = `<iframe width="560" height="315" src="https://3speak.tv/embed?v=${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    content = content.replace(regex, iframe);
  }

  return content;
}

export default PostModal;
