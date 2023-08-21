// TutorialPage.tsx

import React from 'react';
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
  Link
} from '@chakra-ui/react';
import { FaDiscord } from 'react-icons/fa';

const DesktopTutorial: React.FC = () => {
  return (
    <VStack spacing={4} justifyContent="center" alignItems="center" width="100%">
      <Image borderRadius="10px" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdsr0CBSW8SIppxzyJMCoqvAfjRI0HUjBKDw&usqp=CAU" />
      <Text fontSize="22px" >1st Step) Download Hive Keychain for your Browser</Text>
      <HStack spacing={4}>
        <Link href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep?hl=en" isExternal>
          <Image src="https://hive-keychain.com/img/browsers/chrome.svg" alt="Chrome" boxSize="70px" />
        </Link>
        <Link href="https://addons.mozilla.org/en-US/firefox/addon/hive-keychain/" isExternal>
          <Image src="https://hive-keychain.com/img/browsers/firefox.svg" alt="Firefox" boxSize="70px" />
        </Link>
        <Link href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep?hl=en" isExternal>
          <Image src="https://hive-keychain.com/img/browsers/brave.svg" alt="Brave" boxSize="70px" />
        </Link>
      </HStack>
    </VStack>
  )
}

const MobileTutorial: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Image src="https://gifdb.com/images/high/pepe-frog-using-phone-in-bed-cyn9sh5ok3f1lb21.gif" boxSize="200px" />
      <Text fontSize="22px">
         <Box as="span" color="white" fontWeight="bold">1st Step)</Box> Download Hive Keychain in your Mobile app Store
      </Text>
      <HStack justifyContent="space-between" width="100%" padding="20px">
        <VStack>
          <Text fontSize="22px">Android</Text>
          <Link href="https://play.google.com/store/apps/details?id=com.mobilekeychain" isExternal>
            <Image src="https://hive-keychain.com/img/browsers/android.svg" alt="Android" />
          </Link>
        </VStack>
        <VStack>
          <Text fontSize="22px" >iOS</Text>
          <Link href="https://apps.apple.com/us/app/hive-keychain/id1552190010" isExternal>
            <Image src="https://hive-keychain.com/img/browsers/ios.svg" alt="iOS" />
          </Link>
        </VStack>
      </HStack>
      <Text fontSize="22px">
        <Box as="span" color="white" fontWeight="bold">2nd Step)</Box> Get Hive Keys in Skatehive Discord Server
      </Text>
      <Button
      bg="black"
      color="white"
      fontSize="lg"
      fontWeight="bold"
      borderColor="limegreen"
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
      padding="1rem 2rem"
      leftIcon={<FaDiscord />}
    >
      Join Discord
    </Button>
    <Text fontSize="22px">
      <Box as="span" color="white" fontWeight="bold">3rd Step)</Box> Insert your keys in Hive Keychain
    </Text>
      <Image src="https://i.ibb.co/LtGVNRp/image.png" borderRadius="10px"></Image>
    <Text fontSize="22px">
      <Box as="span" color="white" fontWeight="bold">4th Step)</Box> Enter in HiveKeychain Browser
    </Text>
    </Box>
  )
}

const TutorialPage: React.FC = () => {
  return (
    <Box width="100%">
      <VStack width="100%">
        <Heading>We didnt find your wallet!</Heading>
        <Text align="center">
          Here is how you can access SkateHive, and yeah we know, it should be easier 
          <br />
          First, where are you going to use Skatehive ?
        </Text>

        {/* Tabs */}
        <Tabs variant="soft-rounded" width="100%" maxW="600px" mx="auto">
          <TabList justifyContent="center">
            <Tab _selected={{ border: '1px limegreen solid' ,color: 'white', bg: 'black' }}>Mobile</Tab>
            <Tab _selected={{ border: '1px limegreen solid' ,color: 'white', bg: 'black' }}>Desktop</Tab>
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
