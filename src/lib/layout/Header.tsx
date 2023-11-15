import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Spacer,
  Tabs,
  TabList,
  Tab,
  TabProps,
  useBreakpointValue,
  Image,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Select,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";
import { Link as ChakraLink  } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';


import { Link, LinkProps as RouterLinkProps } from "react-router-dom";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import HiveLogin from "lib/pages/home/api/HiveLoginModal";

import { fetchHbdPrice } from "lib/pages/wallet/hive/hiveBalance";
import { fetchConversionRate } from "lib/pages/wallet/hive/hiveBalance";
// Custom LinkTab component
type LinkTabProps = TabProps & RouterLinkProps;

interface User {
  name?: string;
  avatar?: string;
  balance: string;
}


const LinkTab: React.FC<LinkTabProps> = ({ to, children, ...tabProps }) => (
  <Link to={to}>
    <Tab {...tabProps}>{children}</Tab>
  </Link>
);

const HeaderNew = () => {
  const fontSize = useBreakpointValue({ base: "2xl", md: "3xl" });
  const tabSize = useBreakpointValue({ base: "sm", md: "md" });
  const flexDirection = useBreakpointValue<"row" | "column">({ base: "column", md: "column" });
  const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

  const { user, loginWithHive, logout, isLoggedIn } = useAuthUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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


  const avatarUrl = user ? `https://images.hive.blog/u/${user.name}/avatar` : DEFAULT_AVATAR_URL;

  const [hiveBalance, setHiveBalance] = useState<string>("0");
  const [hivePower, setHivePower] = useState<string>("0");
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
    const availableVESTS =
      vestingSharesFloat - delegatedVestingSharesFloat + receivedVestingSharesFloat;

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
    const vestHive =
      (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
      parseFloat(result.result.total_vesting_shares);

    const delegatedHivePower =
      (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);

    return {
      hivePower: vestHive.toFixed(3),
      delegatedHivePower: delegatedHivePower.toFixed(3),
    };
  };

  const onStart = async function (user:any, conversionRate:any, loggedIn:any) {
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
          (parseFloat(vestingSharesData.hivePower) + parseFloat(vestingSharesData.delegatedHivePower)) *
          conversionRate;
        const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
        const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;
  
        const total = hiveWorth + hivePowerWorth + hbdWorth + savingsWorth;
        setConversionRate(conversionRate);
        setHbdBalance(user.hbd_balance);
        setHiveBalance(user.balance);
        setSavingsBalance(user.savings_hbd_balance);
        setHivePower(`${vestingSharesData.hivePower} + ${vestingSharesData.delegatedHivePower} (delegated)`);
        setTotalWorth(total);
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
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    }
    50% {
      box-shadow: 0 0 30px rgba(0, 0, 0, 2);
    }
    100% {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
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
    alert("Total worth: " + totalWorth.toFixed(2) + " BRL");
  };

  return (
    
    <Flex as="header" direction={flexDirection}
      alignItems="center"
      justifyContent="space-between"
      p={6}
      bg=""
      border="3px solid black"
      position="relative"
      borderRadius="10px"
    >

      <Flex width="100%" justifyContent="space-between" alignItems="center" mb={{ base: 2, md: 0 }}>
      <Menu>
      <MenuButton
          as={Button}
          backgroundColor="black"
          border="white 1px solid"
          color="white"
          size="l"
          css={{
            animation: `${glow} 2s infinite alternate , ${moveUpAndDown} 3s infinite` ,
            "&:hover": {
              animation: `${enlargeOnHover} 0.2s forwards, ${glow} 2s infinite alternate,${moveUpAndDown} 0s infinite`,
            },
          }}
        >
          <Image
            src="/assets/crn4.jpg"
            alt="Dropdown Image"
            boxSize="50px" // Adjust the size as needed
            borderRadius="10px"
          />
        </MenuButton>
        <MenuList border="1px solid white" backgroundColor="#593576" color="white">
          <Link to="https://snapshot.org/#/skatehive.eth" style={{ textDecoration: 'none' }}>
            <MenuItem
              _hover={{ backgroundColor: '#65418C', color: 'white' }}
              backgroundColor="#593576"  // Invert colors on hover
            >
             Store
            </MenuItem>
          </Link>
          <Link to="https://hive.vote/dash.php?i=1&trail=steemskate" style={{ textDecoration: 'none' }}>
            <MenuItem
              _hover={{ backgroundColor: '#65418C', color: 'white' }}
              backgroundColor="#593576" // Invert colors on hover
            >
              🔗 Curation Trail
            </MenuItem>
          </Link>
          <Link to="https://docs.skatehive.app" style={{ textDecoration: 'none' }}>
            <MenuItem
              _hover={{ backgroundColor: '#65418C', color: 'white' }}
              backgroundColor="#593576"  // Invert colors on hover
            
            >
              	📖 Docs
            </MenuItem>
          </Link>
          <Link to="https:/github.com/sktbrd/skateapp" style={{ textDecoration: 'none' }}>
            <MenuItem
              _hover={{ backgroundColor: '#65418C', color: 'white' }}
              backgroundColor="#593576"  // Invert colors on hover
            
            >
              	💻 Contribute
            </MenuItem>
          </Link>
          {/* <Link to="/becool" style={{ textDecoration: 'none' }}>
            <MenuItem
              _hover={{ backgroundColor: '#060126', color: 'white' }}
              backgroundColor="#593576"  // Invert colors on hover
  
            >
             	🛹 How to be Cool
            </MenuItem>
          </Link> */}
          {/* Add more external links as needed */}
        </MenuList>

      </Menu>
      <Text 
        fontSize={fontSize} 
        fontWeight="medium" 
        color="#f0c33f" 
        style={{ marginTop: '2px' }}
      >
      </Text>
      {/* Dropdown button */}
      <Box>
      <ChakraLink as={RouterLink} to="/wallet">
      <Button
        backgroundColor="black"
        border="black 5px solid"
        color="orange"

        
        >
          <Text color="#FF0500" style={{ marginLeft: '5px' }}>R$</Text>
          <Text style={{ marginLeft: '5px' }} color = '#B92000'>{totalWorth.toFixed(2)}</Text> 
          </Button>
    </ChakraLink>
      </Box>
    
      </Flex>

      {/* Tabs centered horizontally */}
      <Tabs
        variant="unstyled" //solid-rounded
        colorScheme="blackAlpha" //blackAlpha
        position={{ base: "relative", md: "absolute" }}
        left="50%"
        bottom={0}
        transform="translateX(-50%)"
        size={tabSize}
        mb={6}
        css={{
          border: "5px solid black",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <TabList display="flex" alignItems="center">
          <LinkTab to="/" color="#b4d701" _selected={{ backgroundColor: "#0D0D0D", border:"3px #5E317A solid" }}>Home</LinkTab>
          <LinkTab to="/QFS" color="#b4d701" _selected={{ backgroundColor: "#0D0D0D", border:"3px #5E317A solid" }} >Play</LinkTab>

          {loggedIn && <LinkTab to="/wallet" color="white">Wallet</LinkTab>} {/* Conditionally render Wallet tab */}
          {loggedIn ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={avatarUrl} 
                size="sm" 
                mr={2} 
                w="24px"
                h="24px"
              />
              <Select 
                value="" 
                onChange={handleSelectChange}
                style={{
                  backgroundColor: '',//escolher cor
                  color: 'white',
                  border: 'none',  
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled selected>
                  {user?.name}
                </option>
                <option value="profile">Profile</option>
                <option value="logout">Log out</option>
              </Select>
            </div>
          ) : (
            <Tab onClick={() => setModalOpen(true)} color={"#b4d701"} _selected={{ backgroundColor: "#0D0D0D", border:"3px #5E317A solid" }} >
              Log in 
            </Tab>
            
          )}
        </TabList>
      </Tabs>
      

      {/* Hive Login Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <HiveLogin isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Modal>   
      
   </Flex>
  );
};

export default HeaderNew;
