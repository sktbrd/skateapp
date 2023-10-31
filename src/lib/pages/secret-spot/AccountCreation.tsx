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

// Initialize the Hive client with API endpoints
const client = new dhive.Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

// Function to check if a Hive account exists
const checkAccountExists = async (username: string) => {
  try {
    // Query the account using getAccounts method
    const accounts = await client.database.getAccounts([username]);

    return accounts.length === 0;
  } catch (error) {
    console.error('Error checking account:', error);
    return false;
  }
};

function AccountCreation() {
  const [username, setUsername] = useState('');
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [captchaCompleted, setCaptchaCompleted] = useState<boolean | null>(null);

  const handleCheck = async () => {
    if (username) {
      const isAvailable = await checkAccountExists(username);

      if (isAvailable) {
        setShowSecondForm(true);
        setAccountAvailable(true);
      } else {
        console.log('Account already exists. Please choose a different username.');
        setAccountAvailable(false);
      }
    } else {
      console.log('Please enter a username.');
    }
  };

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
        <VStack spacing={3}>
          <p> You got It !</p>
          <img src="https://i.ibb.co/Lv5C8rZ/nft-unscreen.gif" ></img>
          <Text fontSize="xl">Choose a username !</Text>
          <Input
            placeholder="Enter Hive username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button colorScheme="teal" onClick={handleCheck}>
            Is it available ?
          </Button>
          <Flex align="center">
            {accountAvailable ? (
              <Icon as={FaCheck} color="green" />
            ) : (
              <Icon as={FaTimes} color="red" />
            )}
            <Text ml={2}>
              {accountAvailable ? 'Account available' : 'Account unavailable'}
            </Text>
          </Flex>

          {showSecondForm && (
            <FormControl>
              <FormLabel>Enter Your Email</FormLabel>
              <Input placeholder="Your email" />
              <center>
                <Button margin="10px" colorScheme="teal">
                  Sign Up
                </Button>
              </center>
            </FormControl>
          )}
        </VStack>
      )}
    </Center>
  );
}

export default AccountCreation;
