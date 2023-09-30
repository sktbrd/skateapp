import React from "react";
import HiveStats from "./hiveStats";
import AccSummary from "./accSummary";
import VotesLeaderboard from "./votesLeaderboard";
import WalletTransactions from "./txHistory";
import { Box } from "@chakra-ui/react";

const GnarsStats = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" flexDirection="row" width="100%">
        <HiveStats wallet="gnars" />
        <AccSummary username="gnars" />
      </Box>
      <VotesLeaderboard username="gnars" />
      <WalletTransactions wallet="gnars" />
    </Box>
  );
};

export default GnarsStats;
