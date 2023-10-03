import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Image, VStack, HStack, Divider } from "@chakra-ui/react";

// Hive Stuff
import HiveStats from './components/steemskate/hiveStats';
import EthereumStats from './components/ethereum/ethereumStats';

const DaoStatus = () => {
  // Define hooks

  const [loading, setLoading] = useState(true);

  return (
    <Flex flexDirection={['column', 'row']} paddingBottom="30px" width="100%" >
      <EthereumStats></EthereumStats>
      <HiveStats wallet="steemskate" />    </Flex>
  );
}

export default DaoStatus;
