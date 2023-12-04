import { Box, Text, Image, Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Modal, ModalBody, ModalCloseButton, ModalOverlay, ModalContent, ModalFooter, ModalHeader, VStack } from "@chakra-ui/react";
import useAuthUser from "../home/api/useAuthUser";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/Feed/Feed";
import BeCool from "./beCool";
import HiveBalanceDisplay2 from "../wallet/hive/hiveBalance";
import { TbWorld } from "react-icons/tb";
import { FaCalendar, FaEdit } from "react-icons/fa";

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

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Add your form or content for editing the profile here */}
          <Text>Modal content goes here...</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          {/* Add save or update button as needed */}
          <Button variant="ghost">Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function ProfilePage() {
  const { user } = useAuthUser() as { user: User | null };
  const [coverImageUrl, setCoverImageUrl] = useState<string>(DEFAULT_COVER_IMAGE_URL);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

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
            bgGradient="linear(to-b, limegreen, white)"
            
          >
            <Flex justifyContent="space-between">
            <Text color={"black"} fontSize="4xl" fontWeight="bold" mb={4}>{displayname}</Text>
            {location && <Text color={"black"} fontSize="lg" fontWeight={"bold"} mb={4}>Country: {location}</Text>}

            </Flex>

            <Box border={"1px solid black"} padding={"5px"} borderRadius={"10px"}>

            <Text color={"black"} fontSize="xl" fontWeight={"bold"} mb={4}>{about}</Text>
            </Box>

            <Flex justifyContent="space-between">
              <VStack margin={"20px"}>

              <FaEdit  color="black"/>
            <Text fontSize="lg" mb={4} fontWeight={"bold"}  color={"black"}>Posts and Comments: {postings}</Text>
              </VStack>
            <VStack margin={"20px"}>
              <TbWorld  color="black"/> 
              <Text ml="2" fontSize="lg" fontWeight={"bold"} color="black" >
                {website}
              </Text>
            </VStack>
            <VStack margin={"20px"}>

            <FaCalendar color="black"/>
            <Text fontSize="lg" fontWeight={"bold"} mb={4} color={"black"} >Account created: {formatCreatedDate(created)}</Text>
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

  return (
    <Box
      fontFamily="'Courier New', monospace"
      position="relative"
      overflow="hidden"
      maxWidth="100%"
      margin="0 auto"
      backgroundColor="transparent"
    >

      <Image src={coverImageUrl} alt="Cover Image" maxH="340px" width="100%" objectFit="cover" border="0px solid" />

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
              src={`https://images.hive.blog/u/${user.name}/avatar`}
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
      {isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />}
    </Box>
  );
}
