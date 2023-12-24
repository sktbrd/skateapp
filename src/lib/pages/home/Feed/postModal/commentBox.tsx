import React, { useState } from 'react';
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
  Image
} from '@chakra-ui/react';

import * as Types from '../types';
import HiveLogin from '../../api/HiveLoginModal';
import { FaEthereum, FaHive } from 'react-icons/fa';
import sendHive from 'lib/pages/utils/hiveFunctions/sendHive';

const CommentBox: React.FC<Types.CommentBoxProps> = ({ user, parentAuthor, parentPermlink, onCommentPosted }) => {
  const [commentContent, setCommentContent] = useState('');
  const [isHiveLoginModalOpen, setHiveLoginModalOpen] = useState(false);
  const [isSendTipModalOpen, setSendTipModalOpen] = useState(false);

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
      <Modal isOpen={isSendTipModalOpen} onClose={() => setSendTipModalOpen(false)}>
        <ModalContent minW={"75%"} bg={"black"} border={"1px dashed limegreen"}>
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
              onClick={() => sendHive("0.1", parentAuthor || '', defaultMemo)}
              bg={"transparent"}
              color={"white"}
            > 0.1 HIVE</Button>
            <Button
              leftIcon={<FaHive color='red' />}
              border="3px solid red"
              mt="10px"
              onClick={() => sendHive("1", parentAuthor || '', defaultMemo)}
              bg={"transparent"}
              color={"white"}
            > 1 HIVE</Button>
            <Button
              leftIcon={<FaHive color='red' />}
              border="3px solid red"
              mt="10px"
              onClick={() => sendHive("10", parentAuthor || '', defaultMemo)}
              bg={"transparent"}
              color={"white"}
            > 10 HIVE</Button>
            <Button
              leftIcon={<FaHive color='red' />}
              border="3px solid red"
              mt="10px"
              onClick={() => sendHive("50", parentAuthor || '', defaultMemo)}
              bg={"transparent"}
              color={"white"}
            > 50 HIVE</Button>
          </HStack>
          <Box p="10px" textAlign="center">
            <Text textAlign="center" color={"white"}>Or enter a custom amount:</Text>

            <Input margin={"2px"} placeholder="Custom Amount"
              onChange={(e) => setCommentContent(e.target.value)}
              maxW={"20%"}
            />
            <Box p="10px" textAlign="center">
              <Text textAlign="center" color={"white"}>Send a Message with Transaction</Text>
              <Input margin={"2px"} placeholder="Custom Message"
                onChange={(e) => setDefaultMemo(e.target.value)}
                maxW={"20%"}
              />
            </Box>
            <Button
              leftIcon={<FaHive />}
              border="1px solid white"
              marginLeft={"10px"}
              onClick={() => sendHive(commentContent, parentAuthor || '', defaultMemo)}
            >Tip {commentContent} HIVE</Button>
          </Box>



        </ModalContent>
      </Modal>
    );
  }

  const handleHiveTipClick = () => {
    setSendTipModalOpen(true);
  }
  const handleEthereumTipClick = () => {
    console.log("Ethereum tip clicked");
    alert("comming soon, come on its xmas go mint the nft on the homepage")
  }

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
      {isHiveLoginModalOpen && (
        <HiveLogin isOpen={true} onClose={() => setHiveLoginModalOpen(false)} />
      )}
    </Box>
  );
};

export default CommentBox;
