
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Text, Badge } from '@chakra-ui/react';

interface UserReputationProps {
    username: string;
}

function UserReputation({ username }: UserReputationProps) {
    const [reputation, setReputation] = useState(0);

    useEffect(() => {
        const fetchReputation = async () => {
            try {
                const response = await axios.post('https://api.hive.blog', {
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_account_reputations',
                    params: [username, 1],
                    id: 1,
                });

                const userReputation = response.data.result[0]?.reputation || 0;
                setReputation(userReputation);
            } catch (error) {
                console.error(`Error fetching reputation for ${username}:`, error);
            }
        };

        fetchReputation();
    }, [username]);

    const calculateHumanReadableReputation = (rep: number) => {
        if (rep === 0) {
            return 25;
        }

        const neg = rep < 0;
        const repLevel = Math.log10(Math.abs(rep));
        let reputationLevel = Math.max(repLevel - 9, 0);

        if (reputationLevel < 0) {
            reputationLevel = 0;
        }

        if (neg) {
            reputationLevel *= -1;
        }

        reputationLevel = reputationLevel * 9 + 25;

        return Math.floor(reputationLevel);
    };

    const humanReadableReputation = calculateHumanReadableReputation(reputation);

    return (
        <Badge bg={'orange'}>
            <Text color={"white"} fontSize={"28px"}> {humanReadableReputation}</Text>
        </Badge>
    );
}

export default UserReputation;

