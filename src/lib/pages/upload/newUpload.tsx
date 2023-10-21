import React, { useState } from "react";
import {
  Box,
  Text,
  Flex,
  Textarea,
  Divider,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { SkateboardLoading } from "../utils/VideoUtils";
import { MarkdownRenderers } from "../utils/MarkdownRenderers";
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;

const NewUpload: React.FC = () => {
  const [markdownText, setMarkdownText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownText(event.target.value);
  };

  const uploadFileToIPFS = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Set the Content-Type header directly on the FormData object
      formData.set("Content-Type", "multipart/form-data");

      // Perform the file upload to Pinata IPFS
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const ipfsUrl = `https://gray-soft-cardinal-116.mypinata.cloud/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
        console.log("Uploaded file to IPFS:", ipfsUrl);

        // Transform the link based on the file type and insert it into the textarea
        const transformedLink = file.type.startsWith("video")
          ? `<iframe src="${ipfsUrl}" frameborder="0" allowfullscreen></iframe>`
          : `![Image](${ipfsUrl})`;

        setMarkdownText((prevMarkdown) => prevMarkdown + `\n${transformedLink}`);

        // Update uploaded files
        setUploadedFiles((prevFiles) => [...prevFiles, ipfsUrl]);
      } else {
        const errorData = await response.json(); // Capture the error message
        console.error("Error uploading file to Pinata IPFS:", errorData);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);

    for (const file of acceptedFiles) {
      console.log("Uploading file:", file.name);
      await uploadFileToIPFS(file);
    }

    setIsUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    //@ts-ignore
    accept: "video/mp4,image/*",
    multiple: false,
  });

  const [isMobile] = useMediaQuery("(max-width: 768px)");

  return (
    <Flex
      flexDirection={isMobile ? "column" : "row"}
      justifyContent="center"
      alignItems="stretch"
    >
      <Box flex={isMobile ? "auto" : 1} p={4}>
        <Box marginBottom={4}>
          <Textarea
            value={markdownText}
            onChange={handleMarkdownChange}
            placeholder="Enter your Markdown here..."
            h="full"
          />
        </Box>
        <VStack
          {...getRootProps()}
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
          <input {...getInputProps()} />
          <Text>Drag & drop videos or click to select</Text>
          {isUploading && (
            <SkateboardLoading progress={progress} />
          )}
        </VStack>
      </Box>

      {!isMobile && <Divider orientation="vertical" />}

      <Box flex={isMobile ? "auto" : 1} p={4}>
        <VStack alignItems="start">
          <Text fontSize="xl" fontWeight="bold">
            Markdown Preview
          </Text>
          <ReactMarkdown
          children={markdownText}
          components={{
            ...MarkdownRenderers,

          }}          
        />        </VStack>
      </Box>
    </Flex>
  );
};

export default NewUpload;
