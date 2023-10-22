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
  border,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { SkateboardLoading } from "../utils/VideoUtils";
import { MarkdownRenderers } from "../utils/MarkdownRenderers";
import { FaImage, FaVideo } from "react-icons/fa";
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;

const NewUpload: React.FC = () => {
  const [markdownText, setMarkdownText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null); // New state for thumbnail URL

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownText(event.target.value);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
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
        const ipfsUrl = `https://gray-soft-cardinal-116.mypinata.cloud/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
        console.log("Uploaded file to IPFS:", ipfsUrl);

        if (file.type.startsWith("video")) {
          setUploadedVideo(ipfsUrl);
        }

        const transformedLink = file.type.startsWith("video")
          ? `<iframe src="${ipfsUrl}"></iframe>)`
          : `![Image](${ipfsUrl})`;

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
      console.log("Uploading image:", file.name);
      await uploadFileToIPFS(file);
    }

    setIsUploading(false);
  };

  const onDropVideos = async (acceptedFiles: File[]) => {
    setIsUploading(true);

    for (const file of acceptedFiles) {
      console.log("Uploading video:", file.name);
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

  const renderThumbnailOptions = () => {
    return uploadedFiles.map((fileUrl, index) => (
      <Box
        key={index}
        cursor="pointer"
        width="100px" 
        height="100px" 
        display="flex"
        justifyContent="center"
        alignItems="center"
        onClick={() => setThumbnailUrl(fileUrl)} // Set the selected image as the thumbnail
      >
        <img
          src={fileUrl}
          alt={`Thumbnail ${index}`}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </Box>
    ));
  };
  
  

  

  return (
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
              <Text>Drag & drop images or click to select</Text>
            </VStack>
          </Box>
          <Box flex={1}>
            <VStack
              {...getVideosRootProps()}
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
              <input {...getVideosInputProps()} />
              <FaVideo size={32} />
              <Text>Drag & drop videos or click to select</Text>
              {isUploading && <SkateboardLoading progress={progress} />}
            </VStack>
          </Box>
        </Flex>
        <Textarea
  value={markdownText}
  onChange={handleMarkdownChange}
  placeholder="Enter your Markdown here..."
  minHeight="700px" // Adjust this height as needed
  marginTop={4}
/>

        
        {/* "Thumbnail Options" box */}
        <Box marginTop={4}>
          <Text fontSize="lg" fontWeight="bold">
            Thumbnail Options
          </Text>
          <Flex flexWrap="wrap">{renderThumbnailOptions()}</Flex>
        </Box>
      </Box>

      <Box flex={isMobile ? "auto" : 1} p={4} border="1px solid limegreen" borderRadius={"10px"}>
        <Box>
          <Text fontSize={"48px"}> {title}</Text>
          <Divider /> 
        </Box>
        {uploadedVideo && (
          <Box marginBottom={4}>
<video
  style={{ borderRadius: '15px', margin:'10px',border:'1px solid limegreen' }} // Add the borderRadius style here
  src={uploadedVideo}
  controls
  width="100%"
></video>
          </Box>
        )}
        <VStack alignItems="start">
          <ReactMarkdown
            children={markdownText}
            components={{
              ...MarkdownRenderers,
            }}
          />
        </VStack>
      </Box>
    </Flex>
  );
};

export default NewUpload;