import { Image, Box, Text, HStack, Tooltip, Badge, Grid, GridItem, Center } from "@chakra-ui/react";

import { useState, useEffect } from "react";

import useAuthUser from "lib/pages/home/api/useAuthUser";
import * as dhive from "@hiveio/dhive";
// import WalletTransactions from "lib/pages/home/dao/components/hiveGnars/txHistory";

import { FaWallet } from "react-icons/fa6";
import axios from "axios";
import { fetchHbdPrice, fetchConversionRate } from "../utils/apis/coinGecko";
import { convertVestingSharesToHivePower } from "../utils/hiveFunctions/convertSharesToHP";


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

const TotalBalances = ({ hivewallet, ethWallet }: { hivewallet: string; ethWallet: string }) => {
    const { user } = useAuthUser() as { user: User | null };
    const [hiveBalance, setHiveBalance] = useState<string>("0");
    const [hivePower, setHivePower] = useState<string>("0");
    const [hbdBalance, setHbdBalance] = useState<string>("0");
    const [savingsBalance, setSavingsBalance] = useState<string>("0");
    const [conversionRate, setConversionRate] = useState<number>(0.000);
    const [totalWorth, setTotalWorth] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [ownedTotal, setOwnedTotal] = useState<number>(0);
    const [profileImage, setProfileImage] = useState<string>("https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif");
    const [delegatedToUserInUSD, setDelegatedToUserInUSD] = useState<string>("0");
    const [HPdelegatedToUser, setHPdelegatedToUser] = useState<string>("0");
    const [userLocation, setUserLocation] = useState<string>("");
    const [totalEvmNetWorth, setTotalEvmNetWorth] = useState<string>("0");
    const [totalWalletsAmount, setTotalWalletsAmount] = useState<number>(0);



    const onStart = async function () {
        const fetchData = async () => {
            try {
                if (!user) {
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

                setTotalEvmNetWorth(totalEvmNetWorth);
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
            } catch (error) {
                console.error("Error fetching data:", error);
                setTimeout(() => fetchData(), 10000);
            }
        };

        fetchData();
    };

    useEffect(() => {
        onStart();
    }, [user]);

    useEffect(() => {
        setTotalWalletsAmount(Number(totalWorth) + Number(totalEvmNetWorth));
    }, [totalWorth, totalEvmNetWorth]);

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
                        <Badge borderRadius="15px" fontSize="82px" colorScheme="green">
                            {totalWalletsAmount.toFixed(2) || 0}
                        </Badge>
                    </Center>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default TotalBalances;