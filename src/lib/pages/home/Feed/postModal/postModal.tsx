import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { Client, PrivateKey } from '@hiveio/dhive';

import PostHeader from './postModalHeader';
import PostFooter from './postModalFooter';
import Comments from './comments';
import voteOnContent from '../../api/voting';
import useAuthUser from '../../api/useAuthUser';
import CommentBox from './commentBox';
import * as Types from '../types';
import { MarkdownRenderers } from '../../../utils/MarkdownRenderers';
import HiveLogin from '../../api/HiveLoginModal';
const nodes = [
  "https://rpc.ecency.com",
  "https://api.deathwing.me",
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.pharesim.me",
];

import { transformGiphyLinksToMarkdown } from 'lib/pages/utils/ImageUtils';
import { transform3SpeakContent } from 'lib/pages/utils/videoUtils/transform3speak';
import { slugify } from 'lib/pages/utils/videoUtils/slugify';
import { json } from 'stream/consumers';
import { diff_match_patch } from 'diff-match-patch';


const PostModal: React.FC<Types.PostModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  author,
  permlink,
  weight,
  comments = [],
  postUrl,
  userVote,
  json_metadata,
}) => {
  
  const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;
  const { user } = useAuthUser();
  const isUserLoggedIn = !!user; // Check if the user is logged in
  const username = user ? user.name : null
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [client, setClient] = useState(new Client(nodes[0]));
  const [nodeIndex, setNodeIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false); // State to control the login modal visibility

  function transformYouTubeContent(content: string): string {
    // Regular expression to match YouTube video URLs
    const regex = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;
  
    // Use the replace method to replace YouTube video URLs with embedded iframes
    let transformedContent = content.replace(regex, (match: string, videoID: string) => {
      // Wrap the iframe in a div with centering styles
      return `<div style="display: flex; justify-content: center; "><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer;  encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    });
        // Transform the content for 3speak videos
        transformedContent = transform3SpeakContent(transformedContent);
        transformedContent = transformGiphyLinksToMarkdown(transformedContent);
        return transformedContent;
  }
  

  useEffect(() => {
    // log the post json_metadata
    console.log("JSONMETADA: ", json_metadata)
    const parsedMetadata = JSON.parse(json_metadata);
    console.log("PARSED: ", parsedMetadata)
    // log the post author
    console.log(author)
    // log the post permlink
    console.log(permlink)
    // log the post title
    console.log(title)
  }
  ,[]);

  const dmp = new diff_match_patch();
  const createPatch = (originalContent: string, editedContent: string) => {
    // Create a patch
    const patch = dmp.patch_make(originalContent, editedContent);
  
    // Check if the patch contains changes
    if (patch.length > 0) {
      // Convert the patch to a string
      const patchString = dmp.patch_toText(patch);
  
      // Check if the patched content is not longer than the original content
      const patchedContent = dmp.patch_apply(patch, originalContent);
      if (!patchedContent[1].some((change: boolean) => !change)) {
        return patchString;
      }
    }
  
    return null;
  };
  

  // Save edited content handler
  // Save edited content handler
  const handleSaveClick = () => {
    console.log("Original Content:", content);
    console.log("Edited Content:", editedContent);
  
    const username = user?.name;
  
    if (username && window.hive_keychain) {
      // Extract taglist from json_metadata
      const parsedMetadata = JSON.parse(json_metadata);
      const taglist = parsedMetadata.tags || []; // Use an empty array if tags are not present
  
      // Create a patch
      const patch = createPatch(content, editedContent);
  
      if (patch) {
        // Check if the patch size is smaller than the original content
        const patchedContent =
          patch.length < new TextEncoder().encode(content).length
            ? dmp.patch_apply(dmp.patch_fromText(patch), content)[0]
            : editedContent;
  
        const operations = [
          [
            'comment',
            {
              parent_author: '', // Leave as an empty string for a new post
              parent_permlink: taglist[0] || '', // Use the first tag as parent_permlink or an empty string if tags are not present
              author: username,
              permlink: permlink,
              title: title,
              body: patchedContent,
              json_metadata: json_metadata,
            },
          ],
        ];
  
        window.hive_keychain.requestBroadcast(
          username,
          operations,
          'posting',
          (response: any) => {
            if (response.success) {
              setIsEditing(false);
              setEditedContent(patchedContent); // Update state after a successful broadcast
            } else {
              console.error('Error updating the post:', response.message);
              // Handle the error further or show an error message
            }
          }
        );
      } else {
        console.log('No patch needed. Submitting edited content as is.');
        // Continue with your logic to save to the blockchain using editedContent
      }
    } else {
      console.error('Hive Keychain extension not found or user not authenticated!');
    }
  
    setIsEditing(false);
  };
  
  

  
  

  // Cancel edit handler
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent(content); // Reset to original content
  };  
  


  // Edit button handler
  const handleEditClick = () => {
        console.log(title)
    console.log(permlink)
    console.log(author)
    setIsEditing(true);
  };
  
  const generatePostUrl = () => {
    return `${window.location.origin}/post${postUrl}`;
  };
  
  

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

const navigate = useNavigate();

const postData = {
  title,
  content,
  author,
  permlink,
  weight,
  comments,
  postUrl,
};    
const handleViewFullPost = (event:any) => {
  event.stopPropagation(); // Prevent event from bubbling up to the parent
  // Gather all the post data you want to pass
  // Navigate to the PostPage and pass the post data via state
  console.log(window.location.protocol + '//' + postUrl);
  console.log("Post data before navigation:", postData);

};
const cleanUrl = generatePostUrl().replace(window.location.origin, '');

const postLink = window.location.protocol + '//' + postUrl;
console.log("POSTDATA: ",postData)
const [postLinkCopied, setPostLinkCopied] = useState(false);

const handleCopyPostLink = () => {
  try {
    const postPageUrl = generatePostUrl();
    navigator.clipboard.writeText(postPageUrl);
    setPostLinkCopied(true);
    //wait 3 seconds
    setTimeout(() => {
      setPostLinkCopied(false);
    }, 3000);
  } catch (error) {
    console.error('Failed to copy the link:', error);
  }
};
const transformedContent = transformYouTubeContent(content);

return (
  <Modal isOpen={isOpen} onClose={onClose} size="3xl">
  <ModalOverlay style={{ background: 'rgba(0, 0, 0, 0.8)' }} /> {/* Adjust the opacity as needed */}
    <ModalContent backgroundColor={'black'}  boxShadow="0px 0px 10px 5px rgba(128,128,128,0.1)">
      <ModalHeader>
        <PostHeader title={title} author={author} avatarUrl={avatarUrl} postUrl={postUrl} permlink={permlink} onClose={onClose} />
        <Flex justifyContent={'flex-end'} marginTop={3}>
          {isUserLoggedIn && user.name === author && !isEditing && (
            <Button id="editButton" onClick={handleEditClick}>Edit</Button>
          )}
          {isUserLoggedIn && isEditing && (
            <Button id="saveButton" onClick={handleSaveClick}>Save</Button>
          )}
        </Flex>
      </ModalHeader>
      
      <ModalBody ref={modalContainerRef}>
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            height={500}
          />
        ) : (
          
          <ReactMarkdown
            components={MarkdownRenderers}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          >
            {(transformedContent)}
          </ReactMarkdown>
          
        )}
        
      </ModalBody>
      <Comments comments={comments} commentPosted={commentPosted} blockedUser={"hivebuzz"} permlink='' />
      <HStack justifyContent="space-between">
        <Link to={{ pathname: cleanUrl, state: { post: postData } } as any}>
          <Button color="white" bg="black" margin="15px" border="1px solid orange" onClick={handleViewFullPost}>View Full Post</Button>
        </Link>
        <Button color="white" bg="black" border="1px solid orange" margin="15px" onClick={handleCopyPostLink}>
          {postLinkCopied ? 'Link Copied!' : 'Share Post'}
        </Button>
      </HStack>   
      {/* Render comment box or login button */}
      {isUserLoggedIn ? (
        <div>
                <CommentBox
        user={user}
        parentAuthor={author}
        parentPermlink={permlink}
        onCommentPosted={() => setCommentPosted(!commentPosted)}
      />
          <PostFooter onClose={onClose} user={user} author={author} permlink={permlink} weight={weight} userVote={userVote}  />

        </div>
      ) : (
        <center>
        <Button color="white" bg="black"  margin="10px" border="1px solid yellow" onClick={() => setShowLoginModal(true)}>Login to Comment | Vote</Button>

        </center>
      )}


    </ModalContent>   


    <HiveLogin isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
  </Modal>
);


};



export default PostModal;
