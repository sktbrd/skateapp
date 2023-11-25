import { Image, Box, Text, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import useAuthUser from "../home/api/useAuthUser";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/Feed/Feed";
import BeCool from "./beCool";

interface User {
  name?: string;
  posting_json_metadata?: string;
}
interface Follower {
  follower: string;
}

interface Following {
  following: string;
  follower: string;
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
  const UserAbout = () => {
    if (user) {
      const metadata = JSON.parse(user.posting_json_metadata || '');
      const about = metadata.profile.about;
      return about;
    } else {
      return "No user";
    }
  }

  return (
    <Box
    fontFamily="'Courier New', monospace"
    position="relative"
    overflow="hidden"
    maxWidth="100%"  
    margin="0 auto"  
    backgroundColor={"transparent"}
    >
      <Image src={coverImageUrl} alt="Cover Image" maxH="340px" width="100%" objectFit="cover" />

      <Flex alignItems="center" justifyContent="center" padding="10px" position="relative" zIndex="1">
        <Box
          position="absolute"
          left="50%"
          transform="translate(-50%, -65%)"
          borderRadius="20%"
          boxSize="162px"
          bg="white"
          boxShadow="0px 2px 6px rgba(0, 0, 0, 0.1)"
        >
          {user ? (
            <Image
              src={`https://images.hive.blog/u/${user.name}/avatar`}
              alt="profile avatar"
              borderRadius="10%"
              boxSize="162px"
              border="2px solid limegreen"
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

      <Tabs variant={"unstyled"}  colorScheme="green">
  <TabList  color={"white"} justifyContent="center">
    <Tab borderRadius={"10px"} border={"1px solid "}>Posts</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>About</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>Stats</Tab>


  </TabList>
        <TabPanels>
          <TabPanel>
            {user && <HiveBlog tag={user.name} queryType={"blog"} />}
          </TabPanel>
          <TabPanel>
          <UserAbout/>
            </TabPanel>
            <TabPanel>
            <BeCool/>
            </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
