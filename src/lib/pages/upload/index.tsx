import React, { useState } from 'react';
import {
  Box,

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
    <Box position="relative">  {/* This wrapper Box is added to position the Chat component correctly */}
      {isUserLoggedIn ? (
        <NewUpload /> // Render NewUpload component when the user is logged in
      ) : (
        <center>
          <img src="/assets/gifs/crows1.gif" />
          <p>User not logged in. Please log in to upload content.</p>  
        </center>
      )}
      <Chat />
    </Box>
  );
}

export default UploadPage;
