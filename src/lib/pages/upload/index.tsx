import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,

} from '@chakra-ui/react';
import NewUpload from './newUpload';
import Chat from '../home/chat';
import useAuthUser from '../home/api/useAuthUser';
interface User {
  name?: string;
}
const UploadPage = () => {

  const { user } = useAuthUser() as { user: User | null };
  const isUserLoggedIn = !!user; // Check if the user is logged in

  return (
    <Box >  {/* This wrapper Box is added to position the Chat component correctly */}
      {isUserLoggedIn ? (
        <NewUpload /> // Render NewUpload component when the user is logged in
      ) : (
        <center>

          <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F4.bp.blogspot.com%2F-LREcRjW-L18%2FVxTVTk4ju3I%2FAAAAAAAAAJQ%2FQzXPrXjegs01Bm9WhWdUJZhv-jakMfXZwCK4B%2Fs1600-r%2Fgifs-pikachu.gif&f=1&nofb=1&ipt=433c3bec51363457a920b5db0eb0dd466261f71203c0140ea5dd05cbdfc026ac&ipo=images" />
          <Text> User not logged in. Please log in to upload content. </Text>
        </center>
      )}
      <Chat />
    </Box>
  );
}

export default UploadPage;
