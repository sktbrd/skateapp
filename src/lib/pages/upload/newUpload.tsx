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
import { MarkdownRenderersUpload } from "../utils/MarkdownRenderersUpload";
import { FaImage } from "react-icons/fa";
import useAuthUser from '../home/api/useAuthUser';
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { slugify } from "../utils/videoFunctions/slugify";
import { Client } from '@hiveio/dhive';
import { KeychainSDK } from 'keychain-sdk';
import { Spinner } from "@chakra-ui/react";
import { defaultFooter } from "./defaultFooter";
import AuthorSearchBar from "./searchBar";
import captureVideoFrame from "./captureFrame";
import MDEditor from '@uiw/react-md-editor';

import { transformYouTubeContent } from "../utils/videoFunctions/videoUtils";
import { transform3SpeakContent } from "../utils/videoFunctions/videoUtils";
import { transformGiphyLinksToMarkdown } from '../utils/ImageUtils';
import { transformComplexMarkdown } from '../utils/transformComplexMarkdown';

import {
  get3SpeakAuthStatus,
  Connect3Speak,
  uploadTo3Speak,
  uploadThumbnailTo3Speak,
  setVideoInfoOn3Speak,
  setAsPublishedOn3Speak,
} from "./3speak";

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
  { name: 'skatehacker', percentage: 2 },
  { name: 'steemskate', percentage: 3 },
];

declare global {
  interface Window {
    hive_keychain: any;
  }
}
const defaultTags = ["skatehive", "skateboarding", "leofinance", "sportstalk", "hive-engine"];
const activityToPermlinkMapping = {
  skateboard: 'hive-173115',
  surf: 'hive-141964',
  longboard: 'hive-173115',
  snowboard: 'hive-132443',
};

const activities = Object.keys(activityToPermlinkMapping); // ['skateboard', 'surf', 'longboard', 'snowboard']


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
  const [tags, setTags] = useState<string[]>([]); // State to store tags
  const [includeFooter, setIncludeFooter] = useState<boolean>(false); // New state for the checkbox
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [postLink, setPostLink] = useState<string>("");

  // 3Speak state
  const [is3speakPost, setIs3speakPost] = useState<boolean>(false);
  const { connected, username } = get3SpeakAuthStatus();
  const [isVideoUploaded, setIsVideoUploaded] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null); // for viewing in editor
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null);
  const parentPermlinksOptions = ['hive-173115', 'option2', 'option3', 'option4']; // Replace with your actual options
  const [selectedActivity, setSelectedActivity] = useState<string>("");

  const handleCheckboxChange = (activity: string) => {
    // If the clicked activity is already selected, deselect it
    if (selectedActivity === activity) {
      setSelectedActivity("");
    } else {
      // Otherwise, update the state to the new selected activity
      setSelectedActivity(activity);
    }
  };

  // Map the selected activity to its Hive permlink


  // When creating the post, map the selected activities to their respective permlinks
  const activityToPermlinkMapping: { [key: string]: string } = {
    skateboard: 'hive-173115',
    surf: 'hive-141964',
    longboard: 'hive-173115',
    snowboard: 'hive-132443',
  };

  const selectedParentPermlink = activityToPermlinkMapping[selectedActivity];


  useEffect(() => {
    setTags(defaultTags);
  }, []);

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownText(event.target.value);
  };
  const buildPostLink = () => {
    const username = user?.name;
    if (username) {
      const permlink = slugify(title.toLowerCase());
      const link = `https://skatehive.app/post/hive-173115/@${username}/${permlink}`;
      setPostLink(link);
    }
  }
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    buildPostLink();
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

          const transformedLink = `<iframe src="${ipfsUrl}" allowfullscreen></iframe>` + " ";

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

    // if it is a photo, upload to IPFS
    if (acceptedFiles[0].type.startsWith("image/")) {
      for (const file of acceptedFiles) {
        await uploadFileToIPFS(file);
      }

      setIsUploading(false);
      return;
    }

    // if it is a video
    if (acceptedFiles[0].type.startsWith("video/")) {
      // focus on the markdown editor
      const markdownEditor = document.getElementById("markdown-editor");
      markdownEditor?.focus();

      // if is3speakPost is false, then upload to IPFS
      if (!is3speakPost) {
        for (const file of acceptedFiles) {
          await uploadFileToIPFS(file);
        }

        setIsUploading(false);
        return;
      }

      // if 3Speak is not connected, then connect
      if (!connected || !username) {
        alert("Please connect your 3Speak account first to upload videos.");
        setIsUploading(false);
        return;
      }

      // if already uploaded a video, then alert
      if (isVideoUploaded) {
        alert("You can only upload one video per post. Video will be uploaded on 3Speak.");
        setIsUploading(false);
        return;
      }

      // upload video to 3Speak
      const video = acceptedFiles[0];

      setVideoFile(video);

      uploadTo3Speak(video, setIsUploading, setVideoUploadProgress, setVideoInfo, setIsVideoUploaded);
    }

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

  const setVideoThumbnail = async () => {
    const frame = captureVideoFrame("main-video", "jpeg");
    if (frame) {
      const thumbnailUrl = frame.dataUri;

      // convert blob to file
      const blob = frame.blob;
      const file = new File([blob], "thumbnail.jpeg", { type: "image/jpeg" });

      setIsUploading(true);

      // upload the thumbnail to 3Speak
      uploadThumbnailTo3Speak(file, setIsUploading, videoInfo, setVideoInfo, setVideoThumbnailUrl, setThumbnailUrl);
    }
  };

  const renderThumbnailOptions = () => {
    const selectedThumbnailStyle = {
      border: '2px solid limegreen',
    };

    const imageUrls = extractImageUrls(markdownText);

    if (videoThumbnailUrl) {
      imageUrls.push(videoThumbnailUrl);
    }

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

  const handleHiveUpload = async () => {
    if (!user) {
      alert("You have to log in with Hive Keychain to use this feature...");
      return;
    }

    if (!title) {
      alert("Please enter a title for your post...");
      return;
    }

    if (!markdownText) {
      alert("Please enter some content for your post...");
      return;
    }

    // if (!thumbnailUrl) {
    //   alert("Please select a thumbnail for your post...");
    //   return;
    // }

    if (!tags.length) {
      alert("Please enter some tags for your post...");
      return;
    }

    // disable the publish button
    const publishButton = document.getElementById("publish-button");
    if (publishButton) {
      publishButton.setAttribute("disabled", "true");
    }

    // 3speak video info that is used to publish the post
    let videoId = '';
    let videoPermlink = null;
    let finalMarkdown = markdownText;
    let finalThumbnailUrl = thumbnailUrl;
    let videoBeneficiaries = [
      { account: 'spk.beneficiary', weight: 900 },
      { account: 'threespeakleader', weight: 100 },
    ];

    // if video is uploaded on 3Speak and thumbnail is not uploaded, then alert
    if (isVideoUploaded) {
      if (!videoThumbnailUrl) {
        alert("Please upload video thumbnail on 3Speak first. You can do this by clicking the 'Set Video Thumbnail' after sleeking to any point in the video button.");
        return;
      }
    }

    // set video info on 3Speak if video is uploaded
    if (isVideoUploaded) {
      const videoInstance = await setVideoInfoOn3Speak(videoInfo);
      console.log("Video instance:", videoInstance);

      // at this point the video is uploaded on 3Speak
      // get the hive post permlink from the video instance and use it to create the hive post
      // also update the video info on 3Speak with title, description, tags, etc.
      videoId = videoInstance._id;
      videoPermlink = videoInstance.permlink;

      // update the markdown text with the video URL and thumbnail URL from 3Speak
      const videoURL = `https://3speak.tv/watch?v=${username}/${videoPermlink}`;
      const ipfs3Speak = 'https://ipfs-3speak.b-cdn.net/ipfs/'; // default IPFS 3Speak URL
      const newThumbnailURL = `${ipfs3Speak}${videoInstance.thumbnail.replace('ipfs://', '')}/`;

      // if the current selected thumbnail is the video thumbnail, then update the thumbnail URL
      // update the video thumbnail ~ done by tiddi
      if (thumbnailUrl === videoThumbnailUrl) {
        finalThumbnailUrl = newThumbnailURL;
      }

      // update the video info on 3Speak
      const updateObject = {
        videoId,
        title,
        description: markdownText,
        tags: tags.toString(), // Pass the 'tags' array as string here separated by commas
      };

      const updatedVideoInstance = await setVideoInfoOn3Speak(updateObject, true); // true means update
      console.log("Updated video instance:", updatedVideoInstance);

      // update the markdown text with the video URL and thumbnail URL
      const videoMarkdown = `<center>\n\n[![](${newThumbnailURL})](${videoURL})\n\n</center>\n`;
      // video goes on top of the markdown
      finalMarkdown = videoMarkdown + finalMarkdown;

      // get the encoder benefeciary from video info
      const encoderBeneficiaries = JSON.parse(updatedVideoInstance.beneficiaries);
      const encoderBeneficiary = encoderBeneficiaries.find((b: any) => b.src === 'ENCODER_PAY');

      // add the encoder benefeciary along with the default 3Speak and other benefeciaries
      if (encoderBeneficiary) {
        videoBeneficiaries.push({
          account: encoderBeneficiary.account,
          weight: encoderBeneficiary.weight,
        });
      }
    }

    if (user && title) {
      const username = user?.name;
      if (username) {
        const permlink = slugify(title.toLowerCase());

        // Define the beneficiaries
        let finalBeneficiaries = beneficiariesArray.map(b => ({
          account: b.account,
          weight: parseInt(b.weight, 10) // Convert the weight string to an integer
        }));

        // Add the video benefeciaries if video is uploaded on 3Speak
        if (isVideoUploaded) {
          finalBeneficiaries.push(...videoBeneficiaries);
        }

        // sort the beneficiaries by account name ascending
        finalBeneficiaries = finalBeneficiaries.sort((a: any, b: any) => a.account.localeCompare(b.account));

        // Define your comment options (e.g., max_accepted_payout, beneficiaries, etc.)
        const commentOptions = {
          author: username,
          permlink: videoPermlink ? videoPermlink : permlink, // Use the video permlink if video is uploaded on 3Speak
          max_accepted_payout: '10000.000 HBD',
          percent_hbd: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: [
            [0, {
              beneficiaries: finalBeneficiaries
            }]
          ]
        };

        // Add defaultFooter to the markdown if includeFooter is true
        if (includeFooter) {
          let finalPermlink = videoPermlink ? videoPermlink : permlink;
          const link = `https://skatehive.app/post/hive-173115/@${username}/${finalPermlink}`;

          let newFooter = "\n" + "> **Check this post on** " + `[Skatehive App](${link})`

          // set the final markdown text again
          finalMarkdown = finalMarkdown + newFooter;

          setMarkdownText((prevMarkdown) => prevMarkdown + newFooter);
        }

        // Define the post operation
        // Define the post operation
        const postOperation = [
          'comment',
          {
            parent_author: '',
            parent_permlink: selectedActivity ? activityToPermlinkMapping[selectedActivity] : 'defaultPermlink', // Use the mapped permlink of the selected activity
            author: username,
            permlink: videoPermlink ? videoPermlink : permlink, // Use the video permlink if video is uploaded on 3Speak
            title: title,
            body: finalMarkdown, // Use the complete post body here
            json_metadata: JSON.stringify({
              tags: tags, // Pass the 'tags' array here
              app: 'skatehive',
              image: finalThumbnailUrl ? [finalThumbnailUrl] : [], // Replace 'thumbnailIpfsURL' with 'thumbnailUrl'
            }),
          },
        ];

        // Define the comment options operation
        const commentOptionsOperation = ['comment_options', commentOptions];

        // Construct the operations array
        const operations = [postOperation, commentOptionsOperation];
        // Request the broadcast using Hive Keychain
        window.hive_keychain.requestBroadcast(username, operations, 'posting', async (response: any) => {
          if (response.success) {

            // // set the status of the video to published on 3Speak (if uploaded)
            // if (isVideoUploaded) {
            //   await setAsPublishedOn3Speak(videoId);
            //   window.alert('Video successfully published on 3Speak!');
            // }

            // reload the page
            // wait 5 seconds and the reload the page
            setTimeout(() => {
              window.location.reload();
            }, 5000);

            if (isVideoUploaded) {
              window.alert('Video successfully published on 3Speak! It will be available soon!');
            }
          } else {
            alert('Error publishing post on Hive');
            console.error('Error publishing post on Hive:', response.message);
          }
        });
      } else {
        alert('You have to log in with Hive Keychain to use this feature...');
      }
    }
  };


  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    // Check if the last character is a comma or space
    if (inputValue.endsWith(',') || inputValue.endsWith(' ')) {
      // Extract the new tag without the comma or space
      const newTag = inputValue.slice(0, -1).trim();
      if (newTag) {
        // Check if the number of tags is less than 10 before adding a new tag
        if (tags.length < 10) {
          // Add the new tag to the tags list
          setTags([...tags, newTag]);
          // Clear the input field
          setTagsInput('');
        } else {
          alert('You can only add up to 10 tags.');
        }
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
              // Remove the tag from the tags array
              const newTags = [...tags];
              newTags.splice(index, 1);
              setTags(newTags);
            }}
          />
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

  const handleClickOutside = (event: any) => {
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
      <Box mt={0}>

        <VStack>

          <img
            src="../../assets/smartpepe.png"
            style={{
              width: '100px',
              height: 'auto',
            }}
            alt="Smart Pepe"
          />
          <Badge color="black" bg={"yellow"} marginTop={"-15px"}>
            First time? Check our{" "}
            <a
              href="https://docs.skatehive.app/docs/tutorial-basics/share-ur-content"
              style={{ color: 'blue' }}
            >
              Tutorial
            </a>{" "}
            First
          </Badge>
        </VStack>
      </Box>
      <Flex minWidth={"100%"}
        flexDirection={isMobile ? "column" : "row"}
      >

        <Box
          flex={isMobile ? "auto" : 1}
          p={4}
          border="1px solid white"
          margin={"15px"}
          borderRadius={"10px"}
          maxWidth={{ base: "100%", md: "50%" }}
          overflowWrap="break-word"
        >
          <Box marginTop={4}>
            <Text fontSize="lg" fontWeight="bold">
              What are you doing in this post?
            </Text>
            {activities.map((activity) => (
              <Checkbox
                key={activity}
                isChecked={selectedActivity === activity}
                onChange={() => handleCheckboxChange(activity)}
              >
                {activity}
              </Checkbox>
            ))}
          </Box>
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
            <Box flex={1}>
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
                <Text> Drop images{isVideoUploaded ? '' : '/video'} or click to select</Text>

              </VStack>
              <Flex flexDirection={isMobile ? "column" : "row"} justifyContent={'space-between'} alignItems={'center'} marginTop={4}>
                <Checkbox isDisabled={videoFile || uploadedVideo ? true : false} isChecked={is3speakPost} onChange={() => setIs3speakPost(!is3speakPost)}>
                  Upload on 3Speak (experimental)
                </Checkbox>

                <Connect3Speak />
              </Flex>
              <Box marginTop={0}>
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
                  {videoUploadProgress > 0 && videoUploadProgress < 100 ? (
                    <Text>{videoUploadProgress}%</Text>
                  ) : null}
                  {isVideoUploaded ? (
                    <Text>Video uploaded on 3Speak Servers!</Text>
                  ) : null}
                </center>
              </Box>
              <br />
              <MDEditor
                value={markdownText}
                onChange={(value, event, state) => setMarkdownText(value || '')}
                preview="edit"
                height={600}
              />


              {/* <Textarea
                value={markdownText}
                onChange={handleMarkdownChange}
                placeholder="Enter your Markdown here..."
                minHeight="600px"
                marginTop={4}
                id="markdown-editor"
              /> */}
              <Checkbox
                isChecked={includeFooter}
                onChange={handleIncludeFooterChange}
                marginTop={2}
              >
                Include Skatehive Footer
              </Checkbox>
              <Box marginTop={4}>
                <Text fontSize="lg" fontWeight="bold">
                  Thumbnail Options (select at least one)
                </Text>
                <Flex flexWrap="wrap">{renderThumbnailOptions()}</Flex>
              </Box>
            </Box>
          </Flex>
          <Flex flexDirection={isMobile ? "column" : "row"} justifyContent={'space-between'}>
            <Button onClick={toggleAdvancedOptions} colorScheme="teal" size="sm" marginTop={2} marginRight={2}>
              {showAdvancedOptions ? 'Hide Advanced Options' : ' Advanced Options'}
            </Button>
          </Flex>
          {showAdvancedOptions && (
            <>

              <Box marginTop={4}>
                <div ref={searchBarRef}>
                  <Text fontSize="lg" fontWeight="bold">
                    Split rewards with your photographer/videomaker
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
                  Enter Tags
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
          <Flex alignItems="center" wrap="wrap">{renderTags()}</Flex>

          <Button onClick={handleHiveUpload} colorScheme="teal" size="sm" marginTop={2} id="publish-button">
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
              <Avatar border="1px solid limegreen" src={avatarUrl} size="sm" />
              <Text ml={2} fontWeight="bold" color={"orange"}>
                {user?.name}
              </Text>
              <Text marginLeft={"10px"} fontSize={"36px"} fontWeight={"bold"}> | </Text>
              <Text ml={3} fontWeight="bold" style={{ wordBreak: "break-all", maxWidth: "100%", color: 'white' }}>
                {title}
              </Text>
            </Flex>
            <Divider />
          </Box>
          {isVideoUploaded ? (
            <Box
              display={"flex"}
              alignItems="center"
              justifyContent="center"
              flexDirection={"column"}
            >
              <Button
                onClick={setVideoThumbnail}
                colorScheme="teal"
                size="xs"
                marginTop={2}
                marginBottom={2}
              >
                Set Video Thumbnail
              </Button>
              <video
                src={videoFile ? URL.createObjectURL(videoFile) : ''}
                controls
                onLoadedData={async () => {
                  // when the video is ready to play, focus on it

                  // current focused element
                  const focused = document.activeElement as HTMLElement;

                  // focus on the video
                  // this is needed to capture the frame without manually playing the video
                  const video = document.getElementById("main-video") as HTMLVideoElement;
                  video?.focus();

                  // now focus on the previous element
                  focused?.focus();
                }}
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "600px",
                }}
                id="main-video"
              />
            </Box>
          ) : ''}
          <ReactMarkdown
            children={
              transformComplexMarkdown(
                transformGiphyLinksToMarkdown(
                  transform3SpeakContent(
                    transformYouTubeContent(markdownText)
                  )
                )
              )
            }
            components={{
              ...MarkdownRenderersUpload,
            }}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          />
          <Flex alignItems="center" wrap="wrap">{renderTags()}</Flex>
        </Box>
      </Flex>
    </Box>
  );





};

export default NewUpload;