export function transformBandcampLinkToIframe(content: string): string {
    const regex = /(https:\/\/[a-zA-Z0-9-.]+\.bandcamp\.com\/(album|track)\/[a-zA-Z0-9-]+)(\/embed)?/;
    
    // Use the replace method to replace Bandcamp links with embedded iframes
    const transformedContent = content.replace(regex, (match: string, bandcampURL: string, type: string) => {
      // Create an iframe with the Bandcamp URL
      const iframeWidth = "100%"; // Customize the width here
      const iframeHeight = "120px"; // Customize the height here
      const bandcampIframe = `<iframe style="border: 0; width: ${iframeWidth}; height: ${iframeHeight};" src="${bandcampURL}/embed" seamless><a href="${bandcampURL}">Bandcamp Player</a></iframe>`;
      
      return bandcampIframe;
    });
  
    return transformedContent;
  }
  