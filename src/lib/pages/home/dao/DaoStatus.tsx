import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Image, VStack, HStack, Divider } from "@chakra-ui/react";

// Hive Stuff
import HiveStats from './components/hiveStats';
import EthereumStats from './components/ethereumStats';

const DaoStatus = () => {
  // Define hooks

  const [loading, setLoading] = useState(true);

  return (
    <Flex flexDirection={['column', 'row']} paddingBottom="30px" width="100%" >
      <EthereumStats></EthereumStats>
      <HiveStats></HiveStats>
    </Flex>
  );
}

export default DaoStatus;
