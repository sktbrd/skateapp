import { Image, Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/magazine/Feed";
import HiveBalanceDisplay from "../wallet/hive/hiveBalance";
import { useParams } from 'react-router-dom';
import { Client } from "@hiveio/dhive";

interface AuthorProfile {
  cover_image?: string;
  // Add other properties of the profile if needed
}

interface Author {
  name?: string;
  posting_json_metadata?: string;
  profile?: AuthorProfile;
}

const DEFAULT_COVER_IMAGE_URL = 'https://i.ibb.co/r20bWsF/You-forgot-to-add-a-cover.gif';

export default function AuthorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [coverImageUrl, setCoverImageUrl] = useState<string>(DEFAULT_COVER_IMAGE_URL);

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (username) {
        try {
          const client = new Client('https://api.hive.blog'); // Set the appropriate Hive node URL
          const account = await client.database.getAccounts([username]);
          const metadata = JSON.parse(account[0].posting_json_metadata) as Author;
          const coverImage = metadata.profile?.cover_image || DEFAULT_COVER_IMAGE_URL;
          setCoverImageUrl(coverImage);
        } catch (error) {
          console.error('Error fetching author metadata:', error);
        }
      }
    };

    fetchCoverImage();
  }, [username]);

  return (
      <Box
        borderRadius="10px"
        border="1px solid red"
        fontFamily="'Courier New', monospace"
        position="relative"
        overflow="hidden"
        maxWidth="1920px"  // Set a max width for the image container
        margin="0 auto"     // Center align the image container
      >
        <Image src={coverImageUrl} alt="Cover Image" maxH="240px" width="100%" objectFit="cover" />
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
