import { useEffect, useState } from "react";
//@ts-ignore
import { usePioneer } from "pioneer-react";

import NFTWallet from "./nft/nftWallet";
import EvmBalance from "./evm /evmWallet";
import HiveBalanceDisplay from "./hive/hiveBalance";
import FiatBalance from "./fiat/fiat";
import { 
  useMediaQuery,
  Box,
  Flex,
  Text
 } from "@chakra-ui/react";
 import Web3 from "web3"; // Ensure you have this imported

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
    };
    medias: {
      originalUrl: string;
    }[];
  };
  id: string;
  rarityRank: number | null;
}

const Wallet = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } =
    state;
  const [address, setAddress] = useState("");
  const [totalWorth, setTotalWorth] = useState<number>(0);



  const [nftList, setNftList] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 

  useEffect(() => {
    console.log("pubkeyContext: ", pubkeyContext);
    setAddress(pubkeyContext.master || pubkeyContext.pubkey);
  }, [pubkeyContext]);



  console.log("Port: ", address);
  const [isSmallerThan768] = useMediaQuery("(max-width: 768px)");

  return (
    <div>
      <Flex direction={isSmallerThan768 ? "column" : "row"}>
        <Box flex="1" mr={isSmallerThan768 ? "0" : "10px"} mb={isSmallerThan768 ? "10px" : "0"}>
          <Box>
            <HiveBalanceDisplay />
          </Box>
          <Box padding="5px"></Box>
          <NFTWallet nftList={nftList} />
        </Box>
        <Box flex="1" ml={isSmallerThan768 ? "0" : "10px"} mt={isSmallerThan768 ? "10px" : "0"}>
          <EvmBalance />
        </Box>
      </Flex>
    </div>
  );
};



export default Wallet;
