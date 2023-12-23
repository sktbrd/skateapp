import React, { useEffect, useState } from 'react';
import { Box, Text, Code, UnorderedList, ListItem, Button, Select, Divider } from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";

const dhiveClient = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

// Define a mapping of transaction types to nicknames
const transactionTypeNicknames: Record<string, string> = {
  effective_comment_vote: 'Comment Vote',
  vote: 'Vote',
  curation_reward: 'Curation Reward',
  comment_options: 'Comment Options',
  comment: 'Comment',
  transfer: 'Transfer',
};

interface WalletTransactionsProps {
  wallet: string;
}

const WalletTransactions: React.FC<WalletTransactionsProps> = ({ wallet }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [batchSize, setBatchSize] = useState(20);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const accountHistory = await dhiveClient.database.getAccountHistory(wallet, -1, batchSize * 2);

        setTransactions(accountHistory.slice(0, batchSize));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [wallet, batchSize]);

  const loadMoreTransactions = () => {
    // Increase the batch size by 20
    setBatchSize(batchSize + 20);
  };

  useEffect(() => {
    // Fetch transfer transactions separately
    const fetchTransferTransactions = async () => {
      try {
        const accountHistory = await dhiveClient.database.getAccountHistory(wallet, -1, batchSize * 2);

        // Filter transfer transactions
        const transferTransactions = accountHistory.filter(
          (entry) => entry[1].op[0] === "transfer"
        );


        // Merge transfer transactions with existing transactions
        setTransactions((prevTransactions) => [...prevTransactions, ...transferTransactions]);
      } catch (error) {
        console.error("Error fetching transfer transactions:", error);
      }
    };

    // Check if "transfer" is selected and fetch transfer transactions
    if (selectedType === "transfer") {
      fetchTransferTransactions();
    }
  }, [wallet, batchSize, selectedType]);

  const filteredTransactions = selectedType
    ? transactions.filter((entry) => entry[1].op[0] === selectedType)
    : transactions;

  const transactionTypes = Array.from(
    new Set(transactions.map((entry) => entry[1].op[0]))
  );

  return (
    <Box minWidth="auto">
      <Box border="1px solid #ccc" p="2">
        <center>
          <Text fontSize="24" fontWeight="bold">Transactions of {wallet}:</Text>
        </center>
        <Select
          style={{ backgroundColor: 'lightgray' }}
          color="black"
          placeholder="Select Transaction Type"
          value={selectedType || ''}
          onChange={(e) => setSelectedType(e.target.value || null)}
          mb="4"
        >
          <option style={{ backgroundColor: 'lightgray' }} value="">All</option>
          {transactionTypes.map((type) => (
            <option key={type} value={type} style={{ backgroundColor: 'lightgray' }}>
              {transactionTypeNicknames[type] || type} {/* Display nickname if available */}
            </option>
          ))}
        </Select>
      </Box>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <Box>
          {filteredTransactions.map((entry, index) => (
            <div key={index} style={{ width: "100%", overflow: "hidden", marginBottom: "16px" }}>
              <Box border="1px solid #ccc" p="2">
                <Text fontWeight="bold">Operation: {entry[1].op[0]}</Text>
                <Code minWidth="100%" colorScheme="teal" p="2">
                  <UnorderedList listStyleType="none" ml="0">
                    {Object.entries(entry[1].op[1]).map(([key, value]) => (
                      <ListItem key={key}>
                        <Text as="span" fontWeight="bold">{key}:</Text> {JSON.stringify(value, null, 2)}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Code>
              </Box>
            </div>
          ))}
          {transactions.length < batchSize * 2 && (
            <center>
              <Button mt="4" colorScheme="teal" onClick={loadMoreTransactions}>
                Load More
              </Button>
            </center>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WalletTransactions;
