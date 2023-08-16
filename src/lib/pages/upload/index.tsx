import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Hive Imports 
import useAuthUser from '../home/components/useAuthUser';
import { KeychainSDK } from 'keychain-sdk';
import { defaultFooter } from './defaultFooter'; // Import the defaultFooter constant

import axios, { AxiosResponse, AxiosError, AxiosProgressEvent } from 'axios';


import {
  Box,
  Flex,
  Textarea,
  Divider,
  Button,
  Input,
  Checkbox,
  Select,
  Text
} from '@chakra-ui/react';


interface UploadPageProps {
  title: string;
  content: string;
  author: string;
  user: any;
  permlink: string;
  weight: number; // Change this to allow any number value
}

interface User {
  name?: string;
}

declare global {
  interface Window {
    hive_keychain: any;
  }
}

const keychain = new KeychainSDK(window);



const UploadPage: React.FC<UploadPageProps> = () => {
  // User 
  const { user } = useAuthUser() as { user: User | null };
  // Post 
  const [title, setTitle] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [showFooter, setShowFooter] = useState(false);
  const [videoLink, setVideoLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [image, setImage] = useState(''); // Add this line
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [addedImages, setAddedImages] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Initial value
  const [isUploading, setIsUploading] = useState(false);



  
  const PINATA_API_KEY = 'de64c0e69ab6e9098424';
  const PINATA_API_SECRET = 'bbab398cbebee9138a0f6c9008f75e973221e4a195d7dcafe755355be824cbd7';
  
  const handleIPFSUpload = async () => {
    setIsUploading(true); // Set to true at the beginning

    if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('pinataMetadata', JSON.stringify({
            name: selectedFile.name
        }));

        try {
            const response: AxiosResponse<any> = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                  const total = progressEvent.total || 1; // Fallback to 1 if undefined
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                  setUploadProgress(percentCompleted);
              }
              
              
            });

            const ipfsHash = response.data.IpfsHash;
            const ipfsLink = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

            setMarkdownContent(`${markdownContent}\n\n![Uploaded image should load here](${ipfsLink})`);
            setSelectedFile(null);
            
            if (response && response.data && response.data.IpfsHash) {
                const ipfsLink = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
                setThumbnail(ipfsLink);
                if (ipfsLink) {
                    setAddedImages(prev => [...prev, ipfsLink]);
                }
            }
            setUploadProgress(0);  
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const serverError: AxiosError = error;
                console.error("Axios error:", serverError.message);
            } else {
                console.error("An error occurred:", error.message);
            }
            setUploadProgress(0);  
            alert("Error uploading file to IPFS.");
        } finally {
            setIsUploading(false);
        }
    }
};




const handleUploadFromURL = async () => {
  if (!image) {
      alert("Please enter a valid image URL.");
      return;
  }

  try {
      // Verify the image URL by fetching the image
      const response = await fetch(image);
      setMarkdownContent(`${markdownContent}\n\n![Uploaded image should load here](${image})`);

      if (!response.ok) {
          throw new Error("Failed to verify the image.");
      }

      // If the fetch was successful, we assume the image URL is valid
      setThumbnail(image); // set the image URL as thumbnail
      setAddedImages(prev => [...prev, image]); // add the image URL to the added images list

  } catch (error) {
      console.error("Error verifying the image:", error);
      alert("Failed to verify the image. Please check the URL.");
  }
};


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        setSelectedFile(event.target.files[0]);
    }
  };


  const getYouTubeEmbedURL = (url: string) => {
    const videoId = url.split('v=')[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleAddVideo = () => {
    const embedURL = getYouTubeEmbedURL(videoLink);
    setMarkdownContent(
      `${markdownContent}\n\n<iframe src="${embedURL}"></iframe>`
    );
    setVideoLink('');
  };

  
  const [selectedOption, setSelectedOption] = useState<'url' | 'file'>('url'); // Add this state
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

  const handlePublish = () => {
    // Construct the complete post body
    
    const completePostBody = `${markdownContent}
      ${showFooter ? defaultFooter : ''}`;
    
    // Log the complete post body
    console.log('Title: ' ,title)
    console.log('Complete Post Body:', completePostBody);

    const permlink = slugify(title.toLowerCase());
    if (window.hive_keychain) { 
      // Check if the Hive Keychain extension is available
      const username = user?.name; // Assuming you get the logged-in user's name from the useAuthUser hook or similar
  
      if (username) {
        const operations = [
          ["comment",
            {
              "parent_author": "", // only for comments 
              "parent_permlink": "hive-173115", 
              "author": username,
              "permlink": permlink, 
              "title": title, 
              "body": completePostBody, 
              "json_metadata": JSON.stringify({ tags: ["skateboard"],
                                                app: "pepeskate", 
                                                image: thumbnail ? [thumbnail] : [] // This will be an array with the thumbnail URL as the first item
              })
            }
          ]
        ];
        console.log("OPERATIONS: ", operations)
        window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
          if (response.success) {
            window.alert("Post successfully published!");
            // Here, you might want to redirect users to their post or show a success notification
          } else {
            console.error("Error publishing post:", response.message);
            // Handle the error, e.g., by showing an error notification to the user
          }
        });
      } else {
        alert("You have to login with Hive Keychain to use this feature, if you are on desktop simply connect in the right top navigation bar, in mobile access this website in Hive Keychain native browser");
        // Prompt user to login or show an appropriate message
      }
    } else {
      console.error("Hive Keychain extension not found!");
      // Inform the user to install the Hive Keychain extension
    }
  };
  
  const handleImageSelection = (imageUrl: string) => {
    setSelectedThumbnail(imageUrl);
  };
  
  const ImageGallery = () => {
    const galleryStyles = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', // Three columns
      gap: '10px', // Gap between items
    };
  
    return (
      <Box style={galleryStyles}>
        {addedImages.map((img, idx) => (
          <Box key={idx} padding="10px" borderRadius="10px" border={selectedThumbnail === img ? '3px solid green' : '1px solid white'} onClick={() => handleImageSelection(img)}>
            <img src={img} alt="Uploaded" width="100" height="100" />
          </Box>
        ))}
      </Box>
    );
  };
  

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  
  return (
      <>
        {isUploading && (
          <div style={overlayStyle}>
            <Box width="100%" height="4px" backgroundColor="rgba(0,0,0,0.1)">
              <Box
                width={`${uploadProgress}%`}
                height="100%"
                backgroundColor="limegreen"
                transition="width 0.3s"
              />
            </Box>
          </div>
        )}
    <Flex
      justifyContent="center"
      alignItems="flex-start"
      flexDirection={{ base: 'column-reverse', md: 'row' }} // Stack vertically on mobile, side-by-side on desktop
      padding="20px"
    >
      <Box width="100%" marginBottom={{ base: '20px', md: '0' }}>
        <Text>1. Add Title</Text>
        <Input
          value={title}
          placeholder="Post Title"
          marginBottom="10px"
          onChange={(e) => setTitle(e.target.value)}
        />
        <Text>2. Add Video</Text>
        <Flex>
          <Input
            value={videoLink}
            placeholder="YouTube Video URL"
            marginBottom="10px"
            onChange={(e) => setVideoLink(e.target.value)}
          />
          <Button onClick={handleAddVideo}>Add Video</Button>
        </Flex>
        <Text>3. Add Images</Text>
        <Flex>
          {selectedOption === 'url' ? (
            <>
              <Input
                value={image}
                placeholder="Image URL"
                marginBottom="10px"
                onChange={(e) => setImage(e.target.value)}
              />
              <Button onClick={handleUploadFromURL}>Add</Button>
            </>
          ) : (
            <>

            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Button onClick={handleIPFSUpload}>Upload</Button>
            </>
          )}
          <Flex>
            <Select
              value={selectedOption}
              onChange={(e) =>
                setSelectedOption(e.target.value as 'url' | 'file')
              }
            >
              <option value="url">URL</option>
              <option value="file">Upload</option>
            </Select>
          </Flex>
        </Flex>
        <Text>4. Your Blog</Text>
        <Textarea
          value={markdownContent}
          onChange={(e) => setMarkdownContent(e.target.value)}
          placeholder="Write your markdown content here..."
          height="300px"
        />
        <Checkbox
          isChecked={showFooter}
          onChange={() => setShowFooter(!showFooter)}
        >
          Add Skatehive Footer
        </Checkbox>
        <Text>5. Add Thumbnail</Text>
          <ImageGallery />
       <Box borderRadius="10px"border="1px solid limegreen" width="100%">
          <Button onClick={handlePublish} width="100%">
            Publish
          </Button>
        </Box>
      </Box>
              
      <Divider
        orientation="vertical"
        width={{ base: '100%', md: '1px' }} // Full width on mobile, thin line on desktop
        height={{ base: '1px', md: 'auto' }} // Thin line on mobile, full height on desktop
        mx={{ base: '0', md: '20px' }}
      />
      
      <Box width="100%" style={{ wordWrap: "break-word", overflow: "hidden" }}>
        <Text fontSize="36" fontWeight="bold" mb="10px">
          {title}
        </Text>
        <ReactMarkdown
          children={markdownContent}
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, alt, src, title, ...props }) => (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  {...props}
                  alt={alt}
                  src={src}
                  title={title}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    border: '1px solid limegreen',
                  }}
                />
              </div>
            ),
            a: ({ node, children, ...props }) => (
              <a {...props} style={{ color: 'yellow' }}>
                {children}
              </a>
            ),
            h1: ({ node, children, ...props }) => (
              <h1
                {...props}
                style={{ fontWeight: 'bold', color: 'yellow', fontSize: '24px' }}
              >
                {children}
              </h1>
            ),
            h2: ({ node, children, ...props }) => (
              <h2
                {...props}
                style={{ fontWeight: 'bold', color: 'yellow', fontSize: '20px' }}
              >
                {children}
              </h2>
            ),
            h3: ({ node, children, ...props }) => (
              <h3
                {...props}
                style={{ fontWeight: 'bold', color: 'yellow', fontSize: '18px' }}
              >
                {children}
              </h3>
            ),
            blockquote: ({ node, children, ...props }) => (
              <blockquote
                {...props}
                style={{
                  borderLeft: '3px solid limegreen',
                  paddingLeft: '10px',
                  fontStyle: 'italic',
                }}
              >
                {children}
              </blockquote>
            ),
            ul: ({ node, children, ...props }) => (
              <ul style={{ paddingLeft: '20px' }} {...props}>
                {children}
              </ul>
            ),
            ol: ({ node, children, ...props }) => (
              <ol style={{ paddingLeft: '20px' }} {...props} >
                {children}
              </ol>
            ),
            iframe: ({ node, ...props }) => (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <iframe {...props} />
              </div>
            ),
          }}
          
        />
        {showFooter && (
          
          <ReactMarkdown
            children={defaultFooter}
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, alt, src, title, ...props }) => (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    {...props}
                    alt={alt}
                    src={src}
                    title={title}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '10px',
                      border: '1px solid limegreen',
                    }}
                  />
                </div>
              ),
              a: ({ node, children, ...props }) => (
                <a {...props} style={{ color: 'yellow' }}>
                  {children}
                </a>
              ),
              h1: ({ node, children, ...props }) => (
                <h1
                  {...props}
                  style={{ fontWeight: 'bold', color: 'yellow', fontSize: '24px' }}
                >
                  {children}
                </h1>
              ),
              h2: ({ node, children, ...props }) => (
                <h2
                  {...props}
                  style={{ fontWeight: 'bold', color: 'yellow', fontSize: '20px' }}
                >
                  {children}
                </h2>
              ),
              h3: ({ node, children, ...props }) => (
                <h3
                  {...props}
                  style={{ fontWeight: 'bold', color: 'yellow', fontSize: '18px' }}
                >
                  {children}
                </h3>
              ),
              blockquote: ({ node, children, ...props }) => (
                <blockquote
                  {...props}
                  style={{
                    borderLeft: '3px solid limegreen',
                    paddingLeft: '10px',
                    fontStyle: 'italic',
                  }}
                >
                  {children}
                </blockquote>
              ),
              ul: ({ node, children, ...props }) => (
                <ul style={{ paddingLeft: '20px' }} {...props}>
                  {children}
                </ul>
              ),
              ol: ({ node, children, ...props }) => (
                <ol style={{ paddingLeft: '20px' }} {...props}>
                  {children}
                </ol>
              ),
              iframe: ({ node, ...props }) => (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <iframe {...props} />
                </div>
              ),
            }}
            
          />
          
        )}
      </Box>
    </Flex>
      </>
  );
  
  
  
};

export default UploadPage;


