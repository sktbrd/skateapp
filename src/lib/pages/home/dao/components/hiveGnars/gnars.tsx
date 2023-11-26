import React from "react";
import HiveStats from "../steemskate/hiveStats";
import AccSummary from "./accSummary";
import VotesLeaderboard from "./votesLeaderboard";
import WalletTransactions from "./txHistory";
import GnarsChart from "./gnarschart";
import { Box } from "@chakra-ui/react";
import EthereumStats from "../ethereum/ethereumStats";

const GnarsStats = () => {  
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" flexDirection="row" width="100%">
        <HiveStats wallet="gnars" />
        <AccSummary username="gnars" />
        {/* <EthereumStats /> */}
      </Box>
      <VotesLeaderboard username="gnars" />
      <GnarsChart />
      <WalletTransactions wallet="gnars" />
    </Box>
  );
};

export default GnarsStats;
