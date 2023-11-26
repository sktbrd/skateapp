
export function formatWalletAddress(address: string): string {
    // Display the first 4 characters
    const firstPart = address.slice(0, 6);
  
    // Display the last 4 characters
    const lastPart = address.slice(-6);
  
    // Create the masked middle part with '...'
    const middlePart = '...';
  
    // Concatenate the parts to form the masked address
    const maskedAddress = `${firstPart}${middlePart}${lastPart}`;
  
    return maskedAddress;
  }
  