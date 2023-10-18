import React, { useState } from 'react';
import * as dhive from '@hiveio/dhive';
import {
  Input,
  Button,
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

// Define HiveOpts interface
interface HiveOpts {
  addressPrefix: string;
  chainId: string;
}

// Create opts object
const opts: HiveOpts = {
  addressPrefix: 'STM',
  chainId:
    'beeab0de00000000000000000000000000000000000000000000000000000000',
};

// Define the AuthObject type
interface AuthObject {
  weight_threshold: number;
  account_auths: Array<[string, number][]>;
  key_auths: Array<[string, number][]>;
}

// Function to check if a Hive account exists
const checkAccountExists = async (username: string): Promise<boolean> => {
  try {
    const accounts = await client.database.getAccounts([username]);
    return accounts.length === 0;
  } catch (error) {
    console.error('Error checking account:', error);
    return false;
  }
};

// Function to generate Hive keys for the user
const generateHiveKeys = (
  username: string,
  password: string
): {
  ownerKey: dhive.PrivateKey;
  activeKey: dhive.PrivateKey;
  postingKey: dhive.PrivateKey;
  memoKey: dhive.PublicKey;
} => {
  const ownerKey = dhive.PrivateKey.fromLogin(username, password, 'owner');
  const activeKey = dhive.PrivateKey.fromLogin(username, password, 'active');
  const postingKey = dhive.PrivateKey.fromLogin(username, password, 'posting');
  const memoKey = dhive.PrivateKey.fromLogin(
    username,
    password,
    'memo'
  ).createPublic(opts.addressPrefix);

  return {
    ownerKey,
    activeKey,
    postingKey,
    memoKey,
  };
};

function AccountChecker() {
  const [username, setUsername] = useState<string>('skatehacker');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>(
    'NgLq5sVgqTHTmDqzqRck4bnGDZM5UU9Z'
  );
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [captchaCompleted, setCaptchaCompleted] = useState<boolean | null>(
    null
  );

  const handleCheck = async () => {
    if (username) {
      const isAvailable = await checkAccountExists(username);

      if (isAvailable) {
        setShowSecondForm(true);
        setAccountAvailable(true);
      } else {
        console.log(
          'Account already exists. Please choose a different username.'
        );
        setAccountAvailable(false);
      }
    } else {
      console.log('Please enter a username.');
    }
  };

  const handleSignUp = async () => {
    if (accountAvailable && username && email) {
      if (!isValidEmail(email)) {
        console.log('Please enter a valid email address.');
        return;
      }

      const keys = generateHiveKeys(username, password);

      try {
        const ownerAuth: [string, AuthObject[]] = [
          '', // Owner public key
          [
            [keys.ownerKey.createPublic(opts.addressPrefix).toString(), 1],
          ],
        ] as any;

        const activeAuth: [string, AuthObject[]] = [
          '', // Active public key
          [
            [keys.activeKey.createPublic(opts.addressPrefix).toString(), 1],
          ],
        ] as any;

        const postingAuth: [string, AuthObject[]] = [
          '', // Posting public key
          [
            [keys.postingKey.createPublic(opts.addressPrefix).toString(), 1],
          ],
        ] as any;

        const op: dhive.Operation[] = [
          [
            'account_create',
            {
              fee: '3.000 HIVE',
              creator: 'skatehacker',
              new_account_name: username,
              owner: ownerAuth,
              active: activeAuth,
              posting: postingAuth,
              memo_key: keys.memoKey.toString(),
              json_metadata: '',
            },
          ],
        ];

        const privateKey = dhive.PrivateKey.fromString(
          ''
        );

        const result = await client.broadcast.sendOperations(op, privateKey);
        console.log(result);
        console.log('Account created successfully!', result);
      } catch (error) {
        console.error('Error creating account:', error);
      }
    } else {
      console.log('Please fill out all required fields.');
    }
  };

  const handleCaptchaCompletion = (completed: boolean) => {
    setCaptchaCompleted(completed);
  };

  const isValidEmail = (email: string) => {
    // Implement email validation logic here
    // You can use a regular expression or a library like 'validator' for this purpose
    return true; // Replace with your validation logic
  };

  return (
    <Center minH="100vh">
      {captchaCompleted === null ? (
        <CaptchaPage onCaptchaCompletion={handleCaptchaCompletion} />
      ) : (
        <VStack spacing={3}>
          <Text fontSize="xl">Choose a username!</Text>
          <Input
            placeholder="Enter Hive username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
              <Input
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Center>
                <Button margin="10px" colorScheme="teal" onClick={handleSignUp}>
                  Sign Up
                </Button>
              </Center>
            </FormControl>
          )}
        </VStack>
      )}
    </Center>
  );
}

export default AccountChecker;
