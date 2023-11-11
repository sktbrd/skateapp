import { Image, Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Tooltip, Button, List, ListItem, Avatar } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import HiveBlog from "../home/Feed/Feed";
import HiveBalanceDisplay2 from "../wallet/hive/hiveBalance";
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
          const witnessVotes = author_account[0].witness_votes;
          const hasVotedWitness = witnessVotes.includes('skatehive');
          setHasVotedWitness(hasVotedWitness);
          const response = await client.database.getAccounts([authorName])

        } catch (error) {
          console.error('Error fetching author metadata:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [username]);

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
      console.log("YO",followersResponse.data.result)
      console.log("YO",followingsResponse.data.result)
      setFollowers(followersResponse.data.result);
      setFollowings(followingsResponse.data.result);
    } catch (error) {
      console.error('Error fetching followers and followings:', error);
    }
  }
  


  useEffect(() => {
    const loggeduser = user?.user?.name;

  }, [user]);
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
  
    // Check if the user is already following the author
    const isAlreadyFollowing = isFollowing;
  
    // Determine the follow type based on the current following status
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
          "display_msg": "Follow pharra"
        }
      }
    
      const custom = await keychain.custom(formParamsAsObject.data as Custom);
      
      console.log({ custom });
    } catch (error) {
      console.log({ error });
    }
    

  
  
  
  };
  

  return (
    <Box
      fontFamily="'Courier New', monospace"
      position="relative"
      overflow="hidden"
      maxWidth="100%"  
      margin="0 auto"     
    >
      <Image src={coverImageUrl} alt="Cover Image" maxH="340px" width="100%" objectFit="cover" />
      <Flex alignItems="center" justifyContent="center" padding="10px" position="relative" zIndex="1">
      <Button marginLeft="75%"  border={"1px solid white"} bg={"transparent"} color={"white"} zIndex="1" position="absolute" _hover={{bg:"black"}} onClick={handleFollow}>
        {isFollowing ? "Deixar de seguir" : "Seguir"}
      </Button>
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
            src={`https://images.hive.blog/u/${authorName}/avatar`}
            alt="profile avatar"
            borderRadius="10%"
            boxSize="192px"
            border="2px solid white"
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
              boxSize="48px" 
            />
            </Tooltip>
          )}
        </Box>
        <center>
          <Text  fontSize={"26px"}> {authorName}</Text>
        </center>

      </Flex>
      <Box marginTop={"10px"}>

        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
        > 

        <Tabs variant={"unstyled"}  colorScheme="green">
  <TabList  color={"white"} justifyContent="center">
    <Tab borderRadius={"10px"} border={"1px solid "}>Posts</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>Sobre o demônio</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>Seguidores</Tab>
    <Tab borderRadius={"10px"} border={"1px solid "}>Seguindo</Tab>


  </TabList>

  <TabPanels>
    <TabPanel>
      <HiveBlog tag={username} queryType={"blog"} />
    </TabPanel>
    <TabPanel>
      <p>Contrato : {account}</p>
      <p>Sobre o demônio: {authorAbout} </p>
      <p>Pacto profundo: {hasVotedWitness ? 'Yes' : 'No'}</p>
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
            border="2px solid white"
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