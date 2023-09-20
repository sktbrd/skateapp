import React from 'react';

export function transform3SpeakContent(content: any) {
  const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9]+\/[a-zA-Z0-9]+))\)/;
  const match = content.match(regex);
  if (match) {
    const videoURL = match[2];
    const videoID = match[3];
    const iframe = `<iframe class="video-player" width="560" height="315" src="https://3speak.tv/embed?v=${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    content = content.replace(regex, iframe);
  }
  return content;
}


export function transformYouTubeContent(content: string): string {
  // Regular expression to match YouTube video URLs
  const regex = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;

  // Use the replace method to replace YouTube video URLs with embedded iframes
  const transformedContent = content.replace(regex, (match: string, videoID: string) => {
    // Create an iframe with the YouTube video URL
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  });

  return transformedContent;
}


export function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
  };



  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCharactersToShow((prevChars) => {
  //       if (prevChars >= content.length) {
  //         clearInterval(timer);
  //         return prevChars;
  //       } else if (prevChars < 400) { // Scroll effect for the first 300 characters
  //         return prevChars + 1;
  //       } else { // Display the entire content after the scroll effect
  //         clearInterval(timer);
  //         return content.length;
  //       }
  //     });
  //   }, 5);
  
  //   return () => clearInterval(timer);
  // }, [content]);
  