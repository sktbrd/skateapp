export interface NFT {
  imageUrl: string;
  name: string;
  description: string;
  collectionAddress: string;
  nftStandard: string;
  network: string;
  token: {
    collection: {
      address: string;
      floorPriceEth: string;
      logoImageUrl: string;
      name: string;
      network: string;
      nftStandard: string;
      openseaId: string;
      tokenId: string;
    };
    medias: {
      originalUrl: string;
    }[];
  };
  id: string;
  rarityRank: number | null;
}

export interface NFTWalletProps {
  nftList?: NFT[];
}

export interface NFTCardProps {
  imageUrl: string;
  name: string;
  floorPriceEth: string;
  collectionAddress: string;
  nftStandard: string;
  network: string;
  id: string;
  rarityRank: number | null;
}
