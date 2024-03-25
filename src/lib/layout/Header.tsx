import React, { useState, useEffect } from "react";
import axios from "axios";
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
// Chakra UI Components
import {
  Box,
  Flex,
  HStack,
  Text,
  useBreakpointValue,
  Image,
  Avatar,
  Modal,
  Popover,
  PopoverTrigger,
  PopoverContent,
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
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { fetchProposals, mapProposals } from "lib/pages/utils/apis/snapshotApi";
// Emotion
import { keyframes } from "@emotion/react";

// React Router
import { Link as RouterLink } from 'react-router-dom';
import { Link, LinkProps as RouterLinkProps } from "react-router-dom";

// Icons
import { FaPlus, FaSpeakap, FaUpload, FaScroll, FaVoteYea, FaStore } from "react-icons/fa";

// Hive Related
import * as dhive from "@hiveio/dhive";
import useAuthUser from "lib/components/auth/useAuthUser";
import HiveLogin from "lib/components/auth/HiveLoginModal";

// Utils and APIs
import { fetchConversionRate, fetchHbdPrice } from "lib/pages/utils/apis/coinGecko";

// Custom Components
import CommunityTotalPayout from "lib/pages/home/dao/commmunityPayout";
import NotificationModal from "lib/components/NotificationsModal";

// Wagmi and NNS
import { useNnsName } from "@nnsprotocol/resolver-wagmi";
import { useEnsAddress } from "wagmi";

import { formatWalletAddress } from "lib/pages/utils/formatWallet";
// types.ts
export interface Notification {
  date: string;
  id: number;
  msg: string;
  score: number;
  type: string;
  url: string;
}


const dhiveClient = new dhive.Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);
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
  const [activeProposalsLength, setActiveProposalsLength] = useState<number>(0);


  useEffect(() => {
    fetchProposals().then((fetchedProposals: any) => {
      if (fetchedProposals) {
        const activeProposals = mapProposals(fetchedProposals);
        setActiveProposalsLength(activeProposals.length);
      }
    }).catch(error => console.error("Error processing proposals", error));
  }, []);



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
        const response = await axios.get(`https://pioneers.dev/api/v1/portfolio/${wallet_address?.toUpperCase()}`);

        if (response.data !== undefined) {
          if (response.data.nfts) {
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

            setGnarsNFTsCount(gnarsNFTsCount);
          }
        } else {
          console.error('Error: Response data is undefined');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [wallet_address]);


  useEffect(() => {
    setLoggedIn(isLoggedIn());
    fetchConversionRate().then((rate: any) => {
      setConversionRate(rate);
      onStart(user, rate, loggedIn);
    });
  }, [user]);


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
        const account = await dhiveClient.database.getAccounts([user.name]);
        const [conversionRate, hbdPrice, vestingSharesData] = await Promise.all([
          fetchConversionRate(),
          fetchHbdPrice(),
          convertVestingSharesToHivePower(
            account[0].vesting_shares.toString(),
            account[0].delegated_vesting_shares.toString(),
            account[0].received_vesting_shares.toString()
          ),
        ]);
        const hiveBalance = typeof account[0].balance === 'string' ? account[0].balance.split(" ")[0] : Number(account[0].balance);
        const hiveWorth = parseFloat(hiveBalance.toString()) * conversionRate;
        const hivePowerWorth =
          (parseFloat(vestingSharesData.availableHivePower) + parseFloat(vestingSharesData.HPdelegatedToOthers)) *
          conversionRate;


        const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
        const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;


        const total = Number(hiveWorth) + Number(hivePowerWorth) + hbdWorth + savingsWorth;
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
  const nns = useNnsName({
    //@ts-ignore
    address: `${wallet_address}`,
  })
  const [brl, setBrl] = useState(0);

  const convertUSDtoBRL = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=brl');
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        setBrl(5);
        return brl;
      }
      else {
        const data = await response.json();
        console.log("DATA:", data)
        const brl_value = data.usd.brl;
        setBrl(brl_value);
        console.log("BRL", brl);
        return brl_value;
      }

    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  useEffect(() => {
    convertUSDtoBRL();
    console.log("BRL:", brl)

  }
    , [brl])
  return (

    <Flex as="header" direction="row" justifyContent="space-between" alignItems="center" p={2} m={2} mb={4}>
      <Flex justifyContent="space-between" borderRadius="6px" border="2px solid white" minW={"100%"}>
        <Menu >
          <MenuButton
            as={Button}
            backgroundColor="black"
            color="limegreen"
            size="l"
            padding={2}
            _hover={{ backgroundColor: 'black', color: 'limegreen' }}
          >

            <Image
              src="https://images.ecency.com/DQmUj1W7H6H2xxKzoZAnYG5G4iMwSSe19GNJZSf9DgHGXDi/cbb028ba_4d49_42b6_bd62_e0245c4ed79b.jpeg"
              alt="Dropdown Image"
              backgroundColor={"black"}
              boxSize="48px" // Adjust the size as needed

              css={{
                animation: `${glow} 2s infinite alternate , ${moveUpAndDown} 3s infinite`,
                "&:hover": {
                  backgroundColor: "black",
                  color: "limegreen",
                  animation: `${enlargeOnHover} 0.2s forwards, ${glow} 2s infinite alternate, ${moveUpAndDown} 0s infinite`,
                },
              }}
            />

          </MenuButton>
          <MenuList border="1px solid limegreen" backgroundColor="black" color="white">

            <Link to="/dao" style={{ textDecoration: 'none' }}>
              <MenuItem
                backgroundColor="black">
                <CommunityTotalPayout communityTag="hive-173115" />

              </MenuItem>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                🏛 Loja
              </MenuItem>
            </Link>
            <Link to="/invite" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                ❤️ Convide um Amigo
              </MenuItem>
            </Link>
            <Link to="/QFS" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                🎮 Play QFS
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
            <Link to="/map" style={{ textDecoration: 'none' }}>
              <MenuItem
                _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                backgroundColor="black"
              >
                🗺️ SpotBook
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
            <center>

              <Image width={"200px"} src="https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23uQ3d5BKcoYkuYWd7kZrnS396M1M6DvsMa5MowAmaVynQr67ChnARGaFstnMGeSspzwR.png" alt="Skatehive Image" />
            </center>

            <MenuDivider />

            <MenuGroup title="Forks">
              <Link to="https://stoken.wtf" target="_blank" style={{ textDecoration: 'none' }}>

                <MenuItem
                  _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
                  backgroundColor="black"
                >
                  🤘 Stoken.wtf
                </MenuItem>
              </Link>
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
        <Box display="flex" flexDirection="row" alignItems="center">

          {isDesktop ? (
            <>
              <Menu>
                <MenuButton
                  _hover={{ textDecoration: "underline" }} fontWeight="bold"
                  as={Button}
                  leftIcon={isDesktop ? <FaPlus style={{ color: 'orange' }} /> : undefined}
                  variant="link"
                  color={"white"}

                >
                  Postar
                </MenuButton>
                <MenuList border="1px solid limegreen" backgroundColor="black" color="white" minWidth="120px">
                  <Tooltip
                    label="Quick posts like instagram/twitter shit. "
                    bg="black"
                    border="1px solid limegreen"
                    placement='right-end'

                  >
                    <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/plaza"> in Plaza</MenuItem>
                  </Tooltip>
                  <Tooltip
                    label="Long Form posts like magazine articles"
                    bg="black"
                    border="1px solid limegreen"
                    placement='right-end'
                  >
                    <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/upload"> in Mag </MenuItem>
                  </Tooltip>
                  <Tooltip
                    label="Be rewarded for contributing with our spots map"
                    bg="black"
                    border="1px solid limegreen"
                    placement='right-end'
                  >
                    <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/map"> in SpotsMap</MenuItem>
                  </Tooltip>
                </MenuList>
              </Menu>
              <Button
                variant="link"
                color="white"
                as={Link}
                to="/"
                leftIcon={isDesktop ? <FaScroll style={{ color: 'orange' }} /> : undefined}
                marginLeft={"20px"}
              >
                Posts
              </Button>
              <Button
                variant="link"
                color="white"
                as={Link}
                to="/shop"
                leftIcon={isDesktop ? <FaStore style={{ color: 'orange' }} /> : undefined}
                m={"20px"}

              >
                Loja Bless
              </Button>
              <Button
                variant="link"
                color="white"
                as={Link}
                to="/plaza"
                leftIcon={isDesktop ? <FaSpeakap style={{ color: 'orange' }} /> : undefined}
                m={"20px"}

              >
                Praça
              </Button>
            </>
          ) : (
            <>

              <Button
                variant="link"
                color="white"
                as={Link}
                to="/plaza"
                leftIcon={isDesktop ? <FaScroll style={{ color: 'orange' }} /> : undefined}
                m={"10px"}

              >
                Plaza
              </Button>
              <Button
                variant="link"
                color="white"
                as={Link}
                to="/shop"
                leftIcon={isDesktop ? <FaScroll style={{ color: 'orange' }} /> : undefined}
                m={"10px"}

              >
                Loja
              </Button>

              <Menu>
                <MenuButton
                  _hover={{ textDecoration: "underline" }} fontWeight="bold"
                  as={Button}
                  leftIcon={isDesktop ? <FaPlus style={{ color: 'orange' }} /> : undefined}
                  variant="link"
                  color={"white"}

                >
                  Post
                </MenuButton>
                <MenuList border="1px solid limegreen" backgroundColor="black" color="white" minWidth="120px">
                  <Tooltip
                    label="Quick posts like instagram or twitter."
                    bg="black"
                    border="1px solid limegreen"
                  >
                    <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/plaza"> in Plaza</MenuItem>
                  </Tooltip>
                  <Tooltip
                    label="Long Form posts like magazine articles"
                    bg="black"
                    border="1px solid limegreen"
                  >
                    <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/upload"> in Mag </MenuItem>
                  </Tooltip>
                  <Tooltip
                    label="Be rewarded for contributing with our spots map"
                    bg="black"
                    border="1px solid limegreen"
                  >
                    <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/map"> in SpotsMap</MenuItem>
                  </Tooltip>
                </MenuList>
              </Menu>
              <Button
                variant="link"
                color="white"
                as={Link}
                to="/blog"
                leftIcon={isDesktop ? <FaSpeakap style={{ color: 'orange' }} /> : undefined}
                m={"10px"}

              >
                Mag
              </Button>
            </>

          )}
          {!loggedIn ?
            <Button variant="link" color="white" m={"20px"}
              onClick={() => setModalOpen(true)}>Entrar</Button> :
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
                  {isDesktop && <ChevronDownIcon />}
                </Flex>
              </MenuButton>
              <MenuList border="1px solid limegreen" backgroundColor="black" color="white" minWidth="120px">
                <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/wallet">🔑 Wallet</MenuItem>
                <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} as={RouterLink} to="/profile">🛹 Profile</MenuItem>
                <MenuItem _hover={{ backgroundColor: 'white', color: 'black' }} backgroundColor={"black"} onClick={() => loggedIn && logout()}>🚩 Log Out</MenuItem>
              </MenuList>
            </Menu>
          }
        </Box>

        <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">

          {isDesktop && (

            <Box >
              <HStack spacing={3} alignItems="center" m='2'>
                <Link to="/dao" >
                  {activeProposalsLength > 0 && (
                    <Tooltip label={"Go Vote Bro! Its important!"} color={"white"} aria-label="Wallet" bg="black" borderRadius="md" border="orange 2px solid">
                      <Button leftIcon={<FaVoteYea color="orange" />} m={1} backgroundColor="black" border="orange 2px solid" color="white" _hover={{ backgroundColor: "black" }}>

                        {activeProposalsLength}
                      </Button>
                    </Tooltip>
                  )}
                </Link>
                <Link to="/wallet" >
                  {isDesktop && (
                    <Tooltip label="Gnars Held by Connected Wallet" color={"white"} aria-label="Gnars" bg="black" borderRadius="md" border="yellow 2px solid">
                      <Button m={1} backgroundColor="black" color="yellow" _hover={{ backgroundColor: "black" }}>
                        <Image marginRight={"10px"} boxSize={"22px"} src="https://www.gnars.wtf/images/logo.png"></Image> {gnarsNFTsCount} <Text color="white" style={{ marginLeft: '5px' }}>Gnars</Text>
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip label="Hive Wallet Tokens in USD" color={"white"} aria-label="Wallet" bg="black" borderRadius="md" border="red 2px solid">
                    <Button m={1} backgroundColor="black" color="white" _hover={{ backgroundColor: "black" }}>
                      <Image marginRight={"10px"} boxSize={"22px"} src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png?v=026" />
                      {(totalWorth * brl).toFixed(2)} <Text color="limegreen" style={{ marginLeft: '5px' }}>BRL</Text>
                    </Button>
                  </Tooltip>
                  {wallet_address && (
                    <Tooltip label={"ETH address"} color={"white"} aria-label="Wallet" bg="black" borderRadius="md" border=" #7CC4FA 2px solid">
                      <Button m={1} backgroundColor="black" color="white" _hover={{ backgroundColor: "black" }}>
                        <Image
                          marginRight={"10px"}
                          boxSize={"22px"}
                          src={nns?.data?.endsWith('.eth') ? "https://seeklogo.com/images/E/ethereum-name-service-ens-logo-9190A647F5-seeklogo.com.png" : "/assets/nogglescoin.gif"}
                        />
                        {nns?.data || formatWalletAddress(wallet_address)}
                      </Button>
                    </Tooltip>
                  )}


                </Link>

              </HStack>
            </Box>
          )}
        </Box>
      </Flex>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <HiveLogin isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Modal>
    </Flex>
  );
};

export default HeaderNew;
