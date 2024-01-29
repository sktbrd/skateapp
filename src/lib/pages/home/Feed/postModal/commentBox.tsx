import React, { useState, useEffect } from 'react';
import {
  Box,
  Textarea,
  Button,
  Flex,
  HStack,
  Modal,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Input,
  Text,
  Image,
  useToast,
} from '@chakra-ui/react';

import * as Types from '../types';
import HiveLogin from '../../../../components/auth/HiveLoginModal';
import { FaEthereum, FaHive } from 'react-icons/fa';
import sendHive from 'lib/pages/utils/hiveFunctions/sendHive';
import { Client } from "@hiveio/dhive";
import e from 'cors';
import EditProfileModal from 'lib/pages/profile/editProfileModal';

const CommentBox: React.FC<Types.CommentBoxProps> = ({ user, parentAuthor, parentPermlink, onCommentPosted }) => {
  const [commentContent, setCommentContent] = useState('');
  const [isHiveLoginModalOpen, setHiveLoginModalOpen] = useState(false);
  const [isSendHiveTipModalOpen, setSendHiveTipModalOpen] = useState(false);
  const [isEthAddressPresent, setIsEthAddressPresent] = useState(false);
  const [authorEthAddress, setEthAddress] = useState<string>('');
  const [isSendEthTipModalOpen, setSendEthTipModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const toast = useToast();
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchEthAddress = async () => {
      if (parentAuthor) {
        try {
          const client = new Client('https://api.hive.blog');
          const response = await client.database.getAccounts([parentAuthor]);

          if (Array.isArray(response) && response.length > 0) {
            const authorMetadata = JSON.parse(response[0].json_metadata).extensions;

            if (authorMetadata && authorMetadata.eth_address) {
              setIsEthAddressPresent(true);
              setEthAddress(authorMetadata.eth_address);
            }
          }
        } catch (error) {
          console.error('Error fetching account data:', error);
        }
      }
    };

    fetchEthAddress();
  }, [parentAuthor]);

  const handleCommentSubmit = () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!");
      return;
    }

    const username = user?.name;
    if (!username) {
      console.error("Username is missing");
      return;
    }

    const permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const operations = [
      ["comment",
        {
          "parent_author": parentAuthor,
          "parent_permlink": parentPermlink,
          "author": username,
          "permlink": permlink,
          "title": "",
          "body": commentContent,
          "json_metadata": JSON.stringify({ tags: ["skateboard"], app: "skatehive" })
        }
      ]
    ];

    window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
      if (response.success) {
        setCommentContent('');
        onCommentPosted();
      } else {
        console.error("Error posting comment:", response.message);
      }
    });
  };

  const sendHiveTipModal = () => {
    const [defaultMemo, setDefaultMemo] = useState("Awesome Post!")
    return (
      <Modal isOpen={isSendHiveTipModalOpen} onClose={() => setSendHiveTipModalOpen(false)}>
        <ModalContent minW={"30%"} bg={"black"} border={"3px solid red"}>
          <ModalCloseButton color={"red"} />
          <ModalHeader>Send Hive Tip to {parentAuthor}</ModalHeader>
          <center>

            <Image boxSize={"148px"} src="assets/santapepe.png"></Image>
          </center>
          <HStack p="10px" justifyContent={"space-between"} m={"20px"}>
            <Button
              leftIcon={<FaHive color='red' />}
              border="3px solid red"
              mt="10px"
              onClick={() => sendHive("0.1", parentAuthor || '', defaultMemo, user?.name)}
              bg={"transparent"}
              color={"white"}
            > 0.1 </Button>
            <Button
              leftIcon={<FaHive color='red' />}
              border="3px solid red"
              mt="10px"
              onClick={() => sendHive("1", parentAuthor || '', defaultMemo, user?.name)}
              bg={"transparent"}
              color={"white"}
            > 1 </Button>
            <Button
              leftIcon={<FaHive color='red' />}
              border="3px solid red"
              mt="10px"
              onClick={() => sendHive("10", parentAuthor || '', defaultMemo, user?.name)}
              bg={"transparent"}
              color={"white"}
            > 10 </Button>
            <Button
              leftIcon={<FaHive color='red' />}
              border="3px solid red"
              mt="10px"
              onClick={() => sendHive("50", parentAuthor || '', defaultMemo, user?.name)}
              bg={"transparent"}
              color={"white"}
            > 50 </Button>
          </HStack>
          <Box p="10px" textAlign="center">
            <Text textAlign="center" color={"white"}>Or enter a custom amount:</Text>

            <Input margin={"2px"} placeholder="Custom Amount"
              onChange={(e) => setCommentContent(e.target.value)}
              maxW={"60%"}
            />
            <Box p="10px" textAlign="center">
              <Text textAlign="center" color={"white"}>Send a Message with Transaction</Text>
              <Input margin={"2px"} placeholder="Custom Message"
                onChange={(e) => setDefaultMemo(e.target.value)}
                maxW={"60%"}
              />
            </Box>
            <Button
              leftIcon={<FaHive />}
              border="1px solid white"
              marginLeft={"10px"}
              onClick={() => sendHive(commentContent, parentAuthor || '', defaultMemo, user?.name)}
            >Tip {commentContent} HIVE</Button>
          </Box>
        </ModalContent>
      </Modal>
    );
  }

  const handleHiveTipClick = () => {
    setSendHiveTipModalOpen(true);
  }

  const handleEthereumTipClick = () => {
    if (parentAuthor) {
      const fetchData = async () => {
        try {
          const client = new Client('https://api.hive.blog');
          const response = await client.database.getAccounts([parentAuthor]);

          if (Array.isArray(response) && response.length > 0) {
            const authorMetadata = JSON.parse(response[0].json_metadata).extensions;

            if (authorMetadata && authorMetadata.eth_address) {
              setIsEthAddressPresent(true);
              setEthAddress(authorMetadata.eth_address);
              setSendEthTipModalOpen(true);
              sendEthTipToast();
            } else {
              sendEthTipToast();
            }
          } else {
            console.log('Invalid response from getAccounts');
          }
        } catch (error) {
          console.error('Error fetching account data:', error);
        }
      };
      fetchData();
    } else {
      console.log('parent author is not present');
    }
  };

  const sendEthTipToast = () => {
    let status: 'info' | 'success' | 'error' = 'info';
    let title = 'Ethereum Tip';
    let description = '';
    let duration = 3000;

    if (!isEthAddressPresent) {
      description = 'This user has not set an Ethereum address yet. Don´t let it happen with you, close this to add yours!';
      status = 'error';
      duration = 10000;
    } else {
      const copyEthAddressToClipboard = () => {
        navigator.clipboard.writeText(authorEthAddress);
      };
      copyEthAddressToClipboard();
      description = 'Copied ' + authorEthAddress + ' to clipboard.';
      status = 'success';
      duration = 3000;
    }

    toast({
      title,
      description,
      status,
      duration,
      isClosable: true,
      onCloseComplete: () => {
        if (!isEthAddressPresent) {
          setEditProfileModalOpen(true);
        }
      },
    });
  };

  return (
    <Box margin={"10px"} borderRadius={"10px"} border="1px solid white" padding="10px" mt="20px">
      <Textarea
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="Write your comment here..."
      />
      <HStack justifyContent={"space-between"}>
        <Flex>
          <Button
            leftIcon={<FaHive color='red' />}
            border="1px solid white"
            mt="10px"
            onClick={handleHiveTipClick}
          >Tip</Button>
          <Button
            leftIcon={<FaEthereum color='blue' />}
            border="1px solid white"
            mt="10px"
            marginLeft="10px"
            onClick={handleEthereumTipClick}
          >Tip</Button>
        </Flex>
        <Button border="1px solid white" mt="10px" onClick={handleCommentSubmit}>
          Submit Comment
        </Button>
      </HStack>

      {sendHiveTipModal()}
      {isEditProfileModalOpen && (
        <EditProfileModal user={user} isOpen={true} onClose={() => setEditProfileModalOpen(false)} />
      )}

      {isHiveLoginModalOpen && (
        <HiveLogin isOpen={true} onClose={() => setHiveLoginModalOpen(false)} />
      )}
    </Box>
  );
};

export default CommentBox;
