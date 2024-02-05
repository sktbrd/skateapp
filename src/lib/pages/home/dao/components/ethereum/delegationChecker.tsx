import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Input, Button, Text, VStack } from '@chakra-ui/react';
import ERC721_ABI from './gnars_abi.json'; // Assuming the ABI is saved in the same directory

const gnars_contract = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";

const WalletVotesInfo = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [votes, setVotes] = useState('');
    const [delegatedTo, setDelegatedTo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: any) => {
        setWalletAddress(e.target.value);
        // Reset state
        setVotes('');
        setDelegatedTo('');
    };

    const fetchVotesAndDelegate = async () => {
        if (!walletAddress) return;

        setIsLoading(true);

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const gnarsContract = new ethers.Contract(gnars_contract, ERC721_ABI, provider.getSigner());

            // Fetch votes
            const votesResult = await gnarsContract.getCurrentVotes(walletAddress);
            setVotes(votesResult.toString());

            // Fetch delegatee
            const delegateeAddress = await gnarsContract.delegates(walletAddress);
            setDelegatedTo(delegateeAddress);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <VStack spacing={4}>
            <Input
                placeholder="Enter wallet address"
                value={walletAddress}
                onChange={handleInputChange}
                isDisabled={isLoading}
            />
            <Button onClick={fetchVotesAndDelegate} isLoading={isLoading}>
                Fetch Votes and Delegation Info
            </Button>
            {votes && (
                <Text>Votes: {votes}</Text>
            )}
            {delegatedTo && (
                <Text>Delegated To: {delegatedTo}</Text>
            )}
        </VStack>
    );
};

export default WalletVotesInfo;
