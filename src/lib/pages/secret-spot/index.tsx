import React, { useState } from 'react';
import * as dhive from '@hiveio/dhive';
import {
  Input,
  Button,
  Box,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Icon,
  Center,
  Flex,
} from '@chakra-ui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import CaptchaPage from './captcha';
import { FaUserSecret } from 'react-icons/fa';
import Shelf from '../home/videos/lbry';
// Initialize the Hive client with API endpoints
const client = new dhive.Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

// Function to check if a Hive account exists

function PepeCaptcha() {
  const [captchaCompleted, setCaptchaCompleted] = useState<boolean | null>(null);



  // Callback function to set the captcha completion status
  const handleCaptchaCompletion = (completed: boolean) => {
    setCaptchaCompleted(completed);
  };

  return (
    <Center minH="100vh">
      {captchaCompleted === null ? (
        // Display the captcha only if its completion status is not set
        <CaptchaPage onCaptchaCompletion={handleCaptchaCompletion} />
      ) : (
        <Shelf />
                    )}
      
    </Center>
  );
}

export default PepeCaptcha;
