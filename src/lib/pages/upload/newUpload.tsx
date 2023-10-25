import React, { useState } from "react";
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
import { slugify } from "../utils/videoUtils/VideoUtils";
import { Client } from '@hiveio/dhive';
import { KeychainSDK } from 'keychain-sdk';


const client = new Client('https://api.hive.blog');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;

interface User {
  name?: string;
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

        if (file.type.startsWith("video")) {
          setUploadedVideo(ipfsUrl);
        }

        const transformedLink = file.type.startsWith("video")
        ? `<iframe src="${ipfsUrl}"></iframe>` + ""
        : `![Image](${ipfsUrl})` + "";
      
      
        setMarkdownText((prevMarkdown) => prevMarkdown + `\n${transformedLink}`);
        setUploadedFiles((prevFiles) => [...prevFiles, ipfsUrl]);
      } else {
        const errorData = await response.json();
        console.error("Error uploading file to Pinata IPFS:", errorData);
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
    // Replace 'ipfsLink' with 'uploadedVideo'
    if (uploadedVideo) {
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
  
        // Define the post operation
        const postOperation = [
          'comment',
          {
            parent_author: '',
            parent_permlink: 'test666',
            author: username,
            permlink: permlink,
            title: title,
            body: markdownText, // Use the complete post body here
            json_metadata: JSON.stringify({
              tags: ['test'],
              app: 'skatehive',
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
  
  return (
    <Box>
      <center>
        <Badge bg={"yellow"} marginTop={"15px"}>
          If it's your first time uploading to SkateHive, please check our{" "}
          <a
            href="https://docs.skatehive.app/docs/tutorial-basics/share-ur-content"
            style={{ color: 'blue' }}
          >
            Tutorial
          </a>{" "}
          First
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
            </Box>

            {isUploading && <SkateboardLoading progress={progress} />}

          </Flex>
          {/* {uploadedVideo && (
            <Box marginBottom={4}>
              <video
                style={{ borderRadius: "15px", marginTop:"10px", border: "1px solid limegreen" }}
                src={uploadedVideo}
                controls
                width="100%"
              ></video>
            </Box>
          )} */}
          <Box marginTop={4}>
            <Input
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="Enter image URL"
              marginTop={2}
            />
            <Button
              onClick={addImageToMarkdown}
              colorScheme="teal"
              size="sm"
              marginTop={2}
            >
              📸 Add Image to Post
            </Button>
          </Box>
          <Textarea
            value={markdownText}
            onChange={handleMarkdownChange}
            placeholder="Enter your Markdown here..."
            minHeight="600px"
            marginTop={4}
          />
          <Box marginTop={4}>
            <Text fontSize="lg" fontWeight="bold">
              Thumbnail Options
            </Text>
            <Flex flexWrap="wrap">{renderThumbnailOptions()}</Flex>
          </Box>
          <Button
            onClick={handleHiveUpload}
            colorScheme="teal"
            size="sm"
            marginTop={2}
          >
            📸 Upload to Hive
          </Button>
        </Box>
        <Box
          flex={isMobile ? "auto" : 1}
          p={4}
          border="1px solid limegreen"
          margin={"15px"}
          borderRadius={"10px"}
        >
          <Box>
          <Flex padding="1%" borderRadius="10px" border="1px solid limegreen" align="center" mb={4}>
            <Avatar border="1px solid limegreen" src={avatarUrl} size="sm" />
            <Text ml={2} fontWeight="bold">
              {user?.name}
            </Text> 
            <Text marginLeft={"10px"} fontSize={"36px"} fontWeight={"bold"}> | </Text>
            <Text marginLeft={"10px"} fontSize={"36px"} fontWeight={"bold"} color={"white"} >  {title}</Text>

          </Flex>
            <Divider />
          </Box>

          <VStack alignItems="start">
            <ReactMarkdown
              children={markdownText}
              components={{
                ...MarkdownRenderersUpload,
              }}
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]} 
            />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default NewUpload;
