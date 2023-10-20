import React, { useState, useCallback, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Input,
  Flex,
  Image,
  Text,
  VStack,
  Progress,
  Center,
  Textarea,
  
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { defaultFooter } from './defaultFooter';
import useAuthUser from '../home/api/useAuthUser';
import { KeychainSDK } from 'keychain-sdk';
import { Client } from '@hiveio/dhive';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import { MarkdownRenderers } from '../utils/MarkdownRenderers';


interface Media {
  type: 'video' | 'image';
  src: string;
  thumbnail?: string;
}
interface User {
  name?: string;
}
interface Beneficiary {
  name: string;
  percentage: number;
}
interface BeneficiaryForBroadcast {
  account: string;
  weight: string;
}

const client = new Client('https://api.hive.blog');

const PINATA_API_KEY = process.env.PINATA_API_KEY ;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET ;
const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;



const MediaUpload: React.FC = () => {
  const [media, setMedia] = useState<Media | null>(null);
  const [screenshotTime, setScreenshotTime] = useState<number>(2);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);

  const [body, setBody] = useState<string>(''); // Initialize 'body' as an empty string
  const [description, setDescription] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const { user } = useAuthUser() as { user: User | null };

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { name: 'skatehacker', percentage: 20 },
    { name: 'steemskate', percentage: 30} 
  ]);
  const [tags, setTags] = useState<string[]>([]); // Empty tags array

  // Do I need the first one ?
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailIpfsURL, setThumbnailIpfsURL] = useState<string | null>(null); // Declare it here
  const [progress, setProgress] = useState(0);

  const [showPublishButton, setShowPublishButton] = useState(false); // New state to control the "Publish" button visibility

  const generateIframe = (link: string) => {
    return `<iframe src="${link}" width="100%" height="400px" frameborder="0" allowfullscreen></iframe>`;
  };
  const uploadToIPFS = async (file: File | HTMLCanvasElement) => {
    // check if file is video or image
    if (file instanceof File) {
      console.log("trying to upload something: ", file)
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
      console.log("formData: ", formData)

      try { 

        const response = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            headers: {
              'Content-Type': 'video/.mp4',
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_API_SECRET,
            },
            onUploadProgress: progressEvent => {
              const total = progressEvent.total ?? 1; // Handle possible undefined total
              const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
              setProgress(percentCompleted);
            }
          }
        );


        if (response && response.data && response.data.IpfsHash) {
          const videoipfsURL = `https://gray-soft-cardinal-116.mypinata.cloud/ipfs/${response.data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
          console.log('Dropped in IPFS:', videoipfsURL);
          setIpfsLink(videoipfsURL);
          // console type of everything
          const iframe = generateIframe(videoipfsURL);
          setBody((prevBody) => prevBody + iframe); // Append the iframe string to the body
          setProgress(0);

        }
      } catch (error) {
        console.error('Error uploading to IPFS:', error);
      }
    } else { }
  };

  useEffect(() => {
    if (ipfsLink) {
      console.log('First Useeffect: ', body);
    }
  }, [ipfsLink, body]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const src = URL.createObjectURL(file);
  
    if (file.type === 'video/mp4') { // Check if the file type is 'video/mp4'
      setMedia({ type: 'video', src });
      await uploadToIPFS(file);
    } else {
      // Display an error message or provide feedback to the user that the file is not supported.
      // You can add a state variable to show an error message to the user.
      console.error('Invalid file type. Only .mp4 files are supported.');
      window.alert('Invalid file type. Only .mp4 files are supported. Sorry we will do better soon.');
    }
  }, []);
  

  const uploadThumbnailToIPFS = async (formData: FormData) => {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );

      if (response && response.data && response.data.IpfsHash) {
        const thumbnailURL = `https://gray-soft-cardinal-116.mypinata.cloud/ipfs/${response.data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
        setThumbnailIpfsURL(thumbnailURL); // Set the thumbnail IPFS link in the state
        // Set the thumbnail IPFS link in the media state or wherever you need it
      }
    } catch (error) {
      console.error('Error uploading thumbnail to IPFS:', error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    //@ts-ignore
    accept: 'video/mp4,image/*',
    multiple: false,
  });

  const [screenshotTaken, setScreenshotTaken] = useState<boolean>(false);

  const assembleBodyContent = (currentBody: string, newContent: string) => {
    const assembledBody = currentBody + '\n' + newContent;
    return assembledBody;
  };

  // Define a function to handle assembling the body and logging it
  const takeScreenshot = useCallback(() => {
    if (media?.type === 'video' && !screenshotTaken) {
      console.log('Taking screenshot...');
      console.log('Media:', media);
      console.log('Screenshot time:', screenshotTime);
      setScreenshotTaken(true);
      if (screenshotTime === 0) {
        setScreenshotTime(2); // Set it to the default value of 2 seconds
      }
      const video = document.createElement('video');
      video.src = media.src;
      const handleTimeUpdate = (e: Event) => {
        video.currentTime = screenshotTime;
      };

      video.addEventListener('timeupdate', handleTimeUpdate);

      // TO-DO Firefox onseeked event is borked up, 
      // so this event doesn't trigger and thumbnails break
      video.onseeked = async () => {
        console.log('Video seeked:', screenshotTime);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');

        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          video.removeEventListener('timeupdate', handleTimeUpdate);

          // Convert canvas data to a JPEG data URL
          const thumbnailDataURL = canvas.toDataURL('image/jpeg');

          // Convert the data URL to a Blob
          const thumbnailBlob = await (await fetch(thumbnailDataURL)).blob();

          // Create FormData to upload the Blob to IPFS
          const formData = new FormData();
          formData.append('file', thumbnailBlob, 'thumbnail.jpg');
          formData.append('pinataMetadata', JSON.stringify({ name: 'thumbnail.jpg' }));
          uploadThumbnailToIPFS(formData);
        }
      };

      video.load();
    }
  }, [media, screenshotTime, screenshotTaken]);

  useEffect(() => {
    if (media?.type === 'video') {
      const video = document.createElement('video');
      video.src = media.src;

      video.onloadeddata = () => {
        video.currentTime = screenshotTime;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const thumbnail = canvas.toDataURL('image/jpeg');
          setMedia((prev) => ({
            ...prev!,
            thumbnail, // Set the thumbnail property in the media object
          }));
          uploadToIPFS(canvas);
        }
      };
    }
  }, [media, screenshotTime]);

  const [showFooter, setShowFooter] = useState(false);

  const handlePublish = () => {
    function slugify(text: string) {
      return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, ''); // Trim - from start of text
    }
    if (ipfsLink) {
      let updatedBody = body;
      const permlink = slugify(title.toLowerCase());
      console.log('thumbnailIpfsURL:', thumbnailIpfsURL);
      console.log('Permlink:', permlink);

      if (!body.includes(ipfsLink)) {
        updatedBody = assembleBodyContent(updatedBody, generateIframe(ipfsLink));
      }

      if (description) {
        updatedBody = assembleBodyContent(updatedBody, description);
      }

      console.log('Assembled Body:', updatedBody);

      // Construct the complete post body
      const completePostBody = `${updatedBody}${showFooter ? defaultFooter : ''}`;

      // console.log('Title: ', title);
      // console.log('Complete Post Body:', completePostBody);

      if (window.hive_keychain) {
        const username = user?.name;
        if (username) {
          const commentOptions = {
            author: username,
            permlink: permlink,
            max_accepted_payout: '10000.000 HBD',
            percent_hbd: 10000,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
              [
                0,
                {
                  beneficiaries: [
                    {
                      account: 'skatehacker',
                      weight: 200, // This represents 2%
                    },
                    {
                      account: 'skatehive',
                      weight: 300, // This represents 3%
                    },
                  ],
                },
              ],
            ],
          };

          const operations = [
            [
              'comment',
              {
                parent_author: '',
                parent_permlink: process.env.COMMUNITY || 'hive-173115',
                author: username,
                permlink: permlink,
                title: title,
                body: completePostBody,
                json_metadata: JSON.stringify({
                  tags: ['skateboard'],
                  app: 'skatehive',
                  image: thumbnailIpfsURL ? [thumbnailIpfsURL] : [],
                }),
              },
            ],
            ['comment_options', commentOptions],
          ];

          console.log('OPERATIONS: ', operations);
          window.hive_keychain.requestBroadcast(username, operations, 'posting', (response: any) => {
            if (response.success) {
              window.alert('Post successfully published!');
            } else {
              console.error('Error publishing post:', response.message);
            }
          });
        } else {
          alert('You have to log in with Hive Keychain to use this feature...');
        }
      } else {
        console.error('Hive Keychain extension not found!');
      }
    }
  };

  function SkateboardLoading({ progress }: any) {
    return (
      <Box
        mt={4}
        position="relative"
        height="8px"
        borderRadius="4px"
        border="1px solid gray"
        background="black"
      >
        {/* This Box represents the track on which the skateboard moves */}
        <Box
          position="absolute"
          top="0"
          bottom="0"
          width={`${progress}%`}
          background="limegreen"
          borderRadius="4px"
          boxShadow="0 2px 4px rgba(0,0,0,0.1)"
        />

        {/* This Box represents the flat bar */}
        <Box
          position="absolute"
          height="8px"
          width="100%"
          bottom="0px"
          background="limegreen"
          borderRadius="4px"
        />
        <Box
          position="absolute"
          left={`${progress}%`}
          bottom="-8px"
          transform="translateX(-50%) scaleX(-1)" // Flip vertically
          userSelect="none"
          fontSize="3xl"
          transition="0.666s ease-in-out"
        >
          🛹
        </Box>
        {/* Sparkles coming out from the grinding */}
        <Text
          position="absolute"
          left={`${progress - 2}%`}
          bottom="0px"
          fontSize="sm"
          color="limegreen"
          transform="translateX(-50%)"
        >
          _____✨
        </Text>
      </Box>
    );
  }

  const avatarUrl = `https://images.ecency.com/webp/u/${user?.name}/avatar/small`;

  return (
    <Flex
      p={6}
      flexDir={{ base: 'column', md: 'row' }}
      w="full"
      justify="space-between"
    >
      {/* Top section for inputs in mobile */}
      <Box flex="1" p={6} borderBottom={{ base: '1px solid gray', md: 'none' }}>
        <VStack spacing={6} alignItems="flex-start"> 
          {/* Title input */}
          <Flex alignItems="center"> {/* Added Flex container */}
            <Text fontWeight="bold" fontSize={'24px'} mr={2}> {/* Added right margin */}
              {' '}
              Post Title:{' '}
            </Text>
          </Flex>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          {/* Drag and drop */}
          <Box
            {...getRootProps()}
            cursor="pointer"
            minWidth="100%"
            borderRadius={'10px'}
            border="2px dashed gray"
            p={6}
          >
            <input {...getInputProps()} />
            <center>
            <Text>Drag & drop videos or click to select</Text>  
            </center>
            {progress > 0 && progress < 100 && <SkateboardLoading progress={progress} />}
          </Box>
  

            
          {/* Thumbnail preview */}
          {media?.thumbnail && (
            <div>
            <Text fontWeight="bold" fontSize={'24px'} mr={2}> 
              {' '}
              Select Thumbnail:{' '}
            </Text>
            <Text>
              Select a moment in the video player to take a screenshot and use as thumbnail
            </Text>
            <center>
            <Image
              src={media.thumbnail}
              marginTop="10px"
              borderRadius="10px"
              border="1px solid limegreen"
              alt="Thumbnail"
              maxW="40%"
              h="auto"
            />  
            </center>
       
             <Flex alignItems="center">
            <Text fontWeight="bold" fontSize={'24px'} mr={2}> 
              {' '}
              Description:{' '}
            </Text>

          </Flex>
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", height: "200px" }}
          />   
                   </div>

          )}
          {showPublishButton ? (
            <Button color='white' border={'solid 1px limegreen'} bg="black" marginTop="10px" onClick={handlePublish}>
              Publish
            </Button>
          ) : (
            <Button
              color='white' 
              border={'solid 1px limegreen'} 
              bg="black"
              marginTop="10px"
              onClick={() => {
                setShowPublishButton(true);
                takeScreenshot();
              }}
            >
              Confirm Thumbnail
            </Button>
          )}
        </VStack>
      </Box>
      <Box flex="1" p={6} borderTop={{ base: '1px solid gray', md: 'none' }}>
        <Center fontSize="xl" fontWeight="bold" mb={4}>
          Preview Post
        </Center>
  
        {/* Postcard-like preview */}
        <Box border="1px solid limegreen" borderRadius="10px" padding="20px">
          {/* Avatar and Name */}
          <Flex padding="1%" borderRadius="10px" border="1px solid limegreen" align="center" mb={4}>
            <Avatar border="1px solid limegreen" src={avatarUrl} size="sm" />
            <Text ml={2} fontWeight="bold">
              {user?.name}
            </Text>
          </Flex>
          {/* Title */}
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            {title}
          </Text>
          {/* Video */}
          {media?.type === 'video' && (
            <>
            <center>
            <video
                style={{ borderRadius: '10px', border: '1px solid limegreen' }}
                width="90%"
                controls
                src={media.src}
                onTimeUpdate={(e) => setScreenshotTime(e.currentTarget.currentTime)}
              ></video>

            </center>
            <ReactMarkdown
          children={description}
          components={{
            ...MarkdownRenderers,

          }}          
        />
            </>
          )}
        </Box>
        <Box border="1px solid yellow" borderRadius="10px" padding="20px">
          <Text fontSize="md" wordBreak="break-word">
          💡 You have to confirm your thumbnail before publishing
            </Text>
            </Box>
      </Box>
    </Flex>
  );
  
  
};

export default MediaUpload;
