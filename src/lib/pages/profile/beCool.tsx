import React, { useState, useEffect } from 'react';
import { Box, Text, List, ListItem, Icon } from "@chakra-ui/react";
import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons';
import useAuthUser from "lib/pages/home/api/useAuthUser";

interface User {
  balance: string;
  vesting_shares: string;
  // ... other properties from the User object
}

const BeCool: React.FC = () => {
  const { user } = useAuthUser() as { user: User | null };
  const [hasHive, setHasHive] = useState(false);
  const [hasMoreThan100HP, setHasMoreThan100HP] = useState(false);
  const [hasMoreThan1000HP, setHasMoreThan1000HP] = useState(false);
  const [isFollowingSkatehive, setIsFollowingSkatehive] = useState(false);

  useEffect(() => {
    if (user) {
      setHasHive(parseFloat(user.balance) > 0);
      setHasMoreThan100HP(parseFloat(user.vesting_shares) > 100);
      setHasMoreThan1000HP(parseFloat(user.vesting_shares) > 1000);
      // TODO: Check if the user is following the skatehive curation trail
    }
  }, [user]);

  return (
    <Box padding="20px">
      <Text fontSize="2xl" mb="20px">Cool Things To Check</Text>
      <List spacing={3}>
        <ListItem>
          {hasHive ? <CheckCircleIcon color="green.500" /> : <CloseIcon color="red.500" />}
          <Text ml="10px">Have Hive</Text>
        </ListItem>
        <ListItem>
          {hasMoreThan100HP ? <CheckCircleIcon color="green.500" /> : <CloseIcon color="red.500" />}
          <Text ml="10px">Have more than 100 HP</Text>
        </ListItem>
        <ListItem>
          {hasMoreThan1000HP ? <CheckCircleIcon color="green.500" /> : <CloseIcon color="red.500" />}
          <Text ml="10px">Have more than 1000 HP</Text>
        </ListItem>
        <ListItem>
          {isFollowingSkatehive ? <CheckCircleIcon color="green.500" /> : <CloseIcon color="red.500" />}
          <Text ml="10px">Following Skatehive Curation Trail</Text>
        </ListItem>
      </List>
    </Box>
  );
};

export default BeCool;
