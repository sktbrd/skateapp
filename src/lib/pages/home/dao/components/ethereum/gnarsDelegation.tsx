import { Flex, Button, Table, Thead, Grid, Tbody, Tr, Th, Td, Text , Image, VStack, Box,HStack} from "@chakra-ui/react";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import UserReputation from "lib/pages/utils/hiveFunctions/usersReputation";
const gnars_contract = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";
const skthv_contract = "0x3dEd025e441730e26AB28803353E4471669a3065";
const skthv_proxy_contract = "0x3ded025e441730e26ab28803353e4471669a3065";
import { Client } from "@hiveio/dhive";
import { formatWalletAddress } from "lib/pages/utils/formatWallet";
import ERC721_ABI from "./gnars_abi.json";
import ERC1155_ABI from "./skthvOG_abi.json";
import { KeychainSDK } from "keychain-sdk";

export interface WitnessVote {
  username: string;
  witness: string;
  vote: boolean;
}


interface WalletData {
  username: string;
  walletAddress: string;
  votes?: string;
  isDelegated?: boolean;
  totalSupply?: string;
  balance?: string;
  balanceOfSkthv?: string;
  hasVotedForSkateHive?: boolean; 
  hasHiveAccount?: boolean;
  hivePower?: string;
}
interface WalletListElement {
  username: string;
  walletAddress: string;
  hasVotedForSkateHive?: boolean; 
  hasHivePower?: string;
}
declare global {
  interface Window {
    ethereum?: any;
  }
}
const walletsList: WalletListElement[] = [
  { username: 'skatecuida', walletAddress: '0xf91d7656949ca73e7e2c196aa798b04b3f4bbdaf' },
  { username: 'bobburnquist', walletAddress: '0x27d14099f3b38a08f8767ccf306737da113a38a6' },
  { username: 'stickchumpion', walletAddress: '0xdA520AeC14C937869cC3EF9A6b0F34B2850cd092' },
  { username: 'fmajuniorphoto', walletAddress: '0x2473FB8eEBE46041d5F528A728505C26A81C1158' },
  { username: 'zoggygivaerts', walletAddress: '0x7e86b7bCa2a72ab392AD816CC0Bf04A5aEea4860' },
  { username: 'floralshirtguy', walletAddress: '0x74277786071387C29FB105daFe7f2085DFD89DCd' },
  { username: 'illusivelf', walletAddress: '0x4c7e2E4419c2537d66DA720B0Fe7B99A4e9a0d7c' },
  { username: 'davixesk8', walletAddress: '0x6f4Ba620396efba124e6b6518b2f175A7773A25A' },
  { username: 'dylhep', walletAddress: '0x365c10692b34073C5c94e28e4363eCCB311c83F3' },
  { username: 'ezekhiveadict', walletAddress: '0xd082cc50db08b028fc12726861d5f260a786777e' },
  { username: 'knowhow92', walletAddress: '0x761b4763a572010f96Ed7c22011D0C95E2b36693' },
  { username: 'fonestreet', walletAddress: '0xDa3864B0a7E3Baf664d93f744Ba73035653b4d28' },
  { username: 'xvlad', walletAddress: '0x41CB654D1F47913ACAB158a8199191D160DAbe4A' },
  { username: 'niggyayo', walletAddress: '0xabb2dd59ba784e5116a218f856cedb6c874d68d5' },
  { username: 'rxdolo', walletAddress: '0x4fc1b98F87764aCb52C2237Defa48B07F55A86a8' },
  { username: 'jimkal1992', walletAddress: '0x6456b50b6dFf9ffDb29C6C3a076a147BdDc03896' },
  { username: 'thejajasper', walletAddress: '0x6dfdca1107c5af4b92948625105e1e87ba9b21b4' },
  { username: 'boeltermc', walletAddress: '0x80eb1c0bbb63813f2eb17e0ef4b8b7caaf265bc4' },
  { username: 'toffer', walletAddress: '0x16972bb04a62C2e5aA1774e4686B203499de922B' },
  { username: 'transtorn0', walletAddress: '0xF979B982df3967850C1Da28eE52Cc7Cfc053a0a9' },
  { username: 'rilo', walletAddress: '0x25B4b33d83a43d56ac700E9b924Aa65dE5431C9b' },
  { username: 'tibfox', walletAddress: '0xC58A8F98E077Ee6274A827cEE4e45D3c827e4a6B' },
  { username: 'web-gnar', walletAddress: '0xDB1CB916373416FC900a8533ce02AFf3faa62cdf' },
  { username: 'tomroar', walletAddress: '0xe93117d28b3abc4c62331ecca2e7bfe154f5ea4d' },
  { username: 'homelesscrewmx', walletAddress: '0xA4544871041A26684b2D5b085a600b33541Bd2E0' },
  { username: 'cinnartmon', walletAddress: '0x7cBf7Ad18c16da3B309389e75a7443f27a39160e' },
  { username: 'branders0n', walletAddress: '0x4E7936300C8d593b779Da10DcE43513FE0A832Fe' },
  { username: 'mero.chou', walletAddress: '0xae67C83ce96918c4559f0fc825Dca5a86A5e2ac2' },
  { username: 'mengao', walletAddress: '0xd4EAa5e657C8B3349cb6BeCf8Ac097839e9e7aF5' },
  { username: 'sandymeyer', walletAddress: '0x8B8F6f8e6DAc195db4c79bf42c32490c3ae0b3C7' },
  { username: 'nicolcron', walletAddress: '0xaF9044611bCCD48413B708B88b2A05820675d906' },
  { username: 'vcclothing', walletAddress: '0x39A505CB3d38f2C72A3A08D3c057aBc7A03D3367' },
  { username: 'ervin-lemark', walletAddress: '0xC637A44E3E25aDAA06e390108C768CF8d80Ae033' },
  { username: 'alexjay', walletAddress: '0x3c4E0B3Ce394Ee76f44253783506FcBAB5a615A1' },
  { username: 'gnarip12345', walletAddress: '0x4355EC7423Ee3b045917092CBF8F8BFd3233da27' },
  { username: 'keepskating420', walletAddress: '0x22376c76d120BF033651c931E9Ff23f240173637' },
  { username: 'beaglexv', walletAddress: '0xfCAE6D6b1517799330DF14BeE26e2DD90C6dd200' },
  { username: 'smithfinance', walletAddress: '0x6abaDe6569f03841a0d5233d23f175Eeeb3253c4'},
  { username: 'howweroll', walletAddress: '0x09e938e239803c78507abd5687a97acfea1188ea'},
  { username: 'skatehacker', walletAddress: '0x5746396dfE7025190a7775dF94b6E89310DDd238'},
  { username: 'keepkey', walletAddress: '0x4A0A41f0278C732562E2A09008dfb0E4B9189eb3'},
  { username: 'coletivoxv', walletAddress: '0xAf32BB3892F37c518f3841275F131384a41B9b57'},
  { username: 'ygorpicolinoskt', walletAddress: '0x26f00f9542545B13373c94837AF15ddC97eFE0c8'},
  { username: 'doblershiva', walletAddress: '0x0DF34E36ef3a793871442EB5a08b08adB74E7006'},
  { username: 'paralela', walletAddress: '0x0F7318E9D1EAfe53C3bFD7EE774ce33020Cf53F3'},
  { username: 'willdias', walletAddress: '0xDdB4938755C243a4f60a2f2f8f95dF4F894c58Cc'},
  { username: 'pharra', walletAddress: '0x735135Ff4152b3Ae255cA708EB37D83B0A8853F8'},
];
const GnarsDelegation: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData[]>([]);
  const [totalDelegatedVotes, setTotalDelegatedVotes] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWalletData() {
      try {
        const client = new Client([
          "https://api.hive.blog/",
          "https://api.hivekings.com",
          "https://anyx.io",
          "https://api.openhive.network",
          "https://hived.privex.io",
          "https://rpc.ausbit.dev",
          "https://techcoderx.com",
        ]);

        const provider = new ethers.providers.JsonRpcProvider(
          "https://eth-mainnet.g.alchemy.com/v2/w_vXc_ypxkmdnNaOO34pF6Ca8IkIFLik"
        );
        const contract = new ethers.Contract(gnars_contract, ERC721_ABI, provider);
        const skthvProxyContract = new ethers.Contract(skthv_proxy_contract, ERC1155_ABI, provider);
        const usernames = walletsList.map((wallet) => wallet.username);

        
        const hasVotedForSkateHive = await Promise.all(
          usernames.map(async (username) => {
            const account = await client.database.getAccounts([username]);

            const hasVotedForSkateHive =
              account[0]?.witness_votes?.includes("skatehive") || false;
            const hasHiveAccount = !!account[0];
        
            return { hasVotedForSkateHive, hasHiveAccount };
          })
        );
        
        


        const delegatedVotes = await contract.getCurrentVotes(
          "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c"
        );
        const totalSupply = await contract.totalSupply();
        setTotalDelegatedVotes(ethers.utils.formatUnits(delegatedVotes, 0));

        const updatedWalletsList: WalletData[] = await Promise.all(
          walletsList.map(async (wallet, index) => {
            const votes = await contract.getCurrentVotes(wallet.walletAddress);
            const balanceOfSkthv = await skthvProxyContract.balanceOf(
              wallet.walletAddress,
              1
            );
            const account = await client.database.getAccounts([wallet.username]);
            const hivePower = account[0]?.vesting_shares || 0;


            const isDelegated =
              (await contract.delegates(wallet.walletAddress)) ===
              "0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c";
            const balance = await contract.balanceOf(wallet.walletAddress);
            return {
              ...wallet,
              votes: ethers.utils.formatUnits(votes, 0),
              isDelegated,
              totalSupply: ethers.utils.formatUnits(totalSupply, 0),
              balance: ethers.utils.formatUnits(balance, 0),
              balanceOfSkthv: ethers.utils.formatUnits(balanceOfSkthv, 0),
              hasVotedForSkateHive: hasVotedForSkateHive[index].hasVotedForSkateHive,
              hasHiveAccount: hasVotedForSkateHive[index].hasHiveAccount,
            };
          })
        );

        const sortedWalletData = updatedWalletsList.sort(
          (a, b) => parseFloat(b.balance!) - parseFloat(a.balance!)
        );

        setWalletData(sortedWalletData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchWalletData();
  }, []);

  const handleCopy = (walletAddress: string) => {
    navigator.clipboard.writeText(walletAddress);
  };

  const handleWitnessVote = async (wallet_username: string) => {
    try {
      const keychain = new KeychainSDK(window);
      console.log(wallet_username);
      const formParamsAsObject = {
        data: {
          username: wallet_username,
          witness: "skatehive",
          vote: true,
        },
      };

      const witnessVoteResult = await keychain.witnessVote(formParamsAsObject.data as WitnessVote);
      console.log({ witnessVoteResult });
    } catch (error) {
      console.error("Error voting for witness:", error);
    }
  };

  const handleWitnessClick = async (wallet_username: string) => {
    console.log("Username:", wallet_username);
    await handleWitnessVote(wallet_username);
  };

  return (
    <VStack spacing={4} align="stretch">
      <Grid
        templateColumns="repeat(auto-fit, minmax(300px, 1fr))" // Adjust the column width as needed
        gap={4}
        justifyItems="center"
      >
        {/* First Box */}
        <Box textAlign="center" borderWidth="0px" borderRadius="lg" p={4}>
          <center>
          <Image src="https://www.gnars.wtf/images/logo.png" boxSize={28} align={"center"} />
          </center>
          <Text fontSize="xl" fontWeight="bold">
            Gnars Supply
          </Text>
          <Text color={"orange"} fontSize="xl" fontWeight="bold">
            {walletData[0]?.totalSupply}
          </Text>
        </Box>

        {/* Second Box */}
        <Box textAlign="center" borderWidth="0px" borderRadius="lg" p={4}>
        <center>
          <Image src="assets/skatehive-logo.png" boxSize={28} align={"center"} />
          </center>
          <Text fontSize="xl" fontWeight="bold">
            Delegated Gnars    
          </Text>
          <Text color={"orange"} fontSize="xl" fontWeight="bold">
            {totalDelegatedVotes}
          </Text>
        </Box>
      </Grid>

      <Box>
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>Avatar</Th>
              <Th>Username</Th>
              <Th> skthv OG</Th>
              <Th>Wallet Address</Th>
              <Th>Gnars Balance</Th>
              <Th>Delegated to SkateHive</Th>
              <Th> Witness Vote</Th>
              <Th> Hive Power</Th>
            </Tr>
          </Thead>
          <Tbody fontSize={24}>
            {walletData.map((wallet) => (
              <Tr key={wallet.walletAddress}>
                <Td>
                  <a
                    href={`https://skatehive.app/profile/${wallet.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {wallet.hasHiveAccount ? (
                      <Image
                        border="0px solid transparent"
                        borderRadius="10px"
                        src={`https://images.ecency.com/webp/u/${wallet.username}/avatar/small`}
                        width="50px"
                        height="50px"
                        style={{
                          boxShadow: "0 8px 12px rgba(0, 0, 0, 0.8)",
                          filter:
                            wallet.balanceOfSkthv && parseFloat(wallet.balanceOfSkthv) > 0
                              ? "drop-shadow(0 0 8px limegreen)"
                              : "none",
                        }}
                      />
                    ) : (
                      <Image
                        border="2px solid white"
                        borderRadius="10px"
                        src={`https://i.gifer.com/XwI7.gif`}
                        width="50px"
                        height="50px"
                        style={{
                          boxShadow: "0 8px 12px rgba(0, 0, 0, 0.8)",
                        }}
                      />
                    )}
                  </a>
                </Td>
                <Td>
                  <a
                    href={`https://skatehive.app/profile/${wallet.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {wallet.username} <UserReputation username={wallet.username} />
                  </a>
                </Td>
                <Td>{wallet.balanceOfSkthv}</Td>
                <Td
                  color={"white"}
                  onClick={() => handleCopy(wallet.walletAddress)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {formatWalletAddress(wallet.walletAddress)}
                </Td>
                <Td>{wallet.balance}</Td>
                <Td style={{ color: wallet.isDelegated ? "green" : "red" }}>
                  {wallet.isDelegated ? "Yes" : "No"}
                </Td>
                <Td>
                  {wallet.hasVotedForSkateHive ? (
                    <span style={{ color: "green" }}>Voted</span>
                  ) : (
                    <Button onClick={() => handleWitnessClick(wallet.username)} colorScheme="red">
                      Vote
                    </Button>
                  )}
                </Td>
                    
                <Td>{wallet.hivePower}</Td>

              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <HStack spacing={4} justify="center">
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" flexDirection={"column"}>
          <Image
            boxSize={"60px"}
            src="https://64.media.tumblr.com/12da5f52c1491f392676d1d6edb9b055/870d8bca33241f31-7b/s400x600/fda9322a446d8d833f53467be19fca3811830c26.gif"
          ></Image>

        </Flex>
      ) : null}
      </HStack>
    </VStack>
  );
};

export default GnarsDelegation;
