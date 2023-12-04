import React, { useState, useEffect } from "react";
import { Box, Text, Button, Center, Badge, VStack, Grid, GridItem, useBreakpointValue, Tooltip } from "@chakra-ui/react";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import * as dhive from "@hiveio/dhive";
import UserReputation from "../utils/hiveFunctions/usersReputation";
import { KeychainSDK } from "keychain-sdk";
import PowerUpModal from "../wallet/hive/powerUpModal";
import { FaEdit, FaSuperpowers, FaThinkPeaks, FaVoteYea } from "react-icons/fa";
import { AiOutlineThunderbolt } from "react-icons/ai";


const dhiveClient = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

interface User {
  user?: {
    name?: string;
    posting_json_metadata?: string;
    witness_votes?: string[];
    hive_power?: number;
  };
}
export interface WitnessVote {
  username: string;
  witness: string;
  vote: boolean;
}

export default function AuthorProfilePage() {
  const user = useAuthUser() as User;
  const [hasVotedWitness, setHasVotedWitness] = useState<boolean>(false);
  const [witnessVotes, setWitnessVotes] = useState<string[]>([]);
  const [username, setUsername] = useState<string>("");
  const [hasMoreThan500HP, setHasMoreThan500HP] = useState<boolean>(false);
  const [vestingShares, setVestingShares] = useState<string>("");
  const [delegated_vesting_shares, setDelegatedVestingShares] = useState<string>("");
  const [received_vesting_shares, setReceivedVestingShares] = useState<string>("");
  const [hivePower, setHivePower] = useState<string>("");
  const [hasFollowCurationTrail, setHasFollowCurationTrail] = useState<boolean>(false);
  const [hasPostedLastMonth, setHasPostedLastMonth] = useState<boolean>(false);
  const [showPowerUpModal, setShowPowerUpModal] = useState<boolean>(false);

  const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
  ) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    const totalVestingShares = vestingSharesFloat + receivedVestingSharesFloat - delegatedVestingSharesFloat;
    const availableVESTS = vestingSharesFloat - delegatedVestingSharesFloat + receivedVestingSharesFloat;
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

    setHivePower(vestHive.toFixed(3));

    return {
      hivePower: vestHive.toFixed(3),
      delegatedHivePower: delegatedHivePower.toFixed(3),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const account = await dhiveClient.database.getAccounts([username]);
        const userWitnessVotes = account[0]?.witness_votes || [];
        const hasVotedWitness = userWitnessVotes.includes("skatehive");
        console.log(hasVotedWitness)
        setWitnessVotes(userWitnessVotes);
        setVestingShares(String(account[0]?.vesting_shares || ""));
        setDelegatedVestingShares(String(account[0]?.delegated_vesting_shares || ""));
        setReceivedVestingShares(String(account[0]?.received_vesting_shares || ""));
        setHasVotedWitness(hasVotedWitness);
  
        // Update state values before calling convertVestingSharesToHivePower
        const result = await convertVestingSharesToHivePower(
          String(account[0]?.vesting_shares || ""),
          String(account[0]?.delegated_vesting_shares || ""),
          String(account[0]?.received_vesting_shares || "")
        );
  
        if (parseFloat(result.hivePower) > 500) {
          setHasMoreThan500HP(true);
        }
  
        // Check if the last account update was made in the last month
        const lastAccountUpdateDate = new Date(account[0]?.last_post || "");
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
        setHasPostedLastMonth(lastAccountUpdateDate > oneMonthAgo);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    if (user.user?.name) {
      setUsername(user.user.name);
      fetchData();
    }
  }, [user.user?.name, username]);
  
  const handleWitnessVote = async () => {
    try {
      const keychain = new KeychainSDK(window);
  
      const formParamsAsObject = {
        "data": {
          "username": username, // Use the current username
          "witness": "skatehive", // Specify the witness you want to vote for
          "vote": true
        }
      };
  
      const witnessVoteResult = await keychain.witnessVote(formParamsAsObject.data as WitnessVote);
      console.log({ witnessVoteResult });
  
      // Update state to reflect the witness vote
      setHasVotedWitness(true);
    } catch (error) {
      console.error("Error voting for witness:", error);
    }
  };
  const handleWitnessClick = async () => {
    await handleWitnessVote();
  };
  


  const handlePowerUpClick = async () => {
    setShowPowerUpModal(true);
  }

  const numColumns = useBreakpointValue({ base: 1, md: 3 });

  return (
    <Box
      className="hive_box"
      borderRadius="12px"
      border="1px solid limegreen"
      padding="20px"
      fontFamily="'Courier New', monospace"
      boxShadow="md"
    >
      <Center>
        <Text fontWeight="700" fontSize="24px" color="white" mb="10px">
        Are you a Cool SkateHiver?&nbsp;
        <Tooltip
          label="This is your Hive Blockchain Reputation"
          aria-label="A tooltip"
          >

          <UserReputation username={username} />
          </Tooltip> 
        </Text>

      </Center>


      <Grid
        templateColumns={`repeat(${numColumns}, 1fr)`}
        gap={6}
        alignItems="center"
        textAlign="center"
      >
        <GridItem>
          <VStack>
          <FaVoteYea size={"52px"} color="white"/>
          <Badge
            borderRadius="12px"
            fontWeight="700"
            fontSize="18px"
            colorScheme={hasVotedWitness ? "green" : "red"}
            p="10px"
            >
            Witness Voting: {hasVotedWitness ? "Voted ✅" : "Incomplete"}
          </Badge>
          {!hasVotedWitness && (
            <Button onClick={handleWitnessClick} colorScheme="teal" >
              Vote !
            </Button>
          )}
          
          </VStack>
        </GridItem>

        <GridItem>
          <VStack>
          <AiOutlineThunderbolt size={"52px"} color="white"/>
            <Badge
              borderRadius="12px"
              fontWeight="700"
              fontSize="18px"
              colorScheme={hasMoreThan500HP ? "green" : "red"}
              p="10px"
            >
              HivePower: {hivePower} HP {hasMoreThan500HP ? "✅" : "Insufficient"}
            </Badge>
            {!hasMoreThan500HP && (
              <Button onClick={handlePowerUpClick} colorScheme="blue">
                Power Up
              </Button>
            )}
          </VStack>
        </GridItem>

        {/* <GridItem>
          <VStack>

          <Badge
            borderRadius="12px"
            fontWeight="700"
            fontSize="18px"
            colorScheme="green"
            p="10px"
            >
            Follow the Curation Trail
          </Badge>
          {!hasFollowCurationTrail && (
            <Button onClick={handlePowerUpClick} colorScheme="blue">
              Follow Curation Trail
            </Button>
          )}


          </VStack>
        </GridItem> */}
        <GridItem>
  <VStack>
    <FaEdit size={"52px"} color="white"/>
    <Badge
      borderRadius="12px"
      fontWeight="700"
      fontSize="18px"
      colorScheme={hasPostedLastMonth ? "green" : "red"}
      p="10px"
    >
      Last Post: {hasPostedLastMonth ? "Within Last Month ✅" : "More Than a Month Ago"}
    </Badge>
  </VStack>
</GridItem>

      </Grid>
      {showPowerUpModal && (
  <PowerUpModal isOpen={showPowerUpModal} onClose={() => setShowPowerUpModal(false)} user={{ name: username }} />
)}



    </Box>
  );
}
