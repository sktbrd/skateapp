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
import { KeychainSDK, KeychainKeyTypes, KeychainRequestTypes } from 'keychain-sdk';

// Initialize the Hive client with API endpoints
const client = new dhive.Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

import useAuthUser from '../home/api/useAuthUser';

import { Operation } from '@hiveio/dhive';
type KeyRole = 'owner' | 'active' | 'posting' | 'memo';

interface KeyPair {
  privateKey: dhive.PrivateKey;
  publicKey: dhive.PublicKey;
}
const generateKeyPair = (account: string, password: string, role?: KeyRole): KeyPair => {
  const privateKey = role ? dhive.PrivateKey.fromLogin(account, password, role) : dhive.PrivateKey.fromLogin(account, password);
  const publicKey = privateKey.createPublic();
  return { privateKey, publicKey };
};


// Function to check if a Hive account exists
const checkAccountExists = async (desiredUsername: string) => {
  try {
    // Query the account using getAccounts method
    const accounts = await client.database.getAccounts([desiredUsername]);
    return accounts.length === 0;
  } catch (error) {
    console.error('Error checking account:', error);
    return false;
  }
};

function AccountCreation() {
  const [desiredUsername, setDesiredUsername] = useState('');
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [captchaCompleted, setCaptchaCompleted] = useState<boolean | null>(null);
  const { user } = useAuthUser() as any;

  const handleCheck = async () => {
    if (desiredUsername) {
      const isAvailable = await checkAccountExists(desiredUsername);

      if (isAvailable) {
        setShowSecondForm(true);
        setAccountAvailable(true);
      } else {
        console.log('Account already exists. Please choose a different desiredUsername.');
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

  const handleCreateAccount = async () => {
    try {
      // initialize keychain sdk
      const keychain = new KeychainSDK(window);
      let ops: Operation[] = [];

      if (user) {
        // Generate new key pairs for different authorities
        const ownerKeyPair = generateKeyPair(user.name, 'new_password', 'owner');
        const activeKeyPair = generateKeyPair(user.name, 'new_password', 'active');
        const postingKeyPair = generateKeyPair(user.name, 'new_password', 'posting');
        const memoKeyPair = generateKeyPair(user.name, 'new_password', 'memo');

        console.log('Owner Key Pair:', ownerKeyPair);
        console.log('Active Key Pair:', activeKeyPair);
        console.log('Posting Key Pair:', postingKeyPair);
        console.log('Memo Key Pair:', memoKeyPair);


        const createAccountOperation: Operation = [
          'account_create',
          {
            fee: '3.000 HIVE',
            creator: user.name,
            new_account_name: desiredUsername,
            owner: {
              weight_threshold: 1,
              account_auths: [],
              key_auths: [[ownerKeyPair.publicKey.toString(), 1]],
            },
            active: {
              weight_threshold: 1,
              account_auths: [],
              key_auths: [[activeKeyPair.publicKey.toString(), 1]],
            },
            posting: {
              weight_threshold: 1,
              account_auths: [],
              key_auths: [[postingKeyPair.publicKey.toString(), 1]],
            },
            memo_key: memoKeyPair.publicKey.toString(),
            json_metadata: '',
            extensions: [],
          },
        ];

        console.log(createAccountOperation);


        ops.push(createAccountOperation);

        const formParamsAsObject = {
          type: KeychainRequestTypes.broadcast,
          username: user.name,
          operations: ops,
          method: KeychainKeyTypes.active,
        };

        console.log(formParamsAsObject);
        const broadcast = await keychain.broadcast(formParamsAsObject);
        console.log(broadcast);
      } else {
        console.log('no user');
      }
    } catch (error) {
      console.error('Error during KeychainSDK interaction:', error);
    }
  };



  return (
    <Center minH="100vh">
      <VStack spacing={3}>
        <Text fontSize="36px">Invite a Shredder to Skatehive</Text>
        <img src="https://i.ibb.co/Lv5C8rZ/nft-unscreen.gif" alt="skatehive" />
        <Text fontSize="xl">Choose a username!</Text>
        <Input
          placeholder="Enter Hive username"
          value={desiredUsername}
          onChange={(e) => setDesiredUsername(e.target.value)}
        />
        <Button colorScheme="teal" onClick={handleCheck}>
          Is it available?
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
            <Center>
              <Button onClick={handleCreateAccount} margin="10px" colorScheme="teal">
                Sign Up
              </Button>
            </Center>
          </FormControl>
        )}
      </VStack>
    </Center>
  );
}

export default AccountCreation;
