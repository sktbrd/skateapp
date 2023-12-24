import React, { useEffect, useState } from 'react';
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
  Checkbox,
  Image,
} from '@chakra-ui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { KeychainSDK, KeychainKeyTypes, KeychainRequestTypes } from 'keychain-sdk';
import { KeyRole } from '@hiveio/dhive';
import '@fontsource/creepster';

// Initialize the Hive client with API endpoints
const client = new dhive.Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

import useAuthUser from '../home/api/useAuthUser';

import { Operation } from '@hiveio/dhive';

// generate random password
const generatePassword = () => {
  const array = new Uint32Array(10);
  crypto.getRandomValues(array);

  const key = 'SKATE000' + dhive.PrivateKey.fromSeed(array.toString()).toString();
  return key.substring(0, 25);
}

// generate account keys from username and password
const getPrivateKeys = (username: string, password: string, roles = ['owner', 'active', 'posting', 'memo']) => {
  const privKeys = {} as any;
  roles.forEach((role) => {
    privKeys[role] = dhive.PrivateKey.fromLogin(username, password, role as KeyRole).toString();
    privKeys[`${role}Pubkey`] = dhive.PrivateKey.from(privKeys[role]).createPublic().toString();
  });

  return privKeys;
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

const copyToClipboard = (text: string) => {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

function AccountCreation() {
  const [desiredUsername, setDesiredUsername] = useState('');
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [isCheckedOnce, setIsCheckedOnce] = useState(false);
  const [captchaCompleted, setCaptchaCompleted] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [keys, setKeys] = useState<any>(null);
  const [downloadText, setDownloadText] = useState('');
  const [areKeysDownloaded, setAreKeysDownloaded] = useState(false);
  const [charactersToShow, setCharactersToShow] = useState(0);

  const { user } = useAuthUser() as any;


  const handleCheck = async () => {
    if (desiredUsername) {
      const isAvailable = await checkAccountExists(desiredUsername);

      setIsCheckedOnce(true);

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

  const handleGenerateKeys = () => {
    // Generate new key pairs for different authorities
    const masterPassword = generatePassword();
    setMasterPassword(masterPassword);

    const keys = getPrivateKeys(desiredUsername, masterPassword);
    setKeys(keys);

    console.log(masterPassword);
    console.log(keys);

    // create download text
    let text = `Username: ${desiredUsername}\n\n`;
    text += `Master Password (Backup): ${masterPassword}\n\n`;
    text += `Owner Private Key: ${keys.owner}\n\n`;
    text += `Active Private Key: ${keys.active}\n\n`;
    text += `Posting Private Key: ${keys.posting}\n\n`;
    text += `Memo Private Key: ${keys.memo}\n\n\n\n`;
    text += `Email: ${email}\n`
    text += `Account created: ${new Date().toUTCString()}\n`;
    text += `Account created by: ${user.name}\n`;
    text += `Account created on SKATEHIVE! - skatehive.app`;
    setDownloadText(text);
  }

  const handleCreateAccount = async () => {
    try {
      // initialize keychain sdk
      const keychain = new KeychainSDK(window);
      let ops: Operation[] = [];

      if (user) {
        const createAccountOperation: Operation = [
          'account_create',
          {
            fee: '3.000 HIVE',
            creator: user.name,
            new_account_name: desiredUsername,
            owner: dhive.Authority.from(keys.ownerPubkey),
            active: dhive.Authority.from(keys.activePubkey),
            posting: dhive.Authority.from(keys.postingPubkey),
            memo_key: keys.memoPubkey,
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

  useEffect(() => {
    const intervalTime = 30; // Increase the interval time for a smoother display
    const timer = setInterval(() => {
      setCharactersToShow((prevChars) => {
        if (prevChars >= downloadText.length) {
          clearInterval(timer);
        }
        return prevChars + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [downloadText]);



  return (
    <Flex
      style={{
        backgroundImage: "url('https://i.ibb.co/Lv5C8rZ/nft-unscreen.gif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh', // Set height to 100% of the viewport height
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <VStack spacing={3}>
        <Text fontFamily="Creepster" fontSize="66px" color="white">Invite a Shredder to Skatehive</Text>
        <Text fontFamily="Creepster" fontSize="48px" color={"yellow"}>Choose a username!</Text>
        <Input
          placeholder="Enter Hive username"
          backdropBlur={4}
          bg={"black"}
          value={desiredUsername}
          onChange={(e) => setDesiredUsername(e.target.value)}
        />
        <Button colorScheme="yellow" border={"2px solid black"} onClick={handleCheck}>
          Is it available?
        </Button>
        <Flex border={"2px solid yellow"} borderRadius="5px" bg={"black"} p={"5px"} align="center" display={isCheckedOnce ? 'flex' : 'none'}>
          {accountAvailable ? (
            <Icon as={FaCheck} color="green" />
          ) : (
            <Icon as={FaTimes} color="red" />
          )}
          <Text color={accountAvailable ? "yellow" : "white"} ml={2}>
            {accountAvailable ? 'Account available' : 'Account unavailable'}
          </Text>
        </Flex>

        {showSecondForm && (
          <FormControl>
            {/* <FormLabel>Enter Your Email</FormLabel> */}
            {/* <Input bg={"black"} placeholder="Your email" value={email} onChange={(e) =>
              setEmail(e.target.value)
            } /> */}

            <Center>
              <Button colorScheme="yellow" border={"2px solid black"} onClick={handleGenerateKeys} marginTop={5}>
                Generate Keys
              </Button>
            </Center>
            <Flex
              display={keys ? 'flex' : 'none'}
              direction="column"
              align="center"
              justify="center"
              marginTop={5}
            >
              <Flex width="100%" gap={2} justifyContent="flex-end" marginBottom={5}>
                <Button colorScheme="teal" onClick={() => copyToClipboard(downloadText)}>
                  Copy Keys
                </Button>
                <Button colorScheme="teal" onClick={() => {
                  const element = document.createElement("a");
                  const file = new Blob([downloadText], { type: 'text/plain' });
                  element.href = URL.createObjectURL(file);
                  element.download = `KEYS BACKUP - @${desiredUsername.toUpperCase()}.txt`;
                  document.body.appendChild(element); // Required for this to work in FireFox
                  element.click();

                  setAreKeysDownloaded(true);
                }}>
                  Download Keys
                </Button>
              </Flex>

              <Text
                width="100%"
                borderRadius="15"
                padding={5}
                background="#252525"
                whiteSpace="pre">
                {downloadText.slice(0, charactersToShow)}
              </Text>

            </Flex>

            <Center display={keys ? 'flex' : 'none'}>
              <Checkbox colorScheme="teal" size="lg" isChecked={areKeysDownloaded} onChange={(e) => setAreKeysDownloaded(e.target.checked)}>
                I have downloaded my keys.
              </Checkbox>
              <Button onClick={handleCreateAccount} margin="10px" colorScheme="teal" isDisabled={areKeysDownloaded ? false : true}>
                Sign Up
              </Button>
            </Center>
          </FormControl>
        )}
      </VStack>
    </Flex>
  );
}

export default AccountCreation;
