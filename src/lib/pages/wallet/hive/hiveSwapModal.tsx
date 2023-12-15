import React, { useState, useEffect } from 'react';
import { Button, FormControl, FormLabel, Input, Stack, Select } from '@chakra-ui/react';
import { KeychainSDK } from 'keychain-sdk';

interface Swap {
    username: string;
    startToken: string;
    endToken: string;
    amount: number;
    steps: any;
    slippage: number;
    }

const SwapComponent: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [startToken, setStartToken] = useState<string>('HIVE');
  const [endToken, setEndToken] = useState<string>('HBD');
  const [estimation, setEstimation] = useState<any>(null); // Replace 'any' with the actual type

  useEffect(() => {
    const keychain = new KeychainSDK(window);

  }, []); // Only fetch estimation on component mount

  const handleSwap = async () => {
    try {
      const swapData: Swap = {
        username: 'skatehacker',
        startToken,
        endToken,
        amount,
        steps: estimation.steps,
        slippage: 1,
      };

      // Replace the following line with your actual swap logic

    } catch (error) {
      console.error({ error });
    }
  };

  return (
    <Stack spacing={4} align="center">
      <FormControl>
        <FormLabel>Start Token</FormLabel>
        <Select value={startToken} onChange={(e) => setStartToken(e.target.value)}>
          {/* Populate options based on available tokens */}
          <option value="HIVE">HIVE</option>
          {/* Add other token options here */}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>End Token</FormLabel>
        <Select value={endToken} onChange={(e) => setEndToken(e.target.value)}>
          {/* Populate options based on available tokens */}
          <option value="HBD">HBD</option>
          {/* Add other token options here */}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Amount</FormLabel>
        <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </FormControl>

      <Button colorScheme="teal" onClick={handleSwap}>
        Swap
      </Button>
    </Stack>
  );
};

export default SwapComponent;
