import {useMediaQuery,AspectRatio, Image, Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Tooltip, Button, List, ListItem, Avatar } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/Feed/Feed";
import { useParams } from 'react-router-dom';
import { Client } from "@hiveio/dhive";
import styled from "@emotion/styled";
import useAuthUser from "../home/api/useAuthUser";
import axios from 'axios';
import { KeychainSDK, KeychainKeyTypes } from "keychain-sdk";
import { Custom } from "keychain-sdk";
import { Broadcast } from "keychain-sdk";

interface Follower {
  follower: string;
}

interface Following {
  following: string;
  follower: string;
}

interface AuthorProfile {
  about?: string;
  cover_image?: string;
  profile_image?: string;
  location?: string;
  name?: string;
}

interface Author {
  name?: string;
  posting_json_metadata?: string;
  profile?: AuthorProfile;
}

const DEFAULT_COVER_IMAGE_URL = 'https://i.ibb.co/r20bWsF/You-forgot-to-add-a-cover.gif';

export default function AuthorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [authorName, setAuthorName] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>(DEFAULT_COVER_IMAGE_URL);
  const [account, setAccount] = useState<string | null>(null); // Step 2
  const [authorAbout, setAuthorAbout] = useState<string | null>(null); // Step 3
  const [hasVotedWitness, setHasVotedWitness] = useState<boolean>(false); // Step 4
  const user = useAuthUser();
  const [relationship, setRelationship] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]); // Specify the type as Follower[]
  const [followings, setFollowings] = useState<Following[]>([]);
  const [isMobile] = useMediaQuery("(max-width: 600px)");
  const coverAspectRatio = isMobile ? 2 : 19 / 6;
  const [profile_image, setProfile_image] = useState<string>("https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif");


  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (username) {
        setAuthorName(username)
        try {
          
          const client = new Client('https://api.hive.blog'); 
          const author_account = await client.database.getAccounts([authorName]);
          setAccount(author_account[0].name);
          const metadata = JSON.parse(author_account[0].posting_json_metadata) as Author;
          const authorAbout = metadata.profile?.about || null;
          const coverImage = metadata.profile?.cover_image || DEFAULT_COVER_IMAGE_URL;
          setCoverImageUrl(coverImage);
          setAuthorAbout(authorAbout);
          setProfile_image(metadata.profile?.profile_image || DEFAULT_COVER_IMAGE_URL);
          const witnessVotes = author_account[0].witness_votes;
          const hasVotedWitness = witnessVotes.includes('skatehive');
          setHasVotedWitness(hasVotedWitness);

        } catch (error) {
          console.error('Error fetching author metadata:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [user]);

  async function getRelationshipBetweenAccounts(account1:any, account2:any) {
    try {
      const response = await axios.post('https://api.hive.blog', {
        jsonrpc: '2.0',
        method: 'bridge.get_relationship_between_accounts',
        params: [account1, account2],
        id: 1,
      });
  
      return response.data.result;
    } catch (error) {
      console.error('Error fetching relationship:', error);
      return {};
    }
  }
  useEffect(() => {
    if (authorName) {
      fetchFollowersAndFollowings(authorName);
    }
  }, [authorName]);
  
  async function fetchFollowersAndFollowings(username:any) {
    try {
      const followersResponse = await axios.post('https://api.hive.blog', {
        jsonrpc: '2.0',
        method: 'condenser_api.get_followers',
        params: [username, null, "blog", 100],
        id: 1,
      });
  
      const followingsResponse = await axios.post('https://api.hive.blog', {
        jsonrpc: '2.0',
        method: 'condenser_api.get_followers',
        params: [username, null, "ignore", 100],
        id: 1,
      });
      setFollowers(followersResponse.data.result);
      setFollowings(followingsResponse.data.result);
    } catch (error) {
      console.error('Error fetching followers and followings:', error);
    }
  }
  



  useEffect(() => {
    // Fetch the relationship between the author and the logged-in user
    if (user && authorName) {
      getRelationshipBetweenAccounts(user?.user?.name, authorName)
        .then((result) => {
          setRelationship(result);
          setIsFollowing(result.follows); // Set isFollowing based on the relationship
        });
    }
  }, [user, authorName]);
  


  const handleFollow = async () => {
    if (!user.isLoggedIn()) {
      // Check if the user is logged in
      alert("Please log in first.");
      return;
    }
  
    if (!authorName) {
      alert("Author's username is missing.");
      return;
    }
  
    const follower = user.user?.name;
  
    const isAlreadyFollowing = isFollowing;
  
    const followType = isAlreadyFollowing ? "" : 'blog';
    
    try {
      const keychain = new KeychainSDK(window);
    
      const formParamsAsObject = {
        "data": {
          "username": follower,  
          "id": "follow",             
          "method": KeychainKeyTypes.posting,
          "json": JSON.stringify([
            "follow",
            {
              "follower": follower,  
              "following": authorName,    
              "what": [
                followType                  
              ]
            }
          ]),
          "display_msg": "Follow User"
        }
      }
    
      const custom = await keychain.custom(formParamsAsObject.data as Custom);
      
    } catch (error) {
      console.log({ error });
    }
  
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
        <Button marginLeft="75%" border={"1px solid white"} bg={"transparent"} color={"white"} zIndex="1" position="absolute" _hover={{ bg: "black" }} onClick={handleFollow}>
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
        <Box
          position="absolute"
          left="50%"
          transform="translate(-50%, -65%)"
          zIndex="1" // Set the z-index on the container
        >
          <Box
            borderRadius={profile_image.includes('storage.googleapis.com/zapper-fi-assets/nfts') ? '20%' : '50%'}
            clipPath={profile_image.includes('storage.googleapis.com/zapper-fi-assets/nfts') ?
            'polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%)' : ''}
            boxSize="192px"
            overflow="hidden"
            border={profile_image.includes('storage.googleapis.com/zapper-fi-assets/nfts') ? '0px solid lightblue' : '2px solid limegreen'}
            position="relative" // Ensure the positioning context
          >
            {/* "NFT" string for NFT profile pictures */}

            <Image
              src={profile_image}
              alt="profile avatar"
              boxSize="100%"
              objectFit="cover"
            />
          </Box>
          {/* Direct rendering of the GIF */}

                      {profile_image.includes('storage.googleapis.com/zapper-fi-assets/nfts') && (
              <Box
                position="absolute"
                right="80%" // Set the left side to be the right side of the profile picture
                top="70%"
                transform="translate(-50%, -50%)" // Center vertically
                backgroundColor="black"
                color="white"
                padding="2px 4px"
                borderRadius="4px"
                zIndex="2" // Ensure it's above the profile picture
              >
                NFT
              </Box>
            )}
        </Box>



        <center>
          <Text  fontSize={"26px"}> {authorName}</Text>
        </center>
        {hasVotedWitness && (
            <Image
              src="https://www.stoken.quest/images/coinspin.gif"
              alt="Verified Badge"
              boxSize="48px"
              position="absolute"
              left={isMobile ? "60%" : "55%"}
            />
          )}
      </Flex>
      <Box marginTop={"10px"}>

        <Flex
          backgroundColor="black"
          direction="column"
          alignItems="center"
          justifyContent="center"
        > 

        <Tabs variant={"unstyled"}  colorScheme="green">
  <TabList  color={"white"} justifyContent="center">
    <Tab borderRadius={"10px"} border={"1px solid "}>Posts</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>About</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>Followers</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>Followings</Tab>


  </TabList>

  <TabPanels>
    <TabPanel>
      <HiveBlog tag={username} queryType={"blog"} />
      
    </TabPanel>
    <TabPanel>
      <p>Account : {account}</p>
      <p>About: {authorAbout} </p>
      <p>Has voted for the Hive witness: {hasVotedWitness ? 'Yes' : 'No'}</p>
    </TabPanel>
    <TabPanel>
    <List
      display="grid"
      gridTemplateColumns="repeat(auto-fill, minmax(192px, 1fr))"
      gap={4}
    >
      {followers.map((follower) => (
        <ListItem key={follower.follower}>
          <Image
            src={`https://images.hive.blog/u/${follower.follower}/avatar`}
            alt="profile avatar"
            borderRadius="10%"
            boxSize="120px"
            border="2px solid limegreen"
          />
          {follower.follower}
        </ListItem>
      ))}
    </List>
</TabPanel>
<TabPanel>
  <List>
  {followings.map((following) => (
  <ListItem key={following.following}>
    Follower: {following.follower}
  </ListItem>
))}

  </List>
</TabPanel>

  </TabPanels>
</Tabs>

        </Flex>
      </Box>
    </Box>
  );
}
