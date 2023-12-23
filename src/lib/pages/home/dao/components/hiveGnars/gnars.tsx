import React from "react";
import HiveStats from "../steemskate/hiveStats";
import AccSummary from "./accSummary";
import VotesLeaderboard from "./votesLeaderboard";
import WalletTransactions from "./txHistory";
import GnarsChart from "./gnarschart";
import { Box, Text } from "@chakra-ui/react";
import EthereumStats from "../ethereum/ethereumStats";

const GnarsStats = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box >
        <center>
          <Text color="white" align="center" fontWeight="bold" mb="4">
            Gnars account upvotes extreme sports content on Hive blockchain and distributes Hive tokens to shredders daily.
            Thanks to Hive's tokenomics, no Hive tokens leave the Gnars wallet when it's account upvotes skate content.
            Hive token rewards are coming from the Hive "Rewards Pool", a pool filled daily with newly minted Hive.
            The Hive network continually creates new digital tokens to reward content creators and curators.
            Some of the newly-created tokens are transferred to users who add value to Hive by posting, commenting, and voting on other people's posts.
            The remainder is distributed to holders of Hive Power and the witnesses that power the blockchain.The more Hive Power (staked Hive) a user has in their wallet, the more Hive tokens they can "take" from the Hive Reward Pool and give to posts they upvote (curation). The rewards that are given out by curators to quality posts are always split 50/50 between authors and curators.
            So when Gnars Account upvotes something, it EARNS a percentage of it’s own upvote weight, back.
            <br />
            <Text color="orange">
              *Fans who leave thoughtful comments are also eligible towards rewards
            </Text>
          </Text>
        </center>

      </Box>

      <Box display="flex" flexDirection="row" width="100%">
        <HiveStats wallet="gnars" />
        <AccSummary username="gnars" />

      </Box>
      <VotesLeaderboard username="gnars" />
      <GnarsChart />

      <WalletTransactions wallet="gnars" />

    </Box>
  );
};

export default GnarsStats;
