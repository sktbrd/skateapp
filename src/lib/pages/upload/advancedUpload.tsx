import React, { useState , useRef, useEffect } from 'react';
import { RefObject } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Hive Imports 
import useAuthUser from '../home/api/useAuthUser';
import { KeychainSDK } from 'keychain-sdk';
import { defaultFooter } from './defaultFooter'; // Import the defaultFooter constant
import AuthorSearchBar from './searchBar';
import axios, { AxiosResponse, AxiosError, AxiosProgressEvent } from 'axios';
import { FaBold, FaItalic } from 'react-icons/fa'; // Import font awesome icons

import MarkdownComponents, { MarkdownBlockquote, MarkdownAnchor, MarkdownH1, MarkdownH2, MarkdownH3, MarkdownUl, MarkdownOl, MarkdownIframe } from './MarkdownComponents';
import { Box, Flex, Textarea, Divider, Button, Input, Checkbox, Select, Text, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';


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

const keychain = new KeychainSDK(window);
const defaultBeneficiaries: Beneficiary[] = [
  { name: 'skatehacker', percentage: 2 },
  { name: 'steemskate', percentage: 3 },
];

const AdvancedUpload: React.FC<UploadPageProps> = () => {
  // User 
  const { user } = useAuthUser() as { user: User | null };
  // Post 

  // ---------------------------Title ------------------------------
  const [title, setTitle] = useState('');


  // ---------------------------Add Video ------------------------------
  const [videoLink, setVideoLink] = useState('');

  const getYouTubeEmbedURL = (url: string) => {
    const videoId = url.split('v=')[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };
  const handleAddVideo = () => {
    let embedURL = '';
  
    if (videoLink.includes("youtube.com")) {
      embedURL = getYouTubeEmbedURL(videoLink);
    } else if (videoLink.includes("odysee.com")) {
      embedURL = videoLink.replace("odysee.com/", "odysee.com/$/embed/");
    } else {
      alert("Invalid video link. Please enter a valid YouTube or Odysee video link.");
      return;
    }
  
    setMarkdownContent(
      `${markdownContent}\n\n<iframe src="${embedURL}" allowfullscreen></iframe>`
    );
    setVideoLink('');
  };
  // ---------------------------Add Images ------------------------------
  const [image, setImage] = useState(''); // Add this line
  const [uploadProgress, setUploadProgress] = useState(0); // Initial value
  const [addedImages, setAddedImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const PINATA_API_KEY = 'f382d9b820088964b995';
  const PINATA_API_SECRET = '818eab92027191ccbdcdaabb08046745da75c78f5adab06099371a2ee518a4fd';
  const [selectedOption, setSelectedOption] = useState<'url' | 'file'>('url'); 

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


  // ---------------------------Add Body------------------------------

  const [markdownContent, setMarkdownContent] = useState('');
  const [showFooter, setShowFooter] = useState(false);
  const [selectedHeadingLevel, setSelectedHeadingLevel] = useState<number>(1);

  const handleBoldText = () => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      const beforeSelectedText = markdownContent.substring(0, markdownContent.indexOf(selectedText));
      const afterSelectedText = markdownContent.substring(markdownContent.indexOf(selectedText) + selectedText.length);
      setMarkdownContent(`${beforeSelectedText} **${selectedText}** ${afterSelectedText}`);
    }
  };
  
  const handleItalicText = () => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      const beforeSelectedText = markdownContent.substring(0, markdownContent.indexOf(selectedText));
      const afterSelectedText = markdownContent.substring(markdownContent.indexOf(selectedText) + selectedText.length);
      setMarkdownContent(`${beforeSelectedText} *${selectedText}* ${afterSelectedText}`);
    }
  };

  const handleHeadingText = (level: number) => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      const beforeSelectedText = markdownContent.substring(0, markdownContent.indexOf(selectedText));
      const afterSelectedText = markdownContent.substring(markdownContent.indexOf(selectedText) + selectedText.length);
      const headingText = `${"#".repeat(level)} ${selectedText}`; // Add '#' symbols based on heading level
      setMarkdownContent(`${beforeSelectedText}${headingText} ${afterSelectedText}`);
    }
  };

  // ---------------------------Add Thumbnail----------------------------

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);


  const [isUploading, setIsUploading] = useState(false);
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
  const handleImageSelection = (imageUrl: string) => {
    setSelectedThumbnail(imageUrl);
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
  // ---------------------------Add Tags-------------------------------

  const [tags, setTags] = useState<string[]>(Array(5).fill('')); // Initialize with an array of 5 empty strings


  const searchBarRef: RefObject<HTMLDivElement> = useRef(null);

  const allTags = ["skateboard", ...tags.filter(tag => tag.trim() !== '')]; // This will combine the default tag with the user-added tags and filter out any empty tags


  // ---------------------------Add Tags-------------------------------
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };
  
  // -------------------------Add Beneficiaries--------------------------

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const handleAuthorSearch = (searchUsername: string) => {
    const percentage = 10;

    // Check if the beneficiary already exists
    const beneficiaryExists = beneficiaries.some(b => b.name === searchUsername);

    if (!beneficiaryExists && percentage > 0) {
        const newBeneficiary = { name: searchUsername, percentage };
        setBeneficiaries(prevBeneficiaries => [...prevBeneficiaries, newBeneficiary]);
        alert(`Beneficiary ${searchUsername} added! Please set the percentage using the sliders below.`);
    } else {
        alert(`Beneficiary ${searchUsername} already exists or percentage is zero.`);
    }

    console.log("Search username:", searchUsername);
    console.log(beneficiariesArray)
};

  const handleBeneficiaryPercentageChange = (index: number, newPercentage: number) => {
    const updatedBeneficiaries = [...beneficiaries];
    updatedBeneficiaries[index].percentage = newPercentage;
    setBeneficiaries(updatedBeneficiaries);
  };

  const beneficiariesArray: BeneficiaryForBroadcast[] = [
    ...beneficiaries,
    ...defaultBeneficiaries,
  ].sort((a, b) => a.name.localeCompare(b.name))
    .map(beneficiary => ({
      account: beneficiary.name,
      weight: (beneficiary.percentage * 100).toFixed(0),
    }));

    const handleClickOutside = (event:any) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
          // Close the search results here
      }
    };
      useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

  // ----------------------------PUBLISH-----------------------------


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

  const handlePublish = () => {
  // Construct the complete post body
  const completePostBody = `${markdownContent}${showFooter ? defaultFooter : ''}`;

  // Log the complete post body
  console.log('Title: ' ,title);
  console.log('Complete Post Body:', completePostBody);

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
                        weight: parseInt(b.weight, 10) // Convert the weight string to an integer
                    }))
                }]
            ]
          };

          const operations = [
              ["comment",
                  {
                      "parent_author": "",
                      "parent_permlink": JSON.stringify(process.env.COMMUNITY) || 'hive-173115',
                      "author": username,
                      "permlink": permlink,
                      "title": title,
                      "body": completePostBody,
                      "json_metadata": JSON.stringify({
                          tags: allTags,
                          app: "skatehive",
                          image: thumbnail ? [thumbnail] : []
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
    >
      <Box width="100%" marginBottom={{ base: '10px', md: '0' }}>
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
            placeholder="YouTube/Odysee Video URL"
            marginBottom="10px"
            onChange={(e) => setVideoLink(e.target.value)}
          />
          <Button border="1px solid limegreen" onClick={handleAddVideo}>Add Video</Button>
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
              <Button border="1px solid limegreen" onClick={handleUploadFromURL}>Insert</Button>
            </>
          ) : (
            <>

            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Button onClick={handleIPFSUpload} isDisabled={!selectedFile}>Upload</Button>
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
        <Flex alignItems="center" marginBottom="10px">
  <Button border="1px solid limegreen" onClick={handleBoldText}>
    <FaBold />
  </Button>
  <Button border="1px solid limegreen" onClick={handleItalicText}>
    <FaItalic />
  </Button>
      </Flex>
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
          <Text>6. Add Tags</Text>
<Flex marginBottom="10px">
  {tags.map((tag, index) => (
    <Input
      key={index}
      value={tag}
      placeholder={`Tag ${index + 1}`}
      onChange={(e) => handleTagChange(index, e.target.value)}
      marginRight="10px"
      width="20%" // Distribute the width equally for 5 tags
    />
  ))}
</Flex>
<Text>7. Split with your Fotografer/VideoMaker</Text>
<Flex marginBottom="10px">
  
<div ref={searchBarRef}>

<AuthorSearchBar onSearch={handleAuthorSearch} />
          {beneficiaries.map((beneficiary, index) => (
            <div key={index}>
              <p>{beneficiary.name} - {beneficiary.percentage}%</p>
              <input
                type="range"
                min="0"
                max="100"
                value={beneficiary.percentage}
                onChange={(e) => handleBeneficiaryPercentageChange(index, parseFloat(e.target.value))}
              />
            </div>
          ))}

</div> 
</Flex>

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
            ...MarkdownComponents,
            blockquote: MarkdownBlockquote,
            a: MarkdownAnchor,
            h1: MarkdownH1,
            h2: MarkdownH2,
            h3: MarkdownH3,
            ul: MarkdownUl,
            ol: MarkdownOl,
            iframe: MarkdownIframe,
          }}          
        />
        {showFooter && (
          
          <ReactMarkdown
            children={defaultFooter}
            remarkPlugins={[remarkGfm]}
            components={{
              ...MarkdownComponents,
              blockquote: MarkdownBlockquote,
              a: MarkdownAnchor,
              h1: MarkdownH1,
              h2: MarkdownH2,
              h3: MarkdownH3,
              ul: MarkdownUl,
              ol: MarkdownOl,
              iframe: MarkdownIframe,
            }}
          />
          
        )}
      </Box>
    </Flex>
      </>
  );
};

export default AdvancedUpload;


