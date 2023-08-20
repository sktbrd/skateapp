import { Image, Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/posts/Feed";
import HiveBalanceDisplay from "../wallet/hive/hiveBalance";
import { useParams } from 'react-router-dom';

interface AuthorProfile {
  cover_image?: string;
  // Add other properties of the profile if needed
}

interface Author {
  name?: string;
  posting_json_metadata?: string;
  profile?: AuthorProfile;
}

const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";
const DEFAULT_COVER_IMAGE_URL = 'https://i.ibb.co/r20bWsF/You-forgot-to-add-a-cover.gif';

export default function AuthorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [coverImageUrl, setCoverImageUrl] = useState<string>(DEFAULT_COVER_IMAGE_URL);

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (username) {
        try {
          // Fetch the author's metadata using the username from the URL
          const metadata: Author = await fetchAuthorMetadata(username); // Type the metadata as Author
          const coverImage = metadata.profile?.cover_image || DEFAULT_COVER_IMAGE_URL;
          setCoverImageUrl(coverImage);
        } catch (error) {
          console.error('Error fetching author metadata:', error);
        }
      }
    };

    fetchCoverImage();
  }, [username]);

  // Mock function to fetch author metadata
  // Replace this with your actual method to fetch user data
  const fetchAuthorMetadata = async (username: string): Promise<Author> => {
    // Mock response
    return {
      name: username,
      posting_json_metadata: JSON.stringify({
        profile: {
          cover_image: DEFAULT_COVER_IMAGE_URL
        }
      })
    };
  };

  return (
    <Box
      borderRadius="10px"
      border="1px solid red"
      fontFamily="'Courier New', monospace"
      position="relative"
      overflow="hidden"
    >
      <Image src={coverImageUrl} alt="Cover Image" w="100%" h="auto" position="relative" zIndex="-1" />

      <Flex alignItems="center" justifyContent="center" padding="10px" position="relative" zIndex="1">
        <Box
          position="absolute"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          borderRadius="20%"
          border="2px solid limegreen"
          boxSize="100px"
          bg="white"
          boxShadow="0px 2px 6px rgba(0, 0, 0, 0.1)"
        >
          <Image
            src={`https://images.hive.blog/u/${username}/avatar`}
            alt="profile avatar"
            borderRadius="20%"
            boxSize="96px"
          />
        </Box>
      </Flex>

      <Tabs>
        <TabList>
          <Tab>Blog</Tab>
          <Tab>Wallet</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <HiveBlog tag={username} queryType={"blog"} />
          </TabPanel>
          <TabPanel>
            <HiveBalanceDisplay/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
