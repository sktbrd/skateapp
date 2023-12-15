import { Tooltip, AspectRatio, Box, Text, Image, Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Modal, ModalBody, ModalCloseButton, ModalOverlay, ModalContent, ModalFooter, ModalHeader, VStack } from "@chakra-ui/react";
import useAuthUser from "../home/api/useAuthUser";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/Feed/Feed";
import BeCool from "./beCool";
import HiveBalanceDisplay2 from "../wallet/hive/hiveBalance";
import { TbWorld } from "react-icons/tb";
import { FaCalendar, FaEdit } from "react-icons/fa";
import EditProfileModal from "./editProfileModal";
import { useMediaQuery } from "@chakra-ui/react";
import { FaGear } from "react-icons/fa6";


interface User {
  name?: string;
  posting_json_metadata?: string;
  created?: string;
  post_count?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";
const DEFAULT_COVER_IMAGE_URL = 'https://i.ibb.co/r20bWsF/You-forgot-to-add-a-cover.gif';




export default function ProfilePage() {
  const { user } = useAuthUser() as { user: User | null };
  const [coverImageUrl, setCoverImageUrl] = useState<string>(DEFAULT_COVER_IMAGE_URL);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isMobile] = useMediaQuery("(max-width: 600px)");
  const coverAspectRatio = isMobile ? 2 : 19 / 6;


  useEffect(() => {
    const fetchCoverImage = async () => {
      if (user) {
        try {
          const metadata = JSON.parse(user.posting_json_metadata || '');
          const coverImage = metadata.profile.cover_image;
       

          if (coverImage) {
            setCoverImageUrl(coverImage);
          }
        } catch (error) {
          console.error('Error parsing JSON metadata:', error);
        }
      }
    };

    fetchCoverImage();
  }, [user]);

  const formatCreatedDate = (created: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(created).toLocaleDateString(undefined, options);
  };
  

  const UserAbout = ({ user }: any) => {
    if (user) {
      try {
        const metadata = JSON.parse(user.posting_json_metadata || '');
        
        const about = metadata.profile.about;
        const website = metadata.profile.website;
        const created = user.created;
        const postings = user.post_count;
        const location = metadata.profile.location;
        const displayname = metadata.profile.name;

        return (
          <Box
            border="1px solid "
            p={8}
            borderRadius={20}
            boxShadow="lg"
            
          >
            <Flex justifyContent="space-between">
            <Text color={"white"} fontSize="4xl" fontWeight="bold" mb={4}>{displayname}</Text>
            {location && <Text color={"white"} fontSize="lg" fontWeight={"bold"} mb={4}>Country: {location}</Text>}

            </Flex>

            <Box border={"1px solid white"} padding={"5px"} borderRadius={"10px"}>

            <Text color={"white"} fontSize="xl" fontWeight={"bold"} mb={4}>{about}</Text>
            </Box>

            <Flex justifyContent="space-between">
              <VStack margin={"20px"}>

              <FaEdit  color="white"/>
            <Text fontSize="lg" mb={4} fontWeight={"bold"}  color={"white"}>Posts and Comments: {postings}</Text>
              </VStack>
            <VStack margin={"20px"}>
              <TbWorld  color="white"/> 
              <Text ml="2" fontSize="lg" fontWeight={"bold"} color="white" >
                {website}
              </Text>
            </VStack>
            <VStack margin={"20px"}>

            <FaCalendar color="white"/>
            <Text fontSize="lg" fontWeight={"bold"} mb={4} color={"white"} > {formatCreatedDate(created)}</Text>
            </VStack>
            </Flex>
          </Box>
          
        );
      } catch (error) {
        return (
          <Box
            border="1px solid limegreen"
            p={8}
            borderRadius={20}
            boxShadow="lg"
            bgGradient="linear(to-b, limegreen, transparent)"
            color="white"
          >
            <Text fontSize="4xl" fontWeight="bold" mb={4}>Can't find a description.</Text>
          </Box>
        );
      }
    } else {
      return (
        <Box
          border="1px solid limegreen"
          p={8}
          borderRadius={20}
          boxShadow="lg"
          bgGradient="linear(to-b, limegreen, transparent)"
          color="white"
        >
          <Text fontSize="4xl" fontWeight="bold" mb={4}>No user</Text>
        </Box>
      );
    }
  }

  const editClick = () => {
    setIsEditModalOpen(true);
  }
  const glowStyle = {
    ":hover": {
      filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.9))",
    },
  };
  return (
    <Box
      fontFamily="'Courier New', monospace"
      overflow="hidden"
      maxWidth="100%"
      margin="0"
      backgroundColor="transparent"
    >

      <AspectRatio ratio={coverAspectRatio}>
        <Image src={coverImageUrl} alt="Cover Image" objectFit="cover" border="0px solid" />
      </AspectRatio>
      
      <Flex alignItems="center" justifyContent="center" padding="10px" position="relative" zIndex="1">
        <Box
          position="absolute"
          left="50%"
          transform="translate(-50%, -65%)"
          borderRadius="10%"
          boxSize="162px"
          bg="transparent"
          boxShadow="0px 2px 6px rgba(0, 0, 0, 0.1)"
        >
          {user ? (
            <Image
              src={user.posting_json_metadata ? JSON.parse(user.posting_json_metadata).profile.profile_image : DEFAULT_AVATAR_URL}
              alt="profile avatar"
              borderRadius="50%"
              boxSize="162px"
              border="7px solid limegreen"
            />
          ) : (
            <Image
              src={DEFAULT_AVATAR_URL}
              alt="Default Avatar"
              borderRadius="10%"
              boxSize="162px"
              border="2px solid limegreen"
            />
          )}
          <Box position="absolute" bottom="0" right="0" p="1" cursor="pointer" _hover={{transform: "scale(1.1)"}}>
            <FaGear onClick={editClick} color="white" size="2em"  />
          </Box>
        </Box>

      </Flex>

      <Tabs isLazy variant="unstyled" colorScheme="green">
        <TabList color="white" justifyContent="center">
          <Tab borderRadius="10px" border="2px solid" _selected={{ color: 'black', bg: 'green.500' }}>Posts</Tab>
          <Tab borderRadius="10px" border="2px solid" _selected={{ color: 'black', bg: 'green.500' }}>About</Tab>
          <Tab borderRadius="10px" border="2px solid" _selected={{ color: 'black', bg: 'green.500' }}>Stats</Tab>
          <Tab borderRadius="10px" border="2px solid" _selected={{ color: 'black', bg: 'green.500' }}>Wallet</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {user && <HiveBlog tag={user.name} queryType="blog" />}
          </TabPanel>
          <TabPanel>
            <UserAbout user={user} />
          </TabPanel>
          <TabPanel>
            <BeCool />
          </TabPanel>
          <TabPanel display="flex" justifyContent="center">
            <HiveBalanceDisplay2 />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} user={user} onClose={() => setIsEditModalOpen(false)} />}
    </Box>
  );
}
