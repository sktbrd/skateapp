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
import { MarkdownRenderers } from './MarkdownRenderers';
const nodes = [
  "https://rpc.ecency.com",
  "https://api.deathwing.me",
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.pharesim.me",
];

const PostModal: React.FC<Types.PostModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  author,
  permlink,
  weight,
  comments = [],
  postUrl
}) => {
  
  const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;
  const { user } = useAuthUser();
  const username = user ? user.name : null
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [client, setClient] = useState(new Client(nodes[0]));
  const [nodeIndex, setNodeIndex] = useState(0);
  console.log(postUrl)




  function transform3SpeakContent(content: any) {
    const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9]+\/[a-zA-Z0-9]+))\)/;
    const match = content.match(regex);
    if (match) {
      const videoURL = match[2];
      const videoID = match[3];
      const iframe = `<iframe class="video-player" width="560" height="315" src="https://3speak.tv/embed?v=${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      content = content.replace(regex, iframe);
    }
    return content;
  }


  function transformYouTubeContent(content: string): string {
    // Regular expression to match YouTube video URLs
    const regex = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;
  
    // Use the replace method to replace YouTube video URLs with embedded iframes
    const transformedContent = content.replace(regex, (match: string, videoID: string) => {
      // Wrap the iframe in a div with centering styles
      return `<div style="display: flex; justify-content: center; "><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    });
  
    return transformedContent;
  }
  

    // Transform the content for 3speak videos
    content = transform3SpeakContent(content);

  // Save edited content handler
  const handleSaveClick = () => {
    // TODO: Implement the logic to save the edited content to Hive
    // I want to check the body of content that is being saved using a console.log but I don't know how to do it
    console.log(editedContent)
    const username = user?.name; // Get the username from the authenticated user
    // get post details that wont change from Feed component and pass it to this component like permlink, tags, title, etc
    console.log(title)
    console.log(permlink)
    console.log(author)
        // Ok we are getting the edited content now we have to save it to the blockchain, lets do in the same way we do with the upload function in upload folder   
    if (username && window.hive_keychain) {

      const operations = [
        ["comment",
                  {
                      "parent_author": author,
                      "parent_permlink": "hive-173115",
                      "author": username,
                      "permlink": permlink,
                      "title": title,
                      "body": editedContent,
                      "json_metadata": JSON.stringify({
                          app: "skatehive",
                      })
                  }
              ],
      ];
      window.hive_keychain
      .requestBroadcast(username, operations, "posting")
      .then((response:any) => {
        if (response.success) {
          setIsEditing(false);
          setEditedContent(editedContent); // Update state after successful broadcast
        } else {
          console.error("Error updating the post:", response.message);
          // Handle the error further or show an error message
        }
      })
      .catch((error:any) => {
        console.error("Error during broadcasting:", error);
        // Handle the error or log it for further investigation
      });
  } else {
    console.error("Hive Keychain extension not found or user not authenticated!");
  }

  setIsEditing(false);
};

  // Cancel edit handler
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent(content); // Reset to original content
  };  
  
  function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
  };

  const handleSaveEdit = () => {
    const username = user?.name; // Get the username from the authenticated user
    if (username && window.hive_keychain) {
      const permlink = slugify(title.toLowerCase()); // Generate the permlink from the title
      const operations = [
        [
          "comment",
          {
            parent_author: "", // Provide the correct parent author
            parent_permlink: "your-tag", // Replace with the correct parent permlink
            author: username,
            permlink: permlink,
            title: title,
            body: editedContent,
            json_metadata: JSON.stringify({ tags: ['your-tags'] }), // Update with the correct metadata
          },
        ],
      ];
  
      window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
        if (response.success) {
          setIsEditing(false);
          // Update the content in the UI
          content = editedContent;
        } else {
          console.error('Error updating the post:', response.message);
        }
      });
    } else {
      console.error("Hive Keychain extension not found or user not authenticated!");
    }
  };

  // Edit button handler
  const handleEditClick = () => {
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
const cleanUrl = 'post' + postData.postUrl;

const postLink = window.location.protocol + '//' + postUrl;

const [postLinkCopied, setPostLinkCopied] = useState(false);

const handleCopyPostLink = () => {
  try {
    const postPageUrl = generatePostUrl();
    console.log(postPageUrl)
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
    <ModalOverlay />
    <ModalContent backgroundColor={'black'} border={'1px solid limegreen'}>
      <ModalHeader>
        <PostHeader title={title} author={author} avatarUrl={avatarUrl} postUrl={postUrl} permlink={permlink} onClose={onClose} />
        {user?.name === author && !isEditing && (
          <Button id="editButton" onClick={handleEditClick}>Edit</Button>
        )}
        {isEditing && (
          <Button id="saveButton" onClick={handleSaveClick}>Save</Button>
        )}
      </ModalHeader>
      <ModalBody ref={modalContainerRef}>
  {isEditing ? (
    <Textarea
      value={editedContent}
      onChange={(e) => setEditedContent(e.target.value)}
    />
  ) : (
    <ReactMarkdown
    components={MarkdownRenderers} // Use your custom renderers here
    rehypePlugins={[rehypeRaw]}
    remarkPlugins={[remarkGfm]}
  >
    {transformYouTubeContent(content)}
  </ReactMarkdown>  )}
</ModalBody>

      <Comments comments={comments} commentPosted={commentPosted} />
      <CommentBox
        user={user}
        parentAuthor={author}
        parentPermlink={permlink}
        onCommentPosted={() => setCommentPosted(!commentPosted)}
      />
      <PostFooter onClose={onClose} user={user} author={author} permlink={permlink} weight={weight} />
      <HStack justifyContent="space-between">
        <Link to={{ pathname: cleanUrl, state: { post: postData } } as any}>
          <Button margin="5px" border="1px solid orange" onClick={handleViewFullPost}>View Full Post</Button>
        </Link>
        <Button border="1px solid orange" onClick={handleCopyPostLink}>
          {postLinkCopied ? 'Link Copied!' : 'Share Post'}
        </Button>
      </HStack>
    </ModalContent>
  </Modal>
);


};

export default PostModal;
