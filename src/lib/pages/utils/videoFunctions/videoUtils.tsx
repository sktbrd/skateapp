import { transformGiphyLinksToMarkdown } from "../ImageUtils";


export function transformShortYouTubeLink(link: string): string {
  // Regular expression to match YouTube shortlinks
  const regex = /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(\?.+)?/;

  // Check if the input link matches the regex
  const match = link.match(regex);

  if (match) {
    // Extract the video ID from the matched link
    const videoID = match[1];

    // Return the regular YouTube link
    return `https://www.youtube.com/watch?v=${videoID}`;
  } else {
    // If the input link doesn't match the regex, return the original link
    return link;
  }
}

export function transformYouTubeContent(content: string): string {
  // Regular expression to match YouTube video URLs
  const regex = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;

  // Use the replace method to replace YouTube video URLs with embedded iframes
  let transformedContent = content.replace(regex, (match: string, videoID: string) => {
    // Wrap the iframe in a div with centering styles
    return `<div style="display: flex; justify-content: center; "><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer;  encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  });
  // Transform the content for 3speak videos
  transformedContent = transform3SpeakContent(transformedContent);
  transformedContent = transformGiphyLinksToMarkdown(transformedContent);
  return transformedContent;
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


// make a regex to match links like that <iframe src="https://ipfs.skatehive.app/ipfs/QmPdsChTSXQkqu3FLJHcAjqdLCqq5bCcnC1dKwCB8oLA1S?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE" allowfullscreen></iframe> and transform in videos like that <video controls muted loop> <source src="https://ipfs.skatehive.app/ipfs/QmPdsChTSXQkqu3FLJHcAjqdLCqq5bCcnC1dKwCB8oLA1S?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE" type="video/mp4"></video> 

export function transformIPFSContent(content: string): string {
  const regex = /<iframe src="https:\/\/ipfs\.skatehive\.app\/ipfs\/([a-zA-Z0-9-?=&]+)"(?:(?!<\/iframe>).)*\sallowfullscreen><\/iframe>/g;

  return content.replace(regex, (match, videoID) => {
    return `<video controls muted loop> <source src="https://ipfs.skatehive.app/ipfs/${videoID}" type="video/mp4"></video>`;
  });
}

