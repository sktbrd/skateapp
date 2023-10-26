
// Function to transform a URL into Markdown image syntax
export function transformGiphyLinksToMarkdown(url: string): string {
  // Define a regular expression to match the provided URL format
  const regex = /https:\/\/media\d+\.giphy\.com\/media\/([a-zA-Z0-9]+)\/giphy\.gif/;

  // Check if the URL matches the regular expression
  const match = url.match(regex);

  if (match && match.length === 2) {
    // Extract the GIF ID from the URL
    const gifId = match[1];

    // Construct the Markdown image syntax
    const markdownImage = `![GIF](https://media3.giphy.com/media/${gifId}/giphy.gif)`;

    return markdownImage;
  } else {
    // If the URL doesn't match the expected format, return the original URL
    return url;
  }
}

