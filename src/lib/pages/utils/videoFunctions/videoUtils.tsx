import React from 'react';
import { Box, Text } from "@chakra-ui/react";



export function transformYouTubeContent(content: string): string {
  // Regular expression to match YouTube video URLs
  const regex = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;

  // Use the replace method to replace YouTube video URLs with embedded iframes
  const transformedContent = content.replace(regex, (match: string, videoID: string) => {
    // Create an iframe with the YouTube video URL
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  });

  return transformedContent;
}

export function transformShortYouTubeLink(link: string): string | null {
  // Regular expression to match YouTube shortlinks
  const regex = /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/;

  // Check if the input link matches the regex
  const match = link.match(regex);

  if (match) {
    // Extract the video ID from the matched link
    const videoID = match[1];

    // Create an iframe with the YouTube video URL
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    // If the input link doesn't match the regex, return null
    return null;
  }
}

export function getYouTubeEmbedURL(url: string) {
  const videoId = url.split('v=')[1];
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export function SkateboardLoading({ progress }: any) {
  return (
    <Box
      mt={4}
      position="relative"
      height="8px"
      borderRadius="4px"
      border="1px solid gray"
      background="black"
    >
      {/* This Box represents the track on which the skateboard moves */}
      <Box
        position="absolute"
        top="0"
        bottom="0"
        width={`${progress}%`}
        background="limegreen"
        borderRadius="4px"
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      />

      {/* This Box represents the flat bar */}
      <Box
        position="absolute"
        height="8px"
        width="100%"
        bottom="0px"
        background="limegreen"
        borderRadius="4px"
      />
      <Box
        position="absolute"
        left={`${progress}%`}
        bottom="-8px"
        transform="translateX(-50%) scaleX(-1)" // Flip vertically
        userSelect="none"
        fontSize="3xl"
        transition="0.666s ease-in-out"
      >
        🛹
      </Box>
      {/* Sparkles coming out from the grinding */}
      <Text
        position="absolute"
        left={`${progress - 2}%`}
        bottom="0px"
        fontSize="sm"
        color="limegreen"
        transform="translateX(-50%)"
      >
        _____✨
      </Text>
    </Box>
  );
}

export function transform3SpeakContent(content: string): string {
  const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9.-_]+\/[a-zA-Z0-9]+))\)/;
  const match = content.match(regex);
  if (match) {
    const videoURL = match[2];
    const videoID = match[3];
    const iframe = `<iframe src="https://3speak.tv/embed?v=${videoID}" ></iframe>`;
    content = content.replace(regex, iframe);
  }
  return content;
}