import React, { useState, useRef, RefObject, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  Textarea,
  Divider,
  VStack,
  Input,
  useMediaQuery,
  Button,
  Avatar,
  CloseButton,
  Checkbox,
  Badge,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { SkateboardLoading } from "../utils/videoUtils/VideoUtils";
import { MarkdownRenderersUpload } from "../utils/MarkdownRenderersUpload";
import { FaImage, FaVideo } from "react-icons/fa";
import useAuthUser from '../home/api/useAuthUser';
import rehypeRaw  from "rehype-raw";
import remarkGfm from "remark-gfm";
import { slugify } from "../utils/videoUtils/slugify";
import { Client } from '@hiveio/dhive';
import { KeychainSDK } from 'keychain-sdk';
import { Spinner } from "@chakra-ui/react";
import { defaultFooter } from "./defaultFooter";
import AuthorSearchBar from "./searchBar";

const apiEndpoints = [
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
];

const client = new Client(apiEndpoints);

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;

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
const defaultBeneficiaries: Beneficiary[] = [
  { name: 'beaglexv', percentage: 2 },
  { name: 'steemskate', percentage: 3 },
];
declare global {
  interface Window {
    hive_keychain: any;
  }
}
const NewUpload: React.FC = () => {
  const [markdownText, setMarkdownText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const { user } = useAuthUser() as { user: User | null };
  const avatarUrl = `https://images.ecency.com/webp/u/${user?.name}/avatar/small`;
  const [tagsInput, setTagsInput] = useState<string>(""); // State for tags input
  const [tags, setTags] = useState<string[]>(["crowsnight666"]); // State to store tags
  const [includeFooter, setIncludeFooter] = useState<boolean>(false); // New state for the checkbox
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownText(event.target.value);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const addImageToMarkdown = () => {
    if (imageUrl) {
      setMarkdownText((prevMarkdown) => `${prevMarkdown}\n![Image](${imageUrl})`);
      setThumbnailUrl(imageUrl);
    }
  };

  const uploadFileToIPFS = async (file: File) => {
    try {
      if (file.type.startsWith("video/mp4")) {
        // Handle video file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.set("Content-Type", "multipart/form-data");
  
        const response = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              "pinata_api_key": PINATA_API_KEY,
              "pinata_secret_api_key": PINATA_API_SECRET,
            },
            body: formData,
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;
  
          setUploadedVideo(ipfsUrl);
  
          const transformedLink = `<iframe src="${ipfsUrl}"></iframe>` + " ";
  
          setMarkdownText((prevMarkdown) => prevMarkdown + `\n${transformedLink}` + '\n');
          setUploadedFiles((prevFiles) => [...prevFiles, ipfsUrl]);
        } else {
          const errorData = await response.json();
          console.error("Error uploading video file to Pinata IPFS:", errorData);
        }
      } else if (file.type.startsWith("image/")) {
        // Handle image file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.set("Content-Type", "multipart/form-data");
  
        const response = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              "pinata_api_key": PINATA_API_KEY,
              "pinata_secret_api_key": PINATA_API_SECRET,
            },
            body: formData,
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;
  
          const transformedLink = ` ![Image](${ipfsUrl})` + " ";
  
          setMarkdownText((prevMarkdown) => prevMarkdown + `\n${transformedLink}` + '\n');
          setUploadedFiles((prevFiles) => [...prevFiles, ipfsUrl]);
        } else {
          const errorData = await response.json();
          console.error("Error uploading image file to Pinata IPFS:", errorData);
        }
      } else {
        alert("Invalid file type. Only video files (MP4) and images are allowed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  

  const onDropImages = async (acceptedFiles: File[]) => {
    setIsUploading(true);

    for (const file of acceptedFiles) {
      await uploadFileToIPFS(file);
    }

    setIsUploading(false);
  };

  const onDropVideos = async (acceptedFiles: File[]) => {
    setIsUploading(true);

    for (const file of acceptedFiles) {
      await uploadFileToIPFS(file);
    }

    setIsUploading(false);
  };

  const { getRootProps: getImagesRootProps, getInputProps: getImagesInputProps } =
    useDropzone({
      onDrop: onDropImages,
      //@ts-ignore
      accept: "image/*",
      multiple: false,
    });

  const { getRootProps: getVideosRootProps, getInputProps: getVideosInputProps } =
    useDropzone({
      onDrop: onDropVideos,
      //@ts-ignore
      accept: "video/mp4",
      multiple: false,
    });

  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const extractImageUrls = (markdownText: string): string[] => {
    const regex = /!\[.*?\]\((.*?)\)/g;
    const imageUrls: string[] = [];
    let match = regex.exec(markdownText);
    while (match) {
      imageUrls.push(match[1]);
      match = regex.exec(markdownText);
    }
    return imageUrls;
  };

  const renderThumbnailOptions = () => {
    const selectedThumbnailStyle = {
      border: '2px solid limegreen',
    };

    const imageUrls = extractImageUrls(markdownText);

    const options = imageUrls.map((imageUrl, index) => (
      <Box
        key={index}
        cursor="pointer"
        width="100px"
        height="100px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        onClick={() => {
          setThumbnailUrl(imageUrl);
          console.log("Selected Thumbnail:", imageUrl); // Log selected thumbnail URL
        }}
        style={imageUrl === thumbnailUrl ? selectedThumbnailStyle : {}}
      >
        <img
          src={imageUrl}
          alt={`Thumbnail ${index}`}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </Box>
    ));

    return options;
  };
  const handleHiveUpload = () => {

    if (user && title) {
      const username = user?.name;
      if (username) {
        const permlink = slugify(title.toLowerCase());
  
        // Define your comment options (e.g., max_accepted_payout, beneficiaries, etc.)
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
  
        // Add defaultFooter to the markdown if includeFooter is true
        let finalMarkdown = markdownText;
        if (includeFooter) {
          finalMarkdown += "\n" + defaultFooter;
        }
  
        // Define the post operation
        const postOperation = [
          'comment',
          {
            parent_author: '',
            // parent_permlink: 'testing67',
            parent_permlink: process.env.COMMUNITY || 'hive-173115',
            author: username,
            permlink: permlink,
            title: title,
            body: finalMarkdown, // Use the complete post body here
            json_metadata: JSON.stringify({
              tags: tags, // Pass the 'tags' array here
              app: 'CrowsNight',
              image: thumbnailUrl ? [thumbnailUrl] : [], // Replace 'thumbnailIpfsURL' with 'thumbnailUrl'
            }),
          },
        ];
  
        // Define the comment options operation
        const commentOptionsOperation = ['comment_options', commentOptions];
  
        // Construct the operations array
        const operations = [postOperation, commentOptionsOperation];
  
        // Request the broadcast using Hive Keychain
        window.hive_keychain.requestBroadcast(username, operations, 'posting', (response: any) => {
          if (response.success) {
            window.alert('Post successfully published on Hive!');
          } else {
            console.error('Error publishing post on Hive:', response.message);
          }
        });
      } else {
        alert('You have to log in with Hive Keychain to use this feature...');
      }
    }
  };
  
  
// Function to handle changes in the tags input field
const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = event.target.value;
  // Check if the last character is a comma or space
  if (inputValue.endsWith(',') || inputValue.endsWith(' ')) {
    // Extract the new tag without the comma or space
    const newTag = inputValue.slice(0, -1).trim();
    if (newTag) {
      // Add the new tag to the tags list
      setTags([...tags, newTag]);
      // Clear the input field
      setTagsInput('');
    }
  } else {
    // Update the input field with the current value
    setTagsInput(inputValue);
  }
};

// Function to render the tags as badges
const renderTags = () => {
  return tags.map((tag, index) => (
    <Flex
      key={index}
      alignItems="center"
      justifyContent="space-between"
      marginRight={2}
      position="relative"
    >
      <Box
        as="span" // Use a span to wrap Badge and CloseButton
        _hover={{
          cursor: "pointer",
          "& > .badge-close-button": {
            opacity: 1, // Show the CloseButton on hover
          },
        }}
      >
        <Badge
          colorScheme="teal"
          variant="subtle"
          marginTop={"10px"}
        >
          {tag}
        </Badge>
        {tag !== "crowsnight666" && (
          <CloseButton
            size="xs"
            color="red.500"
            position="absolute"
            top="5px" // Adjust the top position as needed
            right="-10px" // Adjust the right position as needed
            opacity={0} // Initially hide the CloseButton
            transition="opacity 0.2s ease-in-out" // Add a smooth transition effect
            className="badge-close-button" // Add a class name for easier targeting
            onClick={() => {
              // Check if the tag is not "crowsnight666" before removing it
              if (tag !== "crowsnight666") {
                const newTags = [...tags];
                newTags.splice(index, 1);
                setTags(newTags);
              }
            }}
          />
        )}
      </Box>
    </Flex>
  ));
};



    // Function to parse and set the tags
    const handleTagsSubmit = () => {
      // Split the input value by commas and trim whitespace
      const newTags = tagsInput.split(",").map((tag) => tag.trim());
      setTags(newTags);
      // Clear the input field
      setTagsInput("");
    };
  
// Function to handle the checkbox change
const handleIncludeFooterChange = () => {
  setIncludeFooter((prevIncludeFooter) => !prevIncludeFooter);
  if (includeFooter) {
    // If the toggle is turned off, remove the default footer from Markdown text
    setMarkdownText((prevMarkdown) =>
      prevMarkdown.replace(defaultFooter, "")
    );
  } else {
    // If the toggle is turned on, add the default footer to Markdown text
    setMarkdownText((prevMarkdown) => prevMarkdown + defaultFooter);
  }
};

      // -------------------------Add Beneficiaries--------------------------

  const searchBarRef: RefObject<HTMLDivElement> = useRef(null);

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
      const toggleAdvancedOptions = () => {
        setShowAdvancedOptions((prevShow) => !prevShow);
      };
      
      return (
        <Box>
          <center>
            <Badge color="black" bg={"yellow"} marginTop={"15px"}>
              se este for o seu primeiro post na crowsnightapp, por favor veja nosso{" "}
              <a
                href="https://docs.skatehive.app/docs/tutorial-basics/share-ur-content"
                style={{ color: 'blue' }}
              >
                Tutorial
              </a>{" "}
              primeiro
            </Badge>
          </center>
          <Flex
            flexDirection={isMobile ? "column" : "row"}
            justifyContent="center"
            alignItems="stretch"
          >
            <Box flex={isMobile ? "auto" : 1} p={4}>
              <Box marginBottom={4}>
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Enter title here..."
                  fontSize="xl"
                  fontWeight="bold"
                />
              </Box>
              <Flex flexDirection={isMobile ? "column" : "row"}>
                <Box flex={1} marginRight={isMobile ? 0 : 4}>
                  <VStack
                    {...getImagesRootProps()}
                    cursor="pointer"
                    borderWidth={2}
                    borderRadius={10}
                    borderStyle="dashed"
                    borderColor="gray.300"
                    p={6}
                    alignItems="center"
                    justifyContent="center"
                    flex="auto"
                  >
                    <input {...getImagesInputProps()} />
                    <FaImage size={32} />
                    <Text> Drop images/video or click to select</Text>
                    
                  </VStack>
              <Box marginTop={4}>
                <center>
                  {isUploading ? (
                    <Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="limegreen"
                      size="xl"
                    />
                  ) : null}
                </center>
              </Box>

                  <Textarea
  value={markdownText}
  onChange={handleMarkdownChange}
  placeholder="Enter your Markdown here..."
  minHeight="600px"
  marginTop={4}
/>
<Checkbox
                      isChecked={includeFooter}
                      onChange={handleIncludeFooterChange}
                      marginLeft={2}
                    >
                      Include Skatehive Footer
                    </Checkbox>
                    <Box marginTop={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      Thumbnail Options
                    </Text>
                    <Flex flexWrap="wrap">{renderThumbnailOptions()}</Flex>
                  </Box>
                </Box>
              </Flex>
              <Button onClick={toggleAdvancedOptions} colorScheme="teal" size="sm" marginTop={2} marginRight={2}>
                {showAdvancedOptions ? 'Hide Advanced Options' : ' Advanced Options'}
              </Button>
              {showAdvancedOptions && (
                <>

                  <Box marginTop={4}>
                    <div ref={searchBarRef}>
                      <Text fontSize="lg" fontWeight="bold">
                        Valor destinado para o fotógrafo
                      </Text>
                      <AuthorSearchBar onSearch={handleAuthorSearch} />
                      {beneficiaries.map((beneficiary, index) => (
                        <div key={index}>
                          <p>
                            {beneficiary.name} - {beneficiary.percentage}%
                          </p>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={beneficiary.percentage}
                            onChange={(e) =>
                              handleBeneficiaryPercentageChange(index, parseFloat(e.target.value))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </Box>
                  <Box marginTop={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      #hashtags
                    </Text>
                    <Flex alignItems="center">
                      <Input
                        value={tagsInput}
                        onChange={handleTagsChange}
                        placeholder="Enter tags separated by commas"
                        marginRight={2}
                      />

                    </Flex>

                  </Box>

                </>
              )}
                                <Flex alignItems="center">{renderTags()}</Flex>

              <Button onClick={handleHiveUpload} colorScheme="teal" size="sm" marginTop={2}>
                Publish!
              </Button>
            </Box>
            <Box
              flex={isMobile ? "auto" : 1}
              p={4}
              border="1px solid white"
              margin={"15px"}
              borderRadius={"10px"}
              maxWidth={{ base: "100%", md: "50%" }}
              overflowWrap="break-word"
            >
              <Box>
                <Flex padding="1%" borderRadius="10px" border="1px solid white" align="center" mb={4}>
                  <Avatar border="1px solid black" src={avatarUrl} size="sm" />
                  <Text ml={2} fontWeight="bold">
                    {user?.name}
                  </Text> 
                  <Text  marginLeft={"10px"} fontSize={"36px"} fontWeight={"bold"}> | </Text>
                  <Text ml={3} fontWeight="bold" style={{ wordBreak: "break-all", maxWidth: "100%", color:'white' }}>
                    {title}
                  </Text>
                </Flex>
                <Divider />
              </Box>
              <ReactMarkdown
                children={markdownText}
                components={{
                  ...MarkdownRenderersUpload,
                }}
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]} 
              />
              <Flex alignItems="center">{renderTags()}</Flex>
            </Box>
          </Flex>
        </Box>
      );
      
      
    
    
    
};

export default NewUpload;
