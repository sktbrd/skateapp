import { Image, Box, Text, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import useAuthUser from "../home/api/useAuthUser";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/Feed/Feed";

interface User {
  name?: string;
  posting_json_metadata?: string;
}

const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";
const DEFAULT_COVER_IMAGE_URL = 'https://i.ibb.co/r20bWsF/You-forgot-to-add-a-cover.gif';

export default function ProfilePage() {
  const { user } = useAuthUser() as { user: User | null };
  const [coverImageUrl, setCoverImageUrl] = useState<string>(DEFAULT_COVER_IMAGE_URL);

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (user) {
        try {
        const metadata = JSON.parse(user.posting_json_metadata || '');
        const coverImage = metadata.profile.cover_image;
        setCoverImageUrl(coverImage);
        } catch (error) {
          console.error('Error parsing JSON metadata:', error);
        }
      }
    };

    fetchCoverImage();
  }, [user]);

  return (
    <Box
      borderRadius="12px"
      border="1px solid red"
      fontFamily="'Courier New', monospace"
      position="relative" // Add position relative to the container
      overflow="hidden"   // Hide overflow
    >
      <Image src={coverImageUrl} alt="Cover Image" w="100%" h="auto" position="relative" zIndex="-1" />

      <Flex alignItems="center" justifyContent="center" padding="10px" position="relative" zIndex="1">
        <Box
          position="absolute"
          left="50%"   // Center horizontally
          top="50%"    // Center vertically
          transform="translate(-50%, -50%)"   // Center alignment
          borderRadius="50%"
          border="2px solid limegreen"
          boxSize="100px"
          bg="white"    // Add a white background for the profile image
          boxShadow="0px 2px 6px rgba(0, 0, 0, 0.1)"   // Add a subtle shadow
        >
          {user ? (
            <Image
              src={`https://images.hive.blog/u/${user.name}/avatar`}
              alt="profile avatar"
              borderRadius="50%"
              boxSize="96px" 
                // Adjust size to fit within the circle border
            />
          ) : (
            <Image
              src={DEFAULT_AVATAR_URL}
              alt="Default Avatar"
              borderRadius="50%"
              boxSize="60px"
            />
          )}
        </Box>
      </Flex>

      <Tabs>
        <TabList>
          <Tab>Blog</Tab>
          <Tab>Wallet</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {user && <HiveBlog tag={user.name} queryType={"blog"} />}
          </TabPanel>
          <TabPanel>
<p>Yo </p>
            </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
