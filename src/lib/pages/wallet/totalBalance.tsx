import { Image, Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Button, VStack, HStack, Divider, Tooltip, Badge, Grid, GridItem, Center, Spacer } from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";

import { useState, useEffect } from "react";

import useAuthUser from "lib/pages/home/api/useAuthUser";
import * as dhive from "@hiveio/dhive";
// import WalletTransactions from "lib/pages/home/dao/components/hiveGnars/txHistory";

import { useFetcher } from "react-router-dom";
import { FaPix } from "react-icons/fa6";
import { FaWallet } from "react-icons/fa6";
import axios from "axios";
const dhiveClient = new dhive.Client([
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network",
]);

const HIVE_LOGO_URL = "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png";


interface User {
    balance: string;
    hbd_balance: string;
    savings_hbd_balance: string;
    vesting_shares: string;
    delegated_vesting_shares: string;
    received_vesting_shares: string;
    name?: string;
    location?: string;
    posting_json_metadata?: string;
    metadata: any;
    json_metadata: any;
}


export const cache: { conversionRate?: number, hbdPrice?: number } = {};

export function resetCache() {
    cache.conversionRate = undefined;
    cache.hbdPrice = undefined;
    console.log("Cache reset");
}


const styles = `
  @keyframes glow {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }
`;

export async function fetchHbdPrice() {
    try {
        if (cache.hbdPrice !== undefined) {
            // Use the cached value if available
            return cache.hbdPrice;
        }

        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd");

        if (response.status !== 200) {
            // Set hbdPrice to 1.00 if the response status is not 200
            cache.hbdPrice = 1.00;
            return 1.00;
        }

        const data = await response.json();
        const hbdPrice = data.hive_dollar.usd;

        // Update the cache
        cache.hbdPrice = hbdPrice;
        return hbdPrice;
    } catch (error) {
        console.log("Error fetching HBD price:");
        // Set hbdPrice to 1.00 in case of an error
        cache.hbdPrice = 1.00;
        return 1.00;
    }
};


export async function fetchConversionRate() {
    try {
        if (cache.conversionRate !== undefined) {
            // Use the cached value if available
            return cache.conversionRate;
        }

        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd");

        if (response.status !== 200) {
            // Set conversionRate to 0.35 if the response status is not 200
            cache.conversionRate = 0.350;

            return 0.350;
        }

        const data = await response.json();
        const conversionRate = data.hive.usd;
        // Update the cache
        cache.conversionRate = conversionRate;
        return conversionRate; // Return the conversion rate as a number
    } catch (error) {
        console.log("Error fetching conversion rate");
        // Set conversionRate to 0.00 in case of an error
        cache.conversionRate = 0.350;
        return 0.350;
    }
};

const TotalBalances = ({ hivewallet, ethWallet }: { hivewallet: string; ethWallet: string }) => {
    const { user } = useAuthUser() as { user: User | null };
    const [hiveBalance, setHiveBalance] = useState<string>("0");
    const [hivePower, setHivePower] = useState<string>("0");
    const [hbdBalance, setHbdBalance] = useState<string>("0");
    const [savingsBalance, setSavingsBalance] = useState<string>("0");
    const [showModal, setShowModal] = useState(false);
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [conversionRate, setConversionRate] = useState<number>(0.000);
    const [totalWorth, setTotalWorth] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hiveMemo, setHiveMemo] = useState("");
    const [showPowerUpModal, setShowPowerUpModal] = useState(false);
    const [showPowerDownModal, setShowPowerDownModal] = useState(false);
    const [showDelegationModal, setShowDelegationModal] = useState(false);
    const [sendHBDmodal, setSendHBDmodal] = useState(false);
    const [ownedTotal, setOwnedTotal] = useState<number>(0);
    const [profileImage, setProfileImage] = useState<string>("https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif");
    const [delegatedToUserInUSD, setDelegatedToUserInUSD] = useState<string>("0");
    const [HPdelegatedToUser, setHPdelegatedToUser] = useState<string>("0");
    const [showOptions, setShowOptions] = useState(false); // State to track whether to show additional options or not
    const [userLocation, setUserLocation] = useState<string>("");
    const [totalEvmBalance, setTotalEvmBalance] = useState<string>("0");
    const [totalWalletsAmount, setTotalWalletsAmount] = useState<number>(0);

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
        const vestHive =
            (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
            parseFloat(result.result.total_vesting_shares);

        const DelegatedToSomeoneHivePower =
            (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
            parseFloat(result.result.total_vesting_shares);

        const delegatedToUserInUSD = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
            parseFloat(result.result.total_vesting_shares);
        const HPdelegatedToUser = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
            parseFloat(result.result.total_vesting_shares);
        return {
            hivePower: vestHive.toFixed(3),
            DelegatedToSomeoneHivePower: DelegatedToSomeoneHivePower.toFixed(3),
            delegatedToUserInUSD: delegatedToUserInUSD.toFixed(3),
            HPdelegatedToUser: HPdelegatedToUser.toFixed(3),
        };

    };


    const onStart = async function () {
        const fetchData = async () => {
            try {
                if (!user) {
                    // If user is null, exit the function
                    return;
                }

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
                    (parseFloat(vestingSharesData.hivePower) + parseFloat(vestingSharesData.DelegatedToSomeoneHivePower)) *
                    conversionRate;
                const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
                const delegatedToUserInUSD = parseFloat(vestingSharesData.delegatedToUserInUSD) * conversionRate;
                const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;
                const HPdelegatedToUser = parseFloat(vestingSharesData.HPdelegatedToUser);
                const total = hiveWorth + hivePowerWorth + hbdWorth + savingsWorth + delegatedToUserInUSD;
                const total_Owned = Number(hiveWorth) + Number(savingsWorth) + Number(hbdWorth) + Number(hivePowerWorth);

                const response = await axios.get(`https://pioneers.dev/api/v1/portfolio/${ethWallet}`);
                const totalEvmNetWorth = response.data.totalNetWorth;

                setTotalEvmBalance(totalEvmNetWorth);
                setConversionRate(conversionRate);
                setHbdBalance(user.hbd_balance);
                setHiveBalance(user.balance);
                setSavingsBalance(user.savings_hbd_balance);
                setHivePower(`${vestingSharesData.DelegatedToSomeoneHivePower} (delegated to others)  + ${vestingSharesData.hivePower} (self-delegated)`);
                setTotalWorth(total);
                setIsLoading(false);
                setOwnedTotal(total_Owned);
                setDelegatedToUserInUSD(`${delegatedToUserInUSD.toFixed(3).toString()} USD worth in HP`);
                setHPdelegatedToUser(`${HPdelegatedToUser.toFixed(3).toString()} HP delegated to you`);
                const metadata = JSON.parse(user.posting_json_metadata || '');
                setProfileImage(metadata.profile.profile_image);
                setUserLocation(metadata.profile.location);

                const TotalWalletsAmount = Number(total) + Number(response.data.totalNetWorth);


                setTotalWalletsAmount(TotalWalletsAmount);
                console.log("TotalWalletsAmount:", TotalWalletsAmount);
                let checkpoint

                useEffect(() => {
                    setTotalWalletsAmount(totalWorth + totalEvmNetWorth);
                }, [checkpoint]);

            } catch (error) {
                console.error("Error fetching data:", error);
                // Retry after 10 seconds
                setTimeout(() => fetchData(), 10000);
            }
        };

        fetchData();
    };

    useEffect(() => {
        onStart();
    }, [user]);





    return (
        <Box
            borderRadius="12px"
            border="2px solid limegreen"
            padding="0px"
            maxWidth={{ base: "100%", md: "100%" }}
            style={{ textAlign: "right" }}
            p="5px"
            m="0px"
        >
            <Grid
                templateAreas={`"header header"
                            "nav main"
                            "nav footer"`}
                gridTemplateRows={'50px auto 30px'} // Adjusted row height
                gridTemplateColumns={'150px 1fr'}
                gap='1'
                color='blackAlpha.700'
                fontWeight='bold'
            >
                <GridItem pl='2' bg={"green.500"} area={'header'} borderRadius={"10px"}>
                    <Center>
                        <HStack spacing={4} justifyContent="flex-end">
                            <FaWallet
                                style={{ animation: "glow 1s ease-in-out infinite alternate" }}
                                color="black"
                                size="32px"
                            />
                            <Tooltip
                                label="Total Sum of your Balances and NFTs estimated Value"
                                aria-label="A tooltip"
                            >
                                <Text fontSize="32px" color="white">
                                    {user ? "Total Balance" : "Login to See your Balance"}
                                </Text>
                            </Tooltip>
                        </HStack>
                    </Center>
                </GridItem>
                <GridItem pl='2' area={'nav'}>
                    <Image
                        src="https://i.ibb.co/2ML12vx/image.png"
                        p={"0px"}
                        m={"5px"}
                        objectFit={"cover"}
                        boxSize={"130px"}
                    />
                </GridItem>
                <GridItem pl='2' area={'main'}>
                    <br />

                    <Center>
                        <Badge borderRadius="15px" fontSize="32px" colorScheme="green">
                            {totalWalletsAmount.toFixed(2) || 0}
                        </Badge>
                    </Center>
                </GridItem>
            </Grid>
        </Box>
    );


};

export default TotalBalances;





