import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  Flex,
  Heading,
  ModalCloseButton,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  VStack,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import * as Types from '../types';
import { Link } from 'react-router-dom';
import OpenAI from 'openai';
import { FaShare, FaCopy } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const PostHeader: React.FC<Types.PostHeaderProps> = ({ title, author, avatarUrl, permlink, postUrl, onClose, content, date }) => {
  const peakdUrl = `https://peakd.com${postUrl}`;

  const [postLinkCopied, setPostLinkCopied] = useState(false);



  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    const formattedDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateString));
    const formattedHour = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(dateString));

    return (
      <>
        <Tooltip label={`at ${formattedHour}`}>
          <span>{formattedDate}</span>
        </Tooltip>
      </>
    );
  };
  const generatePostUrl = () => {
    return `https://skatehive.app/post${postUrl}`;
  }
  const cleanUrl = generatePostUrl().replace(window.location.origin, '');
  const handleCopyPostLink = () => {
    try {
      const postPageUrl = generatePostUrl();
      navigator.clipboard.writeText(postPageUrl);
      setPostLinkCopied(true);
      //wait 3 seconds
      setTimeout(() => {
        setPostLinkCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy the link:', error);
    }
  };

  // -------- AI STUFF ----------------
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });

  const [tweetSummary, setTweetSummary] = useState('Skateboard is Cool');

  const getSummary = async (body: string) => {
    const prompt = `Summarize this content into a tweet-friendly sentence in up to 70 caracters. Exclude emojis and special characters that might conflict with URLs. Omit any 'Support Skatehive' sections. dont use emojis Content, dont use hashtags, ignore links: ${body}`;
    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });
    const summary = response.choices[0]?.message?.content || 'Check my new Post on Skatehive';
    const encodedSummary = encodeURIComponent(summary);
    return encodedSummary;
  };

  const handleShareWarpCast = async () => {
    try {
      const postPageUrl = encodeURI(generatePostUrl());
      const summary = await getSummary(content);
      setTweetSummary(summary);
      const warptext = `${summary} ${postPageUrl}`;

      window.open(`https://warpcast.com/~/compose?text=${warptext}`, '_blank');
    }
    catch (error) {
      console.error('Failed to share in WarpCast:', error);
    }
  }

  const handleShareTwitter = async () => {
    try {
      const postPageUrl = encodeURI(generatePostUrl());
      const summary = await getSummary(content);
      setTweetSummary(summary);
      // assemble text + url in just one string 
      const tweetText = `${summary} ${postPageUrl}`;
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');

    }
    catch (error) {
      console.error('Failed to share in Twitter:', error);
    }
  }

  return (
    <>
      <ModalCloseButton m={1} onClick={onClose} color="white" _hover={{ bg: 'limegreen' }} _active={{ bg: 'gray.700' }} />
      <Flex alignItems="center" minW={"100%"}  >
        <Box display="flex" mt={1}  >
          <Link to={`/profile/${author}`}>
            <Box p={'2'} borderRadius={"10px"}>
              <VStack >
                <Image border={"1px solid white"} boxSize="68px" borderRadius="10%" src={avatarUrl} alt={author} />
                <Text color={"blue.200"} fontSize="16px">{author}</Text>
              </VStack>
            </Box>

          </Link>

        </Box>
        <VStack minW={"80%"}>
          <Box borderRadius="10px" border="1px solid white" flex="1" ml="2" mt={"0"} minW={"100%"} >
            <center>
              <Text color="white" padding="8px" size="md">
                {title}
              </Text>
              <Divider color={"white"} />
            </center>
            <Flex justifyContent="space-between" alignItems="center">


              <Text ml={"20%"} color="white" padding="8px" fontSize="14px" textAlign="center" flex="1">
                {formatDate(date)}
              </Text>
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<FaShare />}
                  color="white"
                  bg="black"
                  border="1px solid white"
                  marginTop="10px"
                  display={{ base: 'none', md: 'flex' }}
                  _hover={{ bg: 'limegreen', color: 'black' }}
                >
                  Share
                </MenuButton>
                <MenuList bg={"black"} right="0">
                  {/* Copy Link Menu Item */}
                  <MenuItem bg={"black"} onClick={handleCopyPostLink} style={{ display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                    <FaCopy style={{ marginRight: '5px' }} />
                    {postLinkCopied ? 'Link Copied!' : 'Copy Link'}
                  </MenuItem>

                  {/* WarpCast Menu Item */}
                  <MenuItem bg={"black"} onClick={handleShareWarpCast} style={{ display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                    <Image src='assets/warpcast.png' boxSize="24px" style={{ marginRight: '5px' }} />
                    {postLinkCopied ? ' Share it' : ' WarpCast'}
                  </MenuItem>

                  {/* Twitter Menu Item */}
                  <MenuItem bg={"black"} onClick={handleShareTwitter} style={{ display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                    <FaXTwitter style={{ marginRight: '5px' }} />
                    {postLinkCopied ? 'Share it!' : 'Twitter'}
                  </MenuItem>

                  {/* Post Page Menu Item */}
                  <a href={generatePostUrl()} style={{ textDecoration: 'none' }}>
                    <MenuItem bg={"black"} style={{ display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                      <span style={{ marginRight: '5px' }}>📜</span>
                      Post Page
                    </MenuItem>
                  </a>

                  {/* PeakD Menu Item */}
                  <a href={peakdUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <MenuItem bg={"black"} style={{ display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                      <Image src="https://i.ibb.co/VpC46P5/image.png" boxSize="24px" style={{ marginRight: '5px' }} />
                      PeakD
                    </MenuItem>
                  </a>
                </MenuList>
              </Menu>

            </Flex>


          </Box>

        </VStack>






      </Flex >

      <Divider color={"white"} mt={2} />



    </>
  );
}

export default PostHeader;

