import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  VStack,
  HStack,
  Image,
  Textarea
} from '@chakra-ui/react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import ReactMarkdown from 'react-markdown'; // Import the Markdown rendering component

import { defaultFooter } from './defaultFooter';
import html2canvas from 'html2canvas';

interface UploadPageProps {
  title: string;
  content: string;
  author: string;
  user: any;
  permlink: string;
  weight: number; 
}
interface User {
  name?: string;
}
declare global {
  interface Window {
    hive_keychain: any;
  }
}
interface Beneficiary {
  name: string;
  percentage: number;
}
interface BeneficiaryForBroadcast {
  account: string;
  weight: string;
}

// Define a component to render Markdown
const MarkdownRenderer: React.FC<{ children: string }> = ({ children }) => {
  return <ReactMarkdown>{children}</ReactMarkdown>;
};

const SimpleUploadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoPreviewTime, setVideoPreviewTime] = useState(0);
  const PINATA_API_KEY = '231d0e8f17911189d9d5';
  const PINATA_API_SECRET = '8248018ee1b93d54b2e48bc98dedbdc3998212f083e891febcd4481956f2bb25';
  const [isUploading, setIsUploading] = useState(false); // State to indicate the upload process
  const [ipfsLinks, setIpfsLinks] = useState<string[]>([]); // State to store all IPFS links
  const [markdownBody, setMarkdownBody] = useState<string>(''); 
  const [showFooter, setShowFooter] = useState(false);
  const allTags = ['skatehive', 'skateboarding', 'hive-173115'];
  const [beneficiariesArray, setBeneficiariesArray] = useState<BeneficiaryForBroadcast[]>([]);
  const [user, setUser] = useState<User>({});
  const [body, setBody] = useState<string>('');

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    // call preventDefault() and stopPropagation() on the event in order to prevent the browser default handling of the data
    event.preventDefault();
    // call stopPropagation() to prevent any parent event handlers from being notified of the event
    event.stopPropagation();
    // Get the files from the clipboard
    let files = Array.from(event.dataTransfer.files);

    // Filter out the video files if one already exists
    if (selectedFiles.some(file => file.type.includes('video/mp4'))) {
        files = files.filter(file => !file.type.includes('video/mp4'));
    }

    // Ensure only one video file is selected
    const videoFiles: File[] = [];
    const imageFiles: File[] = [];
    for (const file of files) {
        if (file.type === 'video/mp4') {
            videoFiles.push(file);
        } else if (file.type.startsWith('image/')) {
            imageFiles.push(file);
        } else {
            alert("Only mp4 videos and images are allowed!");
        }
    }

    // Process video files (taking only one if more than one exists)
    if (videoFiles.length) {
        const videoFile = videoFiles[videoFiles.length - 1];
        setSelectedFiles(prevFiles => [...prevFiles, videoFile]);
        const ipfsLink = await handleIPFSVideoUpload(videoFile);  // New function for video upload
        if (ipfsLink) {
            setIpfsLinks(prevLinks => [...prevLinks, ipfsLink]);
        }
    }

    // Process image files
    const newSelectedFiles = [...selectedFiles];
    for (const image of imageFiles) {
        const ipfsLink = await handleIPFSImageUpload(image); // New function for image upload
        if (ipfsLink) {
            newSelectedFiles.push(image);
            setIpfsLinks(prevLinks => [...prevLinks, ipfsLink]);
        }
    }

    setSelectedFiles(newSelectedFiles);
};

const handleThumbnailSelect = (file: File) => {
  // Check the type of the file
  if (file.type.includes('video/')) {
    // If it's a video, trigger the video modal
    setIsVideoModalOpen(true);
    // Optionally, you can set the selected file as well, depending on your logic
    setSelectedFile(file);
  } else if (file.type.startsWith('image/')) {
    // If it's an image, set it as the thumbnail
    setSelectedFile(file);
    // Clear the thumbnail state
    setSelectedThumbnail(null);
    // Clear the thumbnail URL
    setThumbnail(null);
  } else {
    alert("Only videos and images can be selected as thumbnails!");
  }
};


  const openVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true); // Assuming you have an `isUploading` state

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
        name: file.name
    }));

    try {
        const response: AxiosResponse<any> = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_API_SECRET
            }
        });

        if (response && response.data && response.data.IpfsHash) {
            const ipfsLink = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
            console.log(`Received IPFS link for ${file.name}:`, ipfsLink);

            // Assuming you have an `ipfsLinks` state to store the links
            setIpfsLinks(prev => [...prev, ipfsLink]);

            return ipfsLink;
        }
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const serverError: AxiosError = error;
            console.error("Axios error:", serverError.message);
        } else {
            console.error("An error occurred:", error.message);
        }
        alert("Error uploading image to IPFS.");
    } finally {
        setIsUploading(false); // Set to false at the end
    }

    return null;
};


const handleUpload = async () => {
  const generatedMarkdown = generateMarkdownBody(selectedFiles, ipfsLinks);
  console.log("Generated Markdown in handleUpload:", generatedMarkdown); // Add this line
  setMarkdownBody(generatedMarkdown);
  console.log(markdownBody);
  console.log('clicked upload');
};

  
  
const handleVideoThumbnailConfirm = async () => {
  if (!videoRef.current) return;

  const captureFrame = async () => {
    const canvas = document.createElement('canvas');
    
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');

      if (context && videoRef.current) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const thumbnailBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
        );

        if (thumbnailBlob) {
          const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
          setThumbnail(thumbnailUrl);
          const ipfsThumbnailLink = await handleIPFSUpload(new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' }));

          if (ipfsThumbnailLink) {
            console.log('Thumbnail link on IPFS:', ipfsThumbnailLink);
            setThumbnail(ipfsThumbnailLink);
            setSelectedThumbnail(ipfsThumbnailLink);
            closeVideoModal();
          }
        }
      }
    }
  };

  const onSeeked = () => {
    if (videoRef.current) {
      videoRef.current.removeEventListener('seeked', onSeeked);
    }
    captureFrame();
  };

  videoRef.current.pause();
  videoRef.current.currentTime = videoPreviewTime;
  videoRef.current.addEventListener('seeked', onSeeked);
};


  const [ipfsResponses, setIpfsResponses] = useState<string[]>([]);

  type FileWithLink = {
    file: File;
    ipfsUrl: string;
  };
  
  function generateMarkdownBody(files: File[], ipfsResponses: string[]): string {
    let markdownBody = "";
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ipfsUrl = ipfsResponses[i]; // assuming the order is maintained
  
      if (file.type.startsWith("image/")) {
        markdownBody += `![](${ipfsUrl})\n`;
      } else if (file.type.startsWith("video/")) {
        markdownBody += `<iframe src="${ipfsUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>\n`;
      }
    }
  
    console.log("Generated Markdown:", markdownBody); // Add this line
  
    return markdownBody;
  }
  
  
  
  const clearThumbnail = () => {
    setThumbnail(null);
    setSelectedThumbnail(null);
  };
  

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    setVideoPreviewTime(time);
    
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.pause(); 
    }
  };

  
  
  const handleIPFSUpload = async (file: File) => {
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  
    try {
      console.log("Uploading file to IPFS...")

      console.log("api key:", PINATA_API_KEY)   
      const response: AxiosResponse<any> = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET
        },
      });
      console.log(response)
      console.log("Response:", response);
      if (response && response.data && response.data.IpfsHash) {
        const ipfsLink = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log(`Received IPFS link for ${file.name}:`, ipfsLink);
        setIpfsLinks(prev => [...prev, ipfsLink]);
        return ipfsLink;
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const serverError: AxiosError = error;
        console.error("Axios error:", serverError.message);
      } else {
        console.error("An error occurred:", error.message);
      }
      alert("Error uploading file to IPFS.");
      return null; // Returning null in case of error
    } finally {
      setIsUploading(false);
    }
    return null; // This ensures that the function always returns something
  };
  
  const handleIPFSVideoUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  
    try {
      console.log("Uploading video to IPFS...");
      console.log("api key:", PINATA_API_KEY);   
  
      const response: AxiosResponse<any> = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
          'X-Custom-Video-Header': 'your-value-here' // Example custom header for videos
        },
      });
  
      if (response && response.data && response.data.IpfsHash) {
        const ipfsLink = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log(`Received IPFS link for ${file.name}:`, ipfsLink);
        setIpfsLinks(prev => [...prev, ipfsLink]);
        return ipfsLink;
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const serverError: AxiosError = error;
        console.error("Axios error:", serverError.message);
      } else {
        console.error("An error occurred:", error.message);
      }
      alert("Error uploading video to IPFS.");
      return null;
    } finally {
      setIsUploading(false);
    }
    return null;
  };
  const handleIPFSImageUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  
    try {
      console.log("Uploading image to IPFS...");
      console.log("api key:", PINATA_API_KEY);   
  
      const response: AxiosResponse<any> = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
          'X-Custom-Image-Header': 'your-value-here' // Example custom header for images
        },
      });
  
      if (response && response.data && response.data.IpfsHash) {
        const ipfsLink = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log(`Received IPFS link for ${file.name}:`, ipfsLink);
        setIpfsLinks(prev => [...prev, ipfsLink]);
        return ipfsLink;
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const serverError: AxiosError = error;
        console.error("Axios error:", serverError.message);
      } else {
        console.error("An error occurred:", error.message);
      }
      alert("Error uploading image to IPFS.");
      return null;
    } finally {
      setIsUploading(false);
    }
    return null;
  };
    
  const handleThumbnailUpload = async () => {
    if (selectedThumbnail) {
      const ipfsThumbnailLink = await handleIPFSUpload(new File([selectedThumbnail], 'thumbnail.png', { type: 'image/png' }));
      if (ipfsThumbnailLink) {
        console.log('Thumbnail link on IPFS:', ipfsThumbnailLink);
        setThumbnail(ipfsThumbnailLink);
      }
    }
  };
  
  
  
  const handleVideoUpload = async (file: File) => {
    const ipfsVideoLink = await handleIPFSUpload(file);
    if (ipfsVideoLink) { // Check here
      console.log("Video link on IPFS:", ipfsVideoLink);
      // Here you can set the IPFS video link to any state or variable as required.
    }
  };
  
  useEffect(() => {
    console.log("Staged Files:", selectedFiles);
}, [selectedFiles]);

// Function to generate a slug from a given string
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
}


const uploadToHive = async (
  title: string,
  markdownContent: string,
  thumbnail: string,
  allTags: string[],
  beneficiariesArray: BeneficiaryForBroadcast[],
  user: User
) => {
  const newMarkdownBody = generateMarkdownBody(selectedFiles, ipfsLinks);
setMarkdownBody(newMarkdownBody);

  const permlink = slugify(title.toLowerCase());
  
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
            beneficiaries: beneficiariesArray.map(b => ({
              account: b.account,
              weight: parseInt(b.weight, 10)
            }))
          }]
        ]
      };

      const operations = [
        ["comment",
          {
            "parent_author": "",
            "parent_permlink": "hive-173115",
            "author": username,
            "permlink": permlink,
            "title": title,
            "body": markdownContent,
            "json_metadata": JSON.stringify({
              tags: allTags,
              app: "skatehive",
              image: thumbnail ? [thumbnail] : []
            })
          }
        ],
        ["comment_options", commentOptions]
      ];
      try {
        const response: any = await new Promise((resolve, reject) => {
          window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(response);
            }
          });
        });
      
        if (response.success) {
          alert("Post successfully published!");
        } else {
          console.error("Error publishing post:", response.message);
        }
      } catch (error: any) {
        console.error("An error occurred:", error.message);
      }
      
    } else {
      alert("You have to log in with Hive Keychain to use this feature...");
    }
  } else {
    console.error("Hive Keychain extension not found!");
  }
};

const handlePublish = () => {
  // Construct the complete post body
  const completePostBody = `${description}\n\n${markdownBody}${showFooter ? defaultFooter : ''}`;
  console.log('title:', title);
  console.log('Complete Post Body:', completePostBody);
  const permlink = slugify(title.toLowerCase());
  // Log the object before calling uploadToHive
  const uploadObject = {
    title,
    description,
    completePostBody,
    thumbnail: thumbnail || '',
    allTags,
    beneficiariesArray,
    user,
  };
  console.log('Upload Object:', uploadObject);

  // Uncomment the following line to call uploadToHive
  // uploadToHive(title, completePostBody, thumbnail || '', allTags, beneficiariesArray, user);
};

const [videoDuration, setVideoDuration] = useState<number>(0);

// Use an effect to set the video duration once the video metadata is loaded
useEffect(() => {
  if (videoRef.current) {
    videoRef.current.addEventListener('loadedmetadata', () => {
      if (videoRef.current) {
        setVideoDuration(videoRef.current.duration);
      }
    });
  }
}, []);



  return (
    <Flex justifyContent="flex-start" alignItems="flex-start" flexDirection={{ base: 'column-reverse', md: 'row' }}>
    {/* Left Side */}
    <VStack width="100%" marginBottom={{ base: '10px', md: '0' }} padding="20px" spacing={4}>
    <VStack width="100%" alignItems="flex-start">
    <Text>1. Title</Text>
<Input
  placeholder="Title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
 </VStack>
        <VStack width="100%" alignItems="flex-start">

        <Text>2. Drag and Drop Section</Text>
        </VStack>
        <Box
          width="100%"
          height="120px"
          border="2px dashed gray"
          borderRadius="5px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Text>Drag & Drop files </Text>
        </Box>

        <VStack width="100%" alignItems="flex-start">

        <Text>3. Staged Videos and Photos</Text>
        </VStack>
<HStack>
  {selectedFiles.map((file, index) => (
    <Box
      key={index}
      border="1px solid #ccc"
      p={2}
      borderRadius="md"
      position="relative"
      cursor="pointer"
      onClick={() => handleThumbnailSelect(file)}
    >
      {file.type.includes('video') ? (
        <video src={URL.createObjectURL(file)} width="120px" height="80px" />
      ) : (
        <Image src={URL.createObjectURL(file)} alt="Selected File" maxH="80px" maxW="120px" />
      )}

      <Button
        position="absolute"
        right={2}
        top={2}
        size="sm"
        colorScheme="red"
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveFile(file);
        }}
      >
        X
      </Button>
      

    </Box>
  ))}
</HStack>

<VStack width="100%" alignItems="flex-start">
  <Text>4. Description</Text>
  <Input
    placeholder="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
</VStack>

        <VStack width="100%" alignItems="flex-start">
        <Textarea
  value={markdownBody}
  readOnly
  rows={10}
  cols={50}
  style={{ resize: 'none' }}
/>


        <Text>5. Select Thumbnail</Text>
        <Button border={"1px solid limegreen"} backgroundColor="black"  onClick={openVideoModal}>
              Set Thumbnail from Video
            </Button>
        </VStack>
        <HStack alignItems="flex-start" width="100%">
        <Button border={"1px solid red"} backgroundColor="black" onClick={() => setSelectedFile(null)}>
          Clear Thumbnail
        </Button>
        <Button colorScheme="blue" onClick={handlePublish}>
          Upload
        </Button>

        </HStack>

        {selectedFile && (
          <Box>
            {selectedFile.type.includes('video') ? (
              <video src={URL.createObjectURL(selectedFile)} width="240px" height="160px" />
            ) : (
              <Image src={URL.createObjectURL(selectedFile)} alt="Selected File" maxH="160px" maxW="240px" />
            )}

        
          </Box>
        
        )}


      </VStack>

      {/* Divider */}
      <Divider
        orientation="vertical"
        width={{ base: '100%', md: '1px' }}
        height={{ base: '1px', md: 'auto' }}
        mx={{ base: '0', md: '20px' }}
      />

      {/* Right Side */}
      <VStack width="100%" style={{ wordWrap: 'break-word', overflow: 'hidden', padding: '20px' }} spacing={4}>
        <Text fontSize="xl" fontWeight="bold">
          {title}
        </Text>
        {selectedFiles.map((file, index) => (
          <Box key={index} border="1px solid #ccc" p={2} borderRadius="md">
            {file.type.includes('video') ? (
              <video src={URL.createObjectURL(file)} width="320px" height="240px" controls />
            ) : (
              <Image src={URL.createObjectURL(file)} alt="Selected File" maxH="240px" maxW="320px" />
            )}
          </Box>
        ))}
      </VStack>

      {/* Video Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={closeVideoModal}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Set Thumbnail from Video</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {/* Video preview */}
      <video
        controls
        width="100%"
        ref={videoRef}
        src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
        onLoadedMetadata={(e) => {
          if (videoRef.current) {
            setVideoPreviewTime(videoRef.current.duration / 2);
          }
        }}
      />
      {/* Confirm button for thumbnail */}
      <input 
    type="range" 
    min="0" 
    max={videoDuration} 
    step="0.1" 
    value={videoPreviewTime} 
    onChange={handleSliderChange}
  />
      <Button colorScheme="red" onClick={clearThumbnail}>
              Clear Thumbnail
            </Button>
            {/* Confirm Thumbnail button */}
            <Button colorScheme="blue" onClick={handleVideoThumbnailConfirm}>
              Confirm Thumbnail
            </Button>
    </ModalBody>
  </ModalContent>
</Modal>

    </Flex>
  );
};

export default SimpleUploadPage;
