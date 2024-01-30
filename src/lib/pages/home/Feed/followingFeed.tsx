import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { Client } from "@hiveio/dhive";
import voteOnContent from "../../utils/hiveFunctions/voting";
import useAuthUser from "../../../components/auth/useAuthUser";

import { useEffect, useState } from "react";
import PostModal from "./postModal/postModal";
import ErrorModal from "./postModal/errorModal";
import { useNavigate, Link } from "react-router-dom";

import * as Types from "./types";
import { css } from "@emotion/react";

import EarningsModal from "./postModal/earningsModal"; // Replace with the correct path to EarningsModal
import { MdArrowUpward } from 'react-icons/md';
import { Style } from "util";
interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

const nodes = [
  "https://api.deathwing.me",
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.pharesim.me",
];

const defaultThumbnail =
  "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fc.tenor.com%2FZco-fadJri4AAAAd%2Fcode-matrix.gif&f=1&nofb=1&ipt=9a9b3c43e852a375c62be78a0faf338d6b596b4eca90e5c37f75e20725a3fc67&ipo=images";
const placeholderEarnings = 69.42;

const randomSentences = [
  // "Have a spooky Skateboarding!",
  "Don't mall grab, or do it, you do you...",
  "'Ok to push Mongo, it is! -master yoda'",
  "Roll one, and play some stoken.quest?",
  "Remember Mirc times ?",
  "Fuck instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...",
  "We will load as fast as Daryl Rolls",
  "Who was Gnartoshi Shredamoto?",
  "We have secret sections here, can you find?"
];

const PlaceholderLoadingBar = () => {
  const randomIndex = Math.floor(Math.random() * randomSentences.length);
  const randomSentence = randomSentences[randomIndex];

  return (
    <center>
      <Image boxSize="300px" src="https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif" />
      <Text>{randomSentence}</Text>
    </center>
  );
};

const FollowingFeed: React.FC<Types.HiveBlogProps> = ({
  queryType = "created",
  tag = process.env.COMMUNITY || 'hive-173115'

}) => {

  const { user, isLoggedIn } = useAuthUser();
  console.log(user)


  return (
    <></>
  )
}

export default FollowingFeed