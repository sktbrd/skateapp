import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Text, Avatar, Flex, Button, Image, Input, Link, Divider, Table, Tbody, Tr, Td, HStack, Modal } from '@chakra-ui/react';
import { Client } from "@hiveio/dhive";
import { FaGift } from 'react-icons/fa';
import SendHiveModal from 'lib/pages/wallet/hive/sendHiveModal';

interface SubscriberInfo {
  username: string;
  authorAbout: string | null;
  hasVotedWitness: boolean;
  reputation: number;
  cover_image: string | null;
  location: string | null;
  balance: string | null;
  hbd_balance: string | null;
  last_account_update: string | null;
  account_age: string | null;
  vesting_shares: string | null;
}

function calculateHumanReadableReputation(reputation: number) {
  if (reputation === 0) {
    return 25;
  }

  const neg = reputation < 0;
  const repLevel = Math.log10(Math.abs(reputation));
  let reputationLevel = Math.max(repLevel - 9, 0);

  if (reputationLevel < 0) {
    reputationLevel = 0;
  }

  if (neg) {
    reputationLevel *= -1;
  }

  reputationLevel = reputationLevel * 9 + 25;

  return Math.floor(reputationLevel);
}

function SubscriberList() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const subscribersPerPage = 20;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userCount, setUserCount] = useState<number>(0);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transferMemo, setTransferMemo] = useState("");

  const fetchSubscribersWithPagination = async (lastSubscriberName?: string) => {
    try {
      const bridgeApiUrl = 'https://api.hive.blog';
      const communityName = 'hive-173115';

      const bridgeRequestData = {
        jsonrpc: '2.0',
        method: 'bridge.list_subscribers',
        params: {
          community: communityName,
          limit: subscribersPerPage,
          last: lastSubscriberName,
        },
        id: 1,
      };

      const response = await axios.post(bridgeApiUrl, bridgeRequestData);

      if (response.data && response.data.result) {
        const subscriberUsernames = response.data.result.map((subscriber: any) => subscriber[0]);

        const subscriberInfoPromises = subscriberUsernames.map(async (username: any) => {
          try {
            const client = new Client([
              "https://api.hive.blog/",
              "https://api.hivekings.com",
              "https://anyx.io",
              "https://api.openhive.network",
              "https://hived.privex.io",
              "https://rpc.ausbit.dev",
              "https://techcoderx.com"
            ]);
            const account = await client.database.getAccounts([username]);

            if (!account || !account.length) {
              return {
                username,
                authorAbout: null,
                hasVotedWitness: false,
                reputation: 0,
                cover_image: null,
                location: null,
                balance: null,
                hbd_balance: null,
                last_account_update: null,
                account_age: null,
                vesting_shares: null
              };
            }

            const last_account_update = account[0].last_account_update;
            const hbd_balance = account[0].hbd_balance;
            const balance = account[0].balance;
            const metadata = account[0].posting_json_metadata;
            let parsedMetadata = {
              profile: {
                location: null,
                cover_image: null,
                about: null,
              },
            };

            try {
              if (metadata) {
                parsedMetadata = JSON.parse(metadata) as any;
              }
            } catch (error) {
              console.error(`Error parsing JSON metadata for ${username}:`, error);
            }

            const vesting_shares = account[0].vesting_shares;
            const account_age = account[0].created;
            const location = parsedMetadata.profile?.location || null;
            const cover_image = parsedMetadata.profile?.cover_image || null;
            const authorAbout = parsedMetadata.profile?.about || null;
            const witnessVotes = account[0].witness_votes;
            const hasVotedWitness = witnessVotes.includes('skatehive');
            const reputationResponse = await axios.post(
              bridgeApiUrl,
              {
                jsonrpc: '2.0',
                method: 'condenser_api.get_account_reputations',
                params: [username, 1],
                id: 1,
              }
            );
            const reputation = reputationResponse.data.result[0]?.reputation || 0;
            return {
              username,
              authorAbout,
              hasVotedWitness,
              reputation,
              cover_image,
              location,
              balance,
              hbd_balance,
              last_account_update,
              account_age,
              vesting_shares
            };
          } catch (error) {
            console.error(`Error fetching additional info for ${username}:`, error);
            return {
              username,
              authorAbout: null,
              hasVotedWitness: false,
              reputation: 0,
              cover_image: null,
              location: null,
              balance: 0,
              hbd_balance: 0,
              last_account_update: null,
              account_age: null,
              vesting_shares: null
            };
          }
        });

        const newSubscriberInfo = await Promise.all<any>(subscriberInfoPromises);
        setUserCount((prevUserCount) => prevUserCount + subscriberUsernames.length);

        setSubscribers((prevSubscribers) => [...prevSubscribers, ...newSubscriberInfo]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching subscribers from Hive Bridge API:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribersWithPagination();
  }, []);

  const handleLoadMore = () => {
    const lastSubscriberIndex = subscribers.length - 1;
    const lastSubscriberName = subscribers[lastSubscriberIndex]?.username;
    fetchSubscribersWithPagination(lastSubscriberName);
    setIsLoading(true);
  };

  function formatLastUpdateDate(lastUpdate: string | null) {
    if (!lastUpdate) {
      return "";
    }
    
    const date = new Date(lastUpdate);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    return formattedDate;
  }

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.username.toLowerCase().includes(searchQuery)
  );

  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    if (a.hasVotedWitness && !b.hasVotedWitness) {
      return -1;
    } else if (!a.hasVotedWitness && b.hasVotedWitness) {
      return 1;
    }

    if (parseFloat(a.vesting_shares) < parseFloat(b.vesting_shares)) {
      return 1;
    } else if (parseFloat(a.vesting_shares) > parseFloat(b.vesting_shares)) {
      return -1;
    }

    return 0;
  });

  const handleSendModalOpen = (username: string) => {
    const defaultMemo = "🛹 Thank you for Voting on Skatehive Witness 🛹 ";
    setIsSendModalOpen(true);
    setToAddress(username);
    setTransferMemo(defaultMemo);
  };

  const handleSendModalClose = () => {
    setIsSendModalOpen(false);
  };
  function isRecentlyActive(subscriberInfo:any) {
    if (!subscriberInfo.account_age) {
      return false; // User has no activity if account_age is not available
    }
  
    const currentDate = new Date();
    const lastPostDate = new Date(subscriberInfo.last_account_update);
  
    // Calculate the difference in months between current date and last post date
    const monthsDifference = (currentDate.getFullYear() - lastPostDate.getFullYear()) * 12 + (currentDate.getMonth() - lastPostDate.getMonth());
  
    return monthsDifference <= 5; // Return true if user has posted in the last 5 months
  }
  
  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <Text>Users Loaded: {userCount}</Text>
      <Input
        type="text"
        placeholder="Search by username"
        value={searchQuery}
        maxWidth={'50%'}
        onChange={handleSearchInputChange}
        marginBottom="10px"
      />
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" flexDirection={"column"}>
          <Image boxSize={"60px"} src='https://64.media.tumblr.com/12da5f52c1491f392676d1d6edb9b055/870d8bca33241f31-7b/s400x600/fda9322a446d8d833f53467be19fca3811830c26.gif'></Image>
          <Button
            border="1px solid limegreen"
            color="white"
            bg="black"
            onClick={handleLoadMore}
            marginTop="10px"
            isDisabled={true}
          >
            Loading...
          </Button>
        </Flex>
      ) : (
        <Button
          border="1px solid limegreen"
          color="white"
          bg="black"
          onClick={handleLoadMore}
          marginTop="10px"
        >
          Load More
        </Button>
      )}

      <Flex flexWrap="wrap" justifyContent="center" alignItems="center">
        {sortedSubscribers.map((subscriberInfo: SubscriberInfo) => (
          <Box
            key={subscriberInfo.username}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="md"
            m={2}
            width="380px"
            height="712px"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.05)' }}
          >
            <HStack justifyContent={'center'}>
            <Avatar
                src={`https://images.ecency.com/webp/u/${encodeURIComponent(subscriberInfo.username)}/avatar/small`}
                size="lg"
                boxSize={20}
                borderRadius="50%"
                border={isRecentlyActive(subscriberInfo) ? "5px solid limegreen" : "5px solid red"} // Change border color based on activity
                marginBottom="10px"
              />


              <Link href={`https://skatehive.app/profile/${subscriberInfo.username}`} target="_blank" rel="noopener noreferrer">
                <Text color={'orange'} fontSize="lg" fontWeight="bold" textAlign="center">
                  {subscriberInfo.username}
                </Text>
              </Link>
              <Button variant={"ghost"} onClick={() => handleSendModalOpen(subscriberInfo.username)}>
                <FaGift size={30} color="orange" />
              </Button>
            </HStack>

            <Flex align="center" flexDirection="column" justifyContent="center">
              <Divider margin="10px" />
              <Table variant="simple">
                <Tbody>
                  <Tr>
                    <Td>Witness</Td>
                    <Td>{subscriberInfo.hasVotedWitness ? '✅ Voted' : '❌ Not Yet'}</Td>
                  </Tr>
                  <Tr>
                    <Td>Reputation</Td>
                    <Td>{calculateHumanReadableReputation(subscriberInfo.reputation)}</Td>
                  </Tr>
                  <Tr>
                    <Td>Location</Td>
                    <Td >🌎 {subscriberInfo.location}</Td>
                  </Tr>

                  <Tr>
                    <Td>Balance</Td>
                    <Td>{subscriberInfo.balance}</Td>
                  </Tr>
                  <Tr>
                    <Td>HBD Balance</Td>
                    <Td>{subscriberInfo.hbd_balance}</Td>
                  </Tr>
                  <Tr>
                    <Td>Vestings</Td>
                    <Td>{subscriberInfo.vesting_shares}</Td>
                  </Tr>
                  <Tr>
  <Td>Last Update</Td>
  <Td color={isRecentlyActive(subscriberInfo) ? 'limegreen' : 'red'}>{formatLastUpdateDate(subscriberInfo.last_account_update)}</Td>
</Tr>
                  <Tr>
                    <Td>Since</Td>
                    <Td>{formatLastUpdateDate(subscriberInfo.account_age)}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Flex>
            {isSendModalOpen && (
              <Modal isOpen={isSendModalOpen} onClose={handleSendModalClose}>
                <SendHiveModal
                  showModal={isSendModalOpen}
                  setShowModal={setIsSendModalOpen}
                  toAddress={toAddress}
                  setToAddress={setToAddress}
                  amount={amount}
                  setAmount={setAmount}
                  hiveMemo={transferMemo}
                  setHiveMemo={setTransferMemo}
                />
              </Modal>
            )}
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}

export default SubscriberList;
