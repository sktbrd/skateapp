import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OpenAI from 'openai';
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
  Text,
  Box,
  VStack,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,

} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { Client, PrivateKey } from '@hiveio/dhive';

import PostHeader from './postModalHeader';
import PostFooter from './postModalFooter';
import Comments from './comments';
import voteOnContent from '../../../utils/hiveFunctions/voting';
import useAuthUser from '../../../../components/auth/useAuthUser';
import CommentBox from './commentBox';
import * as Types from '../types';
import { MarkdownRenderers } from '../../../utils/MarkdownRenderers';
import { transformComplexMarkdown } from '../../../utils/transformComplexMarkdown';
import HiveLogin from '../../../../components/auth/HiveLoginModal';
const nodes = [
  "https://api.deathwing.me",
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.pharesim.me",
];

import { transformGiphyLinksToMarkdown } from 'lib/pages/utils/ImageUtils';
import { transform3SpeakContent, transformYouTubeContent, transformIPFSContent } from 'lib/pages/utils/videoFunctions/videoUtils';
import { slugify } from 'lib/pages/utils/videoFunctions/slugify';
import { json } from 'stream/consumers';
import { diff_match_patch } from 'diff-match-patch';
import { FaO, FaPencil } from 'react-icons/fa6';
import { FaShare, FaEye, FaCopy } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { get } from 'http';

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
  images,
  thumbnail,
  createdAt,
}) => {

  const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;
  const { user } = useAuthUser();
  const isUserLoggedIn = !!user;
  const username = user ? user.name : null
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [client, setClient] = useState(new Client(nodes[0]));
  const [nodeIndex, setNodeIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [originalThumb, setOriginalThumb] = useState<string | null>(null);
  const [loadingSummaries, setLoadingSummaries] = useState<boolean>(true);


  const extractImagesFromContent = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = content.match(imageRegex);

    if (matches) {
      return matches.map((match) => {
        const urlMatch = match.match(/\((.*?)\)/);
        return urlMatch ? urlMatch[1] : '';
      });
    }

    return [];
  };

  useEffect(() => {
    const parsedMetadata = JSON.parse(json_metadata);
    const postImagesFromMetadata = parsedMetadata.images || [];

    // Extract images from the post content
    const imagesFromContent = extractImagesFromContent(content);

    // Merge the images from metadata and content, removing duplicates
    const mergedImages = Array.from(new Set([...postImagesFromMetadata, ...imagesFromContent]));

    setPostImages(mergedImages);
  }, [json_metadata, content]);


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


  const handleSaveClick = () => {

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

        // Determine the thumbnail to use
        const thumbnailToUse = selectedThumbnail || thumbnail || null;

        // Update the postImages array with the new thumbnail

        // Update JSON metadata with the new thumbnail
        const updatedJsonMetadata = {
          ...parsedMetadata,
          thumbnail: thumbnailToUse,
          image: postImages,
        };

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
              thumbnail: thumbnailToUse,
              json_metadata: JSON.stringify(updatedJsonMetadata),
            },
          ],
        ];
        window.hive_keychain.requestBroadcast(username, operations, 'posting', (response: any) => {
          if (response.success) {
            setIsEditing(false);
            setEditedContent(patchedContent); // Update state after a successful broadcast
          } else {
            console.error('Error updating the post:', response.message);
            // Handle the error further or show an error message
          }
        });
      } else {
        alert('No changes detected, if you are trying to change the thumbnail, change at least one character on the post.');
        // Continue with your logic to save to the blockchain using editedContent
      }
    } else {
      console.error('Hive Keychain extension not found or user not authenticated!');
    }

    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent(content); // Reset to original content
  };

  const handleEditClick = () => {

    setIsEditing(true);
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

  // const postData = {
  //   title,
  //   content,
  //   author,
  //   permlink,
  //   weight,
  //   comments,
  //   postUrl,
  // };


  let transformedContent = transformYouTubeContent(content);
  transformedContent = transformComplexMarkdown(transformedContent);
  transformedContent = transformIPFSContent(transformedContent);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent backgroundColor={'black'} boxShadow="0px 0px 6px 0.5px white">
        <ModalHeader>
          <PostHeader title={title} author={author} avatarUrl={avatarUrl} postUrl={postUrl} permlink={permlink} content={content} onClose={onClose} date={createdAt} />
        </ModalHeader>
        {isUserLoggedIn && user.name === author && !isEditing && (
          <Flex marginRight={"40px"} justifyContent="flex-end" marginTop={3}>
            <Button
              id="editButton"
              onClick={handleEditClick}
              leftIcon={<FaPencil />}
              colorScheme="red"
              variant="outline"
              mr={2}
            >
              Edit
            </Button>
          </Flex>
        )}

        {isEditing ? (
          <center>
            <Tooltip
              label="Optional. Select a thumbnail only if you wish to change the current one"
              aria-label="A tooltip"
            >
              <Text fontSize={"42px"}>
                Select New Thumbnail
              </Text>
            </Tooltip>

          </center>
        ) : null}

        {postImages && postImages.length > 0 && (
          <Flex borderRadius={"10px"} m="25px" marginBottom={"-25px"} padding={"10px"} alignItems="center" marginTop={4}>
            <Flex direction="row" alignItems="center" flexWrap="wrap">
              {isEditing ? (
                postImages.map((image: string, index: number) => (
                  <React.Fragment key={index}>
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedThumbnail === image ? '2px solid teal' : 'none',
                        width: '148px',
                        marginRight: (index + 1) % 4 === 0 ? 0 : '10px',
                        marginBottom: '10px',
                        borderRadius: '5px',
                      }}
                      onClick={() => setSelectedThumbnail(image)}
                    />
                    {(index + 1) % 4 === 0 && <br />}
                  </React.Fragment>
                ))
              ) : null}
            </Flex>
          </Flex>
        )
        }
        <ModalBody ref={modalContainerRef}>
          {isEditing ? (
            <VStack>
              <Text fontSize={"42px"}>
                Change your Post
              </Text>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                height={500}
              />
            </VStack>

          ) : (
            <React.Fragment>
              <ReactMarkdown
                components={MarkdownRenderers}
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {(transformedContent)}
              </ReactMarkdown>
            </React.Fragment>
          )}
          {isUserLoggedIn && user.name === author && isEditing && (
            <Flex marginTop={"10px"} justifyContent={"center"}>

              <HStack>

                <Button onClick={handleSaveClick} colorScheme='green' variant='solid' marginRight={2}>
                  Save
                </Button>
                <Button onClick={handleCancelClick} colorScheme='red' variant='solid'>
                  Cancel
                </Button>
              </HStack>
            </Flex>
          )}
        </ModalBody>
        <Comments comments={comments} commentPosted={commentPosted} blockedUser={"hivebuzz"} permlink='' />
        {isUserLoggedIn ? (
          <div>
            <CommentBox
              user={user}
              parentAuthor={author}
              parentPermlink={permlink}
              onCommentPosted={() => setCommentPosted(!commentPosted)}
            />
            <PostFooter onClose={onClose} user={user} author={author} permlink={permlink} weight={weight} userVote={userVote} />
          </div>
        ) : (
          <center>
            <Button color="white" bg="black" margin="10px" border="1px solid yellow" onClick={() => setShowLoginModal(true)}>
              Login to Comment | Vote
            </Button>
          </center>
        )
        }

        <HiveLogin isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </ModalContent >
    </Modal >
  );
};

export default PostModal;
