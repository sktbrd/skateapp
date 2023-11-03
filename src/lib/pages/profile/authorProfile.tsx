import { Image, Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel , Text, Tooltip} from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/Feed/Feed";
import HiveBalanceDisplay2 from "../wallet/hive/hiveBalance";
import { useParams } from 'react-router-dom';
import { Client } from "@hiveio/dhive";
import styled from "@emotion/styled";

interface AuthorProfile {
  about?: string;
  cover_image?: string;
  location?: string;
  name?: string;
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
  const [account, setAccount] = useState<string | null>(null); // Step 2
  const [authorAbout, setAuthorAbout] = useState<string | null>(null); // Step 3
  const [hasVotedWitness, setHasVotedWitness] = useState<boolean>(false); // Step 4
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (username) {
        try {
          
          const client = new Client('https://api.hive.blog'); 
          const account = await client.database.getAccounts([username]);
          console.log('ACCOUNT',account)
          setAccount(account[0].name);
          const metadata = JSON.parse(account[0].posting_json_metadata) as Author;
          console.log('METADATA',metadata)
          const authorAbout = metadata.profile?.about || null;
          const coverImage = metadata.profile?.cover_image || DEFAULT_COVER_IMAGE_URL;
          setCoverImageUrl(coverImage);
          setAuthorAbout(authorAbout);
          // Step 4: Check if the user has voted for the Hive witness
          const witnessVotes = account[0].witness_votes;
          const hasVotedWitness = witnessVotes.includes('skatehive');
          setHasVotedWitness(hasVotedWitness);
          const response = await client.database.getAccounts([username])

          console.log('Response:', response)
        } catch (error) {
          console.error('Error fetching author metadata:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [username]);


  return (
    <Box
      fontFamily="'Courier New', monospace"
      position="relative"
      overflow="hidden"
      maxWidth="100%"  // Set a max width for the image container
      margin="0 auto"     // Center align the image container
    >
      <Image src={coverImageUrl} alt="Cover Image" maxH="240px" width="100%" objectFit="cover" />
      <Flex alignItems="center" justifyContent="center" padding="10px" position="relative" zIndex="1">
      <Box
          position="absolute"
          left="50%"
          transform="translate(-50%, -65%)"
          borderRadius="20%"
          boxSize="192px"
          bg="white"
          boxShadow="0px 2px 6px rgba(0, 0, 0, 0.1)"
        >
          <Image
            src={`https://images.hive.blog/u/${username}/avatar`}
            alt="profile avatar"
            borderRadius="10%"
            boxSize="192px"
            border="2px solid limegreen"
          />
          {/* Conditional rendering for verification badge */}
          {hasVotedWitness && (
            <Tooltip label="This person knows stuff! (S)he Voted on our Hive Validator" aria-label="Verified Badge">
            <Image
              src="https://www.stoken.quest/images/coinspin.gif"
              alt="Verified Badge"
              position="absolute"
              right="-4"
              bottom="-3"
              boxSize="48px" // You can adjust the size as needed
            />
            </Tooltip>
          )}
        </Box>

        <center>
          <Text  fontSize={"26px"}> {username}</Text>
          </center>
      </Flex>
      <Box marginTop={"10px"}>
        <Flex
          backgroundColor="black"
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Tabs variant={"unstyled"}  colorScheme="green" >
            <TabList  color={"white"} justifyContent="center"> {/* Center align the TabList */}
              <Tab borderRadius={"10px"} border={"1px solid "}>Posts</Tab>
              <Tab borderRadius={"10px"} border={"1px solid "}>About</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <HiveBlog tag={username} queryType={"blog"} />
              </TabPanel>
              <TabPanel>
              <p>Account : {account}</p> {/* Step 5: Display the account reputation */}
              <p>About: {authorAbout} </p>
              <p>Has voted for the Hive witness: {hasVotedWitness ? 'Yes' : 'No'}</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Box>
    </Box>
  );
}
