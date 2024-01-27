import React, { useEffect, useState } from 'react';
import { Box, Image, Text } from '@chakra-ui/react';
import NewUpload from './newUpload';
import Chat from '../home/chat';
import useAuthUser from '../../components/useAuthUser';
import * as dhive from "@hiveio/dhive";
import IntroductionPost from './newbieUpload';

interface User {
  name?: any;
  posting_json_metadata?: string;
}

const UploadPage = () => {
  const { user } = useAuthUser() as { user: User | null };
  const isUserLoggedIn = !!user;
  const [account, setAccount] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      try {

        // Ensure user is defined before creating dhiveClient
        if (user) {
          const dhiveClient = new dhive.Client([
            'https://api.hive.blog',
            'https://api.hivekings.com',
            'https://anyx.io',
            'https://api.openhive.network',
          ]);

          const accountData = await dhiveClient.database.getAccounts([user.name]);


          // Set the account state for potential future use
          setAccount(accountData[0].post_count.toString());
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Call the fetchAccount function
    if (user) {
      fetchAccount();
    }
  }, [user]);

  return (
    <Box>
      {isUserLoggedIn ? (
        // Use conditional rendering based on post_count
        account === '0' ? (
          <IntroductionPost />
        ) : (
          <NewUpload />
        )
      ) : (
        <center>
          <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F4.bp.blogspot.com%2F-LREcRjW-L18%2FVxTVTk4ju3I%2FAAAAAAAAAJQ%2FQzXPrXjegs01Bm9WhWdUJZhv-jakMfXZwCK4B%2Fs1600-r%2Fgifs-pikachu.gif&f=1&nofb=1&ipt=433c3bec51363457a920b5db0eb0dd466261f71203c0140ea5dd05cbdfc026ac&ipo=images" />
          <Text>User not logged in. Please log in to upload content.</Text>
        </center>
      )}
      <Chat />
    </Box>
  );
};

export default UploadPage;
