import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Image,
  Link,
  Divider
} from '@chakra-ui/react';
import { FaDiscord } from 'react-icons/fa';
import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';

const TerminalEffectComponent: React.FC = () => {
  const headingRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const optionsForHeading = {
      strings: ["We didn't find your wallet!"],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 1000,
      startDelay: 500,
      showCursor: true,
      cursorChar: '',
      onComplete: (self: any) => {
        new Typed(textRef.current, optionsForText);
      }
    };

    const optionsForText = {
      strings: [
        'Here is how you can access SkateHive, and yeah we know, it should be easier.',
        'First, where are you going to use Skatehive?'
      ],
      typeSpeed: 50,
      backSpeed: 10,
      backDelay: 1000,
      startDelay: 500,
      showCursor: true,
      cursorChar: ''
    };

    new Typed(headingRef.current, optionsForHeading);

    return () => {
      // Destroy Typed instance on component unmount to prevent memory leaks
      optionsForHeading.onComplete = () => { };
    };
  }, []);

  return (
    <VStack>
      <Heading ref={headingRef}></Heading>
      <Text align="center" ref={textRef}></Text>
    </VStack>
  );
}




const DesktopTutorial: React.FC = () => {
  return (
    <Box maxWidth="fit-content" margin="auto">
      <VStack spacing={4} justifyContent="center" alignItems="center" width="100%">
        <Image borderRadius="10px" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdsr0CBSW8SIppxzyJMCoqvAfjRI0HUjBKDw&usqp=CAU" />

        <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
          <HStack spacing={2}>
            <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">1st Step)</Text>
            <Text fontSize="22px">Download Hive Keychain for your Browser and pin it 📌 </Text>
          </HStack>
          <HStack spacing={4} justifyContent="center">
            <VStack padding="20px" alignItems="center" spacing={2}>
              <Link href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep?hl=en" isExternal>
                <Image src="https://hive-keychain.com/img/browsers/chrome.svg" alt="Chrome" boxSize="70px" />
              </Link>
              <Text>Chrome</Text>
            </VStack>
            <VStack padding="20px" alignItems="center" spacing={2}>
              <Link href="https://addons.mozilla.org/en-US/firefox/addon/hive-keychain/" isExternal>
                <Image src="https://hive-keychain.com/img/browsers/firefox.svg" alt="Firefox" boxSize="70px" />
              </Link>
              <Text>Firefox</Text>
            </VStack>
            <VStack padding="20px" alignItems="center" spacing={2}>
              <Link href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep?hl=en" isExternal>
                <Image src="https://hive-keychain.com/img/browsers/brave.svg" alt="Brave" boxSize="70px" />
              </Link>
              <Text>Brave</Text>
            </VStack>
          </HStack>
        </Box>

        {/* 2nd Step */}
        <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
          <HStack spacing={2}>
            <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">2nd Step)</Text>
            <Text fontSize="xl">
              Get Hive Keys in Skatehive Discord Server or
              {' '}
              <Link href='https://docs.skatehive.app/docs/Create-Wallets/hive-wallet' isExternal color="yellow">
                create one by yourself (hard mode)
              </Link>
            </Text>
          </HStack>
          <VStack alignItems="center" spacing={4}>
            <Button
              bg="black"
              color="white"
              fontSize="lg"
              fontWeight="bold"
              border="1px solid limegreen"
              padding="20px"
              borderWidth="2px"
              _hover={{
                bg: "limegreen",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }}
              _active={{
                bg: "gray.800",
                transform: "translateY(0)",
                boxShadow: "none"
              }}
              transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
              boxShadow="0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)"
              lineHeight="1"
              borderRadius="16px"
              leftIcon={<FaDiscord />}
            >
              Join Discord
            </Button>
          </VStack>
        </Box>

        {/* 3rd Step */}
        <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
          <HStack spacing={2}>
            <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">3rd Step)</Text>
            <Text fontSize="xl">Set up your Keychain Browser Extension adding your BACKUP key to it</Text>
          </HStack>
          <VStack alignItems="center" spacing={4}>
            <Image width="auto" height="450px" src="https://hackmd.io/_uploads/ByROGywjh.png" borderRadius="20px" border="1px solid limegreen" borderWidth="2px" />
          </VStack>
        </Box>

        {/* 4th Step */}
        <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
          <HStack spacing={2}>
            <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">4th Step)</Text>
            <Text fontSize="xl">Connect your wallet in Skatehive.App and Keep it Gnarly ⌐◨-◨ </Text>
          </HStack>

        </Box>
      </VStack>
    </Box>
  );
}





const MobileTutorial: React.FC = () => {
  return (
    <VStack spacing={4} alignItems="center" width="100%">
      <Image src="https://gifdb.com/images/high/pepe-frog-using-phone-in-bed-cyn9sh5ok3f1lb21.gif" boxSize="200px" />

      <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
        <HStack spacing={2}>
          <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">1st Step)</Text>
          <Text fontSize="xl">Download Keychain in your Mobile app Store</Text>
        </HStack>
        <VStack alignItems="center" spacing={4}>
          <HStack justifyContent="space-between" width="80%" padding="20px">
            <VStack>
              <Text fontSize="xl">Android</Text>
              <Link href="https://play.google.com/store/apps/details?id=com.mobilekeychain" isExternal>
                <Image src="https://hive-keychain.com/img/browsers/android.svg" alt="Android" border="1px solid limegreen" borderWidth="2px" borderRadius="md" />
              </Link>
            </VStack>
            <VStack>
              <Text fontSize="xl">iOS</Text>
              <Link href="https://apps.apple.com/us/app/hive-keychain/id1552190010" isExternal>
                <Image src="https://hive-keychain.com/img/browsers/ios.svg" alt="iOS" border="1px solid limegreen" borderWidth="2px" borderRadius="md" />
              </Link>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
        <HStack spacing={2}>
          <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">2nd Step)</Text>
          <Text fontSize="xl">
            Get Hive Keys in Skatehive Discord Server or
            {' '}
            <Link href='https://docs.skatehive.app/docs/Create-Wallets/hive-wallet' isExternal color="yellow">
              create one by yourself (hard mode)
            </Link>
          </Text>
        </HStack>
        <VStack alignItems="center" spacing={4}>
          <Button
            bg="black"
            color="white"
            fontSize="lg"
            fontWeight="bold"
            border="1px solid limegreen"
            padding="20px"
            borderWidth="2px"
            _hover={{
              bg: "limegreen",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
            _active={{
              bg: "gray.800",
              transform: "translateY(0)",
              boxShadow: "none"
            }}
            transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
            boxShadow="0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)"
            lineHeight="1"
            borderRadius="16px"
            leftIcon={<FaDiscord />}
          >
            Join Discord
          </Button>
        </VStack>
      </Box>

      <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
        <HStack spacing={2}>
          <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">3rd Step)</Text>
          <Text fontSize="xl">Insert your BACKUP key in Hive Keychain App</Text>
        </HStack>
        <VStack alignItems="center" spacing={4}>
          <Image width="auto" height="450px" src="https://i.ibb.co/HVYRn10/ezgif-com-gif-maker.gif" borderRadius="20px" border="1px solid limegreen" borderWidth="2px" />
        </VStack>
      </Box>

      <Box borderWidth="1px" borderRadius="md" padding="10px" width="100%">
        <HStack spacing={2}>
          <Text padding="5px" borderRadius="10px" border="1px solid white" fontSize="22px" fontWeight="bold" color="white">4th Step)</Text>
          <Text fontSize="xl">Enter in Hive Keychain in Browser Mode and be free</Text>
        </HStack>
        <VStack alignItems="center" spacing={4}>
          <Image width="auto" height="450px" src="https://i.ibb.co/3zBtmPk/browser.gif" borderRadius="20px" border="1px solid limegreen" borderWidth="2px" />
        </VStack>
      </Box>
    </VStack>
  )
}





const TutorialPage: React.FC = () => {
  return (
    <Box>
      <VStack>
        <TerminalEffectComponent />
        {/* Tabs */}
        <Tabs variant="soft-rounded" maxW="100%">
          <TabList justifyContent="center">
            <Tab _selected={{ border: '1px limegreen solid', color: 'white', bg: 'black' }}>Mobile</Tab>
            <Tab _selected={{ border: '1px limegreen solid', color: 'white', bg: 'black' }}>Desktop</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <MobileTutorial />
            </TabPanel>
            <TabPanel>
              <DesktopTutorial />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
}

export default TutorialPage;


