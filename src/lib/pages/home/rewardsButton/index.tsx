import React, { useEffect, useRef, useState} from 'react';
import {
  Flex,
  Box,
  VStack,
  Image,
  useMediaQuery,
  Button,
  Textarea,
  Spinner,
} from '@chakra-ui/react';
import { FaGift } from 'react-icons/fa';
import useAuthUser from '../api/useAuthUser';

type User = {
  name: string;
} | null;

const RewardsButton: React.FC = () => {
  const user = useAuthUser();
  
  return (
    <Flex direction="column" alignItems="center" justifyContent="center">
    <Button
      leftIcon={<FaGift />}
      colorScheme="purple"
      variant="outline"
      size="sm"
      onClick={() => {
        console.log('Rewards button clicked');
      }}
    >
      Claim Rewards
    </Button>
    </Flex>
  );
}
  

export default RewardsButton;
