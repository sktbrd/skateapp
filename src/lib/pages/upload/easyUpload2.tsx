import { Box, Button, Input, Flex,  Image, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { defaultFooter } from './defaultFooter';

import useAuthUser from '../home/api/useAuthUser';
import { KeychainSDK } from 'keychain-sdk';
import { Client } from '@hiveio/dhive';

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

const PINATA_API_KEY = 'f382d9b820088964b995';
const PINATA_API_SECRET = '818eab92027191ccbdcdaabb08046745da75c78f5adab06099371a2ee518a4fd';

const MediaUpload: React.FC = () => {
  const [media, setMedia] = useState<Media | null>(null);
  const [screenshotTime, setScreenshotTime] = useState<number>(0);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);

  const [body, setBody] = useState<string>(''); // Initialize 'body' as an empty string  
  const [description, setDescription] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const { user } = useAuthUser() as { user: User | null };
  
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { name: 'knowhow92', percentage: 10 }, // Hardcoded beneficiary
  ]);
  const [tags, setTags] = useState<string[]>([]); // Empty tags array
  

  // Do I need the first one ? 
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailIpfsURL, setThumbnailIpfsURL] = useState<string | null>(null); // Declare it here

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
              'Content-Type': 'multipart/form-data',
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_API_SECRET,
            },
          }
        );

        if (response && response.data && response.data.IpfsHash) {
          const videoipfsURL = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
          console.log('Dropped in IPFS:', videoipfsURL);
          setIpfsLink(videoipfsURL);
         // console type of everything
          const iframe = generateIframe(videoipfsURL);
          setBody((prevBody) => prevBody + iframe); // Append the iframe string to the body
        }
      } catch (error) {
        console.error('Error uploading to IPFS:', error);
      }
    } else {    }
  };

  useEffect(() => {
    if (ipfsLink) {
      console.log('First Useeffect: ', body);
    }
  }, [ipfsLink, body]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const src = URL.createObjectURL(file);

    if (file.type.startsWith('video')) {
      setMedia({ type: 'video', src });
      await uploadToIPFS(file);
    } else if (file.type.startsWith('image')) {
      setMedia({ type: 'image', src });
      await uploadToIPFS(file);
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
        const thumbnailURL = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        setThumbnailIpfsURL(thumbnailURL); // Set the thumbnail IPFS link in the state
        console.log('Thumbnail uploaded to IPFS:', thumbnailIpfsURL);
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
    console.log(thumbnailIpfsURL)
  };



  
  // Define a function to handle assembling the body and logging it
  const takeScreenshot = useCallback(() => {
    if (media?.type === 'video' && !screenshotTaken) {
      console.log('Taking screenshot...');
      console.log('Media:', media);
      console.log('Screenshot time:', screenshotTime);
      setScreenshotTaken(true);
      const video = document.createElement('video');
      video.src = media.src;
  
      const handleTimeUpdate = (e: Event) => {
        video.currentTime = screenshotTime;
      };
  
      video.addEventListener('timeupdate', handleTimeUpdate);
  
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
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
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


    console.log('Assembled Body:', updatedBody);

    // Construct the complete post body
    const completePostBody = `${updatedBody}${showFooter ? defaultFooter : ''}`;
  
    // Log the complete post body
    console.log('Title: ' ,title);
    console.log('Complete Post Body:', completePostBody);
  
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
                  [0, {
                      beneficiaries: [{
                          account: "xvlad",
                          weight: 1000  // This represents 10%, and it should be an integer
                      }]
                  }]
              ]
            };
  
            const operations = [
                ["comment",
                    {
                        "parent_author": "",
                        "parent_permlink": "666",
                        "author": username,
                        "permlink": permlink,
                        "title": title,
                        "body": completePostBody,
                        "json_metadata": JSON.stringify({
                            tags: ["skateboard"],
                            app: "skatehive",
                            image: thumbnailIpfsURL ? [thumbnailIpfsURL] : []
                        })
                    }
                ],
                ["comment_options", commentOptions]
            ];
  
            console.log("OPERATIONS: ", operations);
            window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
                if (response.success) {
                    window.alert("Post successfully published!");
                } else {
                    console.error("Error publishing post:", response.message);
                }
            });
        } else {
            alert("You have to login with Hive Keychain to use this feature...");
        }
    } else {
        console.error("Hive Keychain extension not found!");
    }
    };
  };

  

  return (
    <Flex
      p={6}
      flexDir={{ base: 'column', md: 'row' }} // Change flex direction based on screen size
      w="full"
      justify="space-between"
    >
      {/* Top section for inputs in mobile */}
      <Box flex="1" p={6} borderBottom={{ base: '1px solid gray', md: 'none' }}>
        <VStack spacing={6}>
          {/* Title input */}
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
  
          {/* Drag and drop */}
          <Box {...getRootProps()} border="2px dashed gray" p={6}>
            <input {...getInputProps()} />
            <Text>Drag & drop videos or images here, or click to select files</Text>
          </Box>
  
          {/* Description input */}
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
  
          <Button onClick={handlePublish}>Assemble Body</Button>
        </VStack>
      </Box>
  
      {/* Bottom section for rendering and previews in mobile */}
      <Box flex="1" p={6} borderTop={{ base: '1px solid gray', md: 'none' }}>
        {/* Title */}
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          {title}
        </Text>
  
        {/* Video */}
        {media?.type === 'video' && (
          <>
            <Button marginTop="10px" onClick={takeScreenshot}>
              Confirm Thumbnail
            </Button>
            <video
              width="50%" // Full width on mobile
              controls
              src={media.src}
              onTimeUpdate={(e) => setScreenshotTime(e.currentTarget.currentTime)}
            ></video>

          </>
        )}
  
        {/* Thumbnail preview */}
        {media?.thumbnail && (
          <Image
            src={media.thumbnail}
            marginTop="10px"
            borderRadius="10px"
            alt="Thumbnail"
            maxW="20%"
            h="auto"
          />
        )}
        <Text fontSize="md" marginTop="10px" wordBreak="break-word">
          {description}
        </Text>
      </Box>
    </Flex>
  );
  
  
};

export default MediaUpload
