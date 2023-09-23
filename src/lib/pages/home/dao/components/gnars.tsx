import React from "react";
import HiveStats from "./hiveStats";
import WalletTransactions from "./txHistory";
import { Box } from "@chakra-ui/react";

const GnarsStats = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <HiveStats wallet="gnars" />
      <WalletTransactions wallet="gnars" />
    </Box>
  );
};

export default GnarsStats;
