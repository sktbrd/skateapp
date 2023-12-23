import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Tabs,
  TabList,
  Tab,
  TabProps,
  useBreakpointValue,
  Image,
  Avatar,
  Modal,
  ModalOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,

  Menu,

  VStack,
  MenuButton,
  MenuGroup,
  MenuList,
  MenuItem,
  Button,
  Select,
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";
import { Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';


import { Link, LinkProps as RouterLinkProps } from "react-router-dom";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import HiveLogin from "lib/pages/home/api/HiveLoginModal";

import { fetchHbdPrice } from "lib/pages/wallet/hive/hiveBalance";
import { fetchConversionRate } from "lib/pages/wallet/hive/hiveBalance";

import axios from "axios";
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
import { MdTapAndPlay } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { profile } from "console";
import { FaLink } from "react-icons/fa";
import * as dhive from "@hiveio/dhive";

type LinkTabProps = TabProps & RouterLinkProps;

interface User {
  name?: string;
  avatar?: string;
  balance: string;
}
interface Notification {
  date: string;
  id: number;
  msg: string;
  score: number;
  type: string;
  url: string;
}
interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const LinkTab: React.FC<LinkTabProps> = ({ to, children, ...tabProps }) => (
  <Link to={to}>
    <Tab {...tabProps}>{children}</Tab>
  </Link>
);

const HeaderNew = () => {
  const { state } = usePioneer();

  const fontSize = useBreakpointValue({ base: "2xl", md: "3xl" });
  const tabSize = useBreakpointValue({ base: "sm", md: "md" });
  const flexDirection = useBreakpointValue<"row" | "column">({ base: "column", md: "column" });
  const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";


  const { user, loginWithHive, logout, isLoggedIn } = useAuthUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [totalNetWorth, setTotalNetWorth] = useState<number | null>(0.00);
  const [evmWallet, setEvmWallet] = useState<string | null>(null);
  const { api, app, context, assetContext, blockchainContext, pubkeyContext, status } = state;
  const [gnarsNFTsCount, setGnarsNFTsCount] = useState<number | null>(0);
  const [wallet_address, setWalletAddress] = useState<string | null>(null);
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationArray, setNotificationArray] = useState<Notification[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, string>>({});


  const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, notifications }) => {
    const msgRegex = /@([\w-]+)\s(.+)/;

    const extractMsgDetails = (msg: string) => {
      const match = msg.match(msgRegex);
      return match ? { author: match[1], text: match[2] } : { author: '', text: msg };
    };

    const [avatarSrcMap, setAvatarSrcMap] = useState<Record<string, string | null>>({});
    const calculateTimeAgo = (timestamp: string) => {
      const notificationTime = new Date(timestamp);

      // Get the user's local time zone offset in minutes
      const userTimeZoneOffset = new Date().getTimezoneOffset();

      // Adjust the notification time to the user's local time zone
      const notificationTimeLocal = new Date(notificationTime.getTime() - userTimeZoneOffset * 60 * 1000);

      const timeDifference = new Date().getTime() - notificationTimeLocal.getTime();
      const minutesAgo = Math.floor(timeDifference / (1000 * 60));

      // If the notification time is more than 24 hours ago, show the full date
      if (minutesAgo > 24 * 60) {
        return notificationTimeLocal.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      }

      // Otherwise, show the time difference in a user-friendly manner
      return `${Math.abs(minutesAgo)} ${Math.abs(minutesAgo) === 1 ? 'minute' : 'minutes'} ago`;
    };


    const fetchAvatarAndFallback = async (authors: string[]): Promise<void> => {
      try {
        const dhiveClient = new dhive.Client([
          'https://api.hive.blog',
          'https://api.hivekings.com',
          'https://anyx.io',
          'https://api.openhive.network',
        ]);

        const dhive_profiles = await dhiveClient.database.getAccounts(authors);
        const avatarSrcMap: Record<string, string | null> = {};

        dhive_profiles.forEach(profile => {
          const author = profile.name;
          const json_metadata = JSON.parse(profile.posting_json_metadata);
          const profileImage = json_metadata.profile?.profile_image;

          avatarSrcMap[author] = profileImage;
        });

        // Use the callback form to ensure the state is updated correctly
        setAvatarSrcMap(prevMap => ({
          ...prevMap,
          ...avatarSrcMap,
        }));
      } catch (error) {
        // Fallback to default avatar for failed requests
        authors.forEach(author => {
          setAvatarSrcMap(prevMap => ({
            ...prevMap,
            [author]: DEFAULT_AVATAR_URL,
          }));
        });
      }
    };

    useEffect(() => {
      // Fetch avatar for unique authors in notifications
      const uniqueAuthors = Array.from(new Set(notifications.map(notification => extractMsgDetails(notification.msg).author)));
      fetchAvatarAndFallback(uniqueAuthors);
    }, [notifications]);



    return (
      <Popover isOpen={isOpen} onClose={onClose}>
        <PopoverTrigger>
          <Text></Text>
        </PopoverTrigger>
        <PopoverContent maxH={'756px'} minW={'80%'} bg="black" color="white" borderColor="limegreen">
          <PopoverCloseButton />
          <PopoverHeader>Notifications</PopoverHeader>
          <PopoverBody overflow={'auto'}>
            {notifications.map((notification) => {
              const author = extractMsgDetails(notification.msg).author;
              const avatarSrc = avatarSrcMap[author];

              return (
                <Box key={notification.id} mb={4} p={4} borderWidth="1px" borderRadius="md">
                  <HStack spacing={4}>
                    <Box boxSize={'56px'}>
                      <Link to={`https://skatehive.app/profile/${author}`} style={{ cursor: 'pointer', textDecoration: 'none' }}>

                        <VStack>
                          {avatarSrc && (
                            <Image
                              src={String(avatarSrc)}
                              alt="Author Avatar"
                              boxSize="40px"
                              borderRadius="full"
                              objectFit="cover"
                              mr={2}
                              onError={(e) => {
                                console.error('Error loading image:', e);
                                e.currentTarget.src = DEFAULT_AVATAR_URL; // Fallback to default avatar
                              }}
                            />
                          )}
                          <Text color="orange" fontSize="10px" fontWeight="bold">
                            {extractMsgDetails(notification.msg).author}
                          </Text>
                        </VStack>
                      </Link>
                    </Box>

                    <Text fontSize="sm">{extractMsgDetails(notification.msg).text}</Text>

                    {/* assemble link with https://skatehive.app/post/hive-173115/{notification.url} */}
                    <Link
                      to={`https://skatehive.app/post/hive-173115/${notification.url}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <FaLink />
                    </Link>
                  </HStack>
                  <Text align={"right"} fontSize="xs" color="gray.500">
                    {calculateTimeAgo(notification.date)}
                  </Text>
                </Box>
              );
            })}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  };






  const fetchNotifications = async () => {
    try {
      const response = await axios.post(
        'https://api.hive.blog', // Update the API endpoint as needed
        {
          jsonrpc: '2.0',
          method: 'bridge.account_notifications',
          params: {
            account: user?.name, // Assuming `user?.name` contains the account name
            limit: 15, // Adjust the limit as needed
          },
          id: 1,
        }
      );

      setNotifications(response.data.result); // Assuming the notifications are in `result` property
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };


  useEffect(() => {
    if (loggedIn) {
      fetchNotifications();
    }
  }, [loggedIn, user]);
  const handleNotificationClick = () => {
    setNotificationModalOpen(true);
  };
  const onLoad = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0 && app.wallets[0].wallet && app.wallets[0].wallet.accounts) {

        const currentAddress = app.wallets[0].wallet.accounts[0];
        setWalletAddress(currentAddress);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    onLoad();
  }, [app, api, app?.wallets, status, pubkeyContext]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!wallet_address) {
          console.error("Wallet prop is undefined or null");
          return;
        }

        const response = await axios.get(`https://pioneers.dev/api/v1/portfolio/${wallet_address}`);

        // Count the number of NFTs from the "Gnars" collection
        const gnarsNFTsCount = response.data.nfts.reduce((count: any, nft: any) => {
          if (
            nft.token &&
            nft.token.collection &&
            nft.token.collection.address === "0x558bfff0d583416f7c4e380625c7865821b8e95c" &&
            nft.token.collection.name === "Gnars"
          ) {
            return count + 1;
          }
          return count;
        }, 0);


        setTotalNetWorth(response.data.totalNetWorth);
        setGnarsNFTsCount(gnarsNFTsCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [wallet_address]);





  useEffect(() => {
    setLoggedIn(isLoggedIn());
    fetchConversionRate().then((rate) => {
      setConversionRate(rate);
      // Call onStart and pass the required variables
      onStart(user, rate, loggedIn);
    });
  }, [user]);
  const handleConnectHive = () => {
    if (loggedIn) {
      logout();
    } else {
      setModalOpen(true);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === "profile") {
      window.location.href = "/profile"; // Navigate to profile page
    } else if (selectedValue === "logout") {
      logout();
    }
  };


  const avatarUrl = user && user.posting_json_metadata !== ""
    ? JSON.parse(user.posting_json_metadata).profile.profile_image
    : DEFAULT_AVATAR_URL;


  const [hiveBalance, setHiveBalance] = useState<string>("0");
  const [hivePowerText, setHivePowerText] = useState<string>("0");
  const [hbdBalance, setHbdBalance] = useState<string>("0");
  const [savingsBalance, setSavingsBalance] = useState<string>("0");
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [totalWorth, setTotalWorth] = useState<number>(0);



  const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
  ) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    const availableVESTS = vestingSharesFloat - delegatedVestingSharesFloat;


    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_dynamic_global_properties',
        params: [],
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    const availableHP =
      (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
      parseFloat(result.result.total_vesting_shares);
    const HPdelegatedToOthers =
      (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);
    return {
      availableHivePower: availableHP.toFixed(3),
      HPdelegatedToOthers: HPdelegatedToOthers.toFixed(3),
    };
  };

  const onStart = async function (user: any, conversionRate: any, loggedIn: any) {
    if (user) {
      try {
        const [conversionRate, hbdPrice, vestingSharesData] = await Promise.all([
          fetchConversionRate(),
          fetchHbdPrice(),
          convertVestingSharesToHivePower(
            user.vesting_shares,
            user.delegated_vesting_shares,
            user.received_vesting_shares
          ),
        ]);

        const hiveWorth = parseFloat(user.balance.split(" ")[0]) * conversionRate;

        const hivePowerWorth =
          (parseFloat(vestingSharesData.availableHivePower) + parseFloat(vestingSharesData.HPdelegatedToOthers)) *
          conversionRate;


        const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
        const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;


        const total = hiveWorth + hivePowerWorth + hbdWorth + savingsWorth;
        const total_Owned = Number(hiveWorth) + Number(savingsWorth) + Number(hbdWorth) + Number(hivePowerWorth);

        setConversionRate(conversionRate);
        setHbdBalance(user.hbd_balance);
        setHiveBalance(user.balance);
        setSavingsBalance(user.savings_hbd_balance);
        setHivePowerText(`${vestingSharesData.availableHivePower} + ${vestingSharesData.HPdelegatedToOthers} (delegated)`);
        setTotalWorth(total_Owned);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    onStart(user, conversionRate, loggedIn);
  }
    , [user]);



  const glow = keyframes`
      0% {
        box-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
      }
      50% {
        box-shadow: 0 0 30px rgba(0, 255, 0, 2);
      }
      100% {
        box-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
      }
    `;
  const enlargeOnHover = keyframes`
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(1.1);
      }
    `;
  const moveUpAndDown = keyframes`
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    `;

  const handleTotalClick = () => {
    alert("Total worth: " + totalWorth.toFixed(2) + " USD");
  };

  return (

    <Flex as="header" direction={flexDirection}
      alignItems="center"
      justifyContent="space-between"
      p={6}
      position="relative"
      borderRadius="10px"
      marginBottom="0px"
    >

      <Flex width="100%" justifyContent="space-between" alignItems="center" mb={{ base: 2, md: 0 }}>
        <Menu>
          <MenuButton
            as={Button}
            backgroundColor="black"
            border="limegreen 1px solid"
            color="limegreen"
            size="l"
            css={{
              animation: `${glow} 2s infinite alternate , ${moveUpAndDown} 3s infinite`,
              "&:hover": {
                animation: `${enlargeOnHover} 0.2s forwards, ${glow} 2s infinite alternate,${moveUpAndDown} 0s infinite`,
              },
            }}
          >
            <Image
              src="/assets/skatehive.jpeg"
              alt="Dropdown Image"
              boxSize="48px" // Adjust the size as needed
              borderRadius="10px"
            />
          </MenuButton>
          <MenuList border="1px solid limegreen" backgroundColor="black" color="white">
            <Link to="https://snapshot.org/#/skatehive.eth" target="_blank" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                🏛 Governance
              </MenuItem>
            </Link>
            <Link to="https://hive.vote/dash.php?i=1&trail=steemskate" target="_blank" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                🔗 Curation Trail
              </MenuItem>
            </Link>
            <Link to="https://docs.skatehive.app" target="_blank" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                📖 Docs
              </MenuItem>
            </Link>
            <Link to="/secret" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                ㊙ Secret Spot
              </MenuItem>
            </Link>
            <Link to="https:/github.com/sktbrd/skateapp" target="_blank" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                💻 Contribute
              </MenuItem>
            </Link>
            <MenuDivider />

            <MenuGroup title="Forks">
              <Link to="https://crowsnight.com" target="_blank" style={{ textDecoration: 'none' }}>

                <MenuItem
                  _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                  backgroundColor="black"
                >
                  💀 CrowsNight
                </MenuItem>
              </Link>
              <Link to="https://soma-ten.vercel.app" target="_blank" style={{ textDecoration: 'none' }}>

                <MenuItem
                  _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                  backgroundColor="black"
                >
                  ➕ Soma Skate
                </MenuItem>
              </Link>
            </MenuGroup>
          </MenuList>
        </Menu>

        <Box >
          <HStack spacing={3} alignItems="center">


            <ChakraLink as={RouterLink} to="/wallet">
              {isDesktop && (
                <Tooltip label="Total Networth counting tokens + NFT Value" aria-label="EVM Wallet">
                  <Button backgroundColor="black" border="limegreen 2px solid" color="orange">
                    <Image marginRight={"10px"} boxSize={"22px"} src="https://www.gnars.wtf/images/logo.png"></Image> {gnarsNFTsCount} <Text color="white" style={{ marginLeft: '5px' }}>Gnars</Text>
                  </Button>
                </Tooltip>
              )}
              <Tooltip label="Hive Wallet Tokens in USD" aria-label="Wallet">
                <Button backgroundColor="black" border="limegreen 2px solid" color="orange">
                  <Image marginRight={"10px"} boxSize={"22px"} src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png?v=026" />
                  {totalWorth.toFixed(2)} <Text color="white" style={{ marginLeft: '5px' }}>USD</Text>
                </Button>
              </Tooltip>
            </ChakraLink>
            <FaBell
              size={24}
              style={{ color: 'darkorange', cursor: 'pointer' }}
              onClick={() => setNotificationModalOpen(true)}
            />
            <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setNotificationModalOpen(false)} notifications={notifications} />

          </HStack>
        </Box>

      </Flex>
      <Flex gap={{ base: 4, md: 8 }} padding={{ base: "6px 18px", md: "8px 20px" }} borderRadius="6px" position={{ md: "absolute" }} border="2px solid limegreen">
        <Button variant="link" color="white" as={Link} to="/">Home</Button>
        <Button variant="link" color="white" as={Link} to="/QFS">Play</Button>
        {
          // Se não tiver logado
          !loggedIn ?
            // Exibe o botão de login
            <Button variant="link" color="white" onClick={() => setModalOpen(true)}>Log In</Button> :
            // Se estiver logado, exibe o menu de profile
            <Menu>
              <MenuButton _hover={{ textDecoration: "underline" }} fontWeight="medium">
                <Flex alignItems={"center"} gap={2}>
                  <Avatar
                    src={avatarUrl}
                    borderRadius={"100%"}
                    size="sm"
                    w="20px"
                    h="20px"
                  />
                  {user?.name}
                  <ChevronDownIcon />
                </Flex>
              </MenuButton>
              <MenuList border="1px solid limegreen" backgroundColor="black" color="white" minWidth="120px">
                <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/wallet">🔑 Wallet</MenuItem>
                <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/profile">🛹 Profile</MenuItem>
                <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} onClick={() => loggedIn && logout()}>🚩 Log Out</MenuItem>
              </MenuList>
            </Menu>
        }
      </Flex>


      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <HiveLogin isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Modal>

    </Flex>
  );
};

export default HeaderNew;
