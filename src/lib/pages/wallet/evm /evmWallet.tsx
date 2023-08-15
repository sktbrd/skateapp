



import React, { useEffect, useState } from "react";
//@ts-ignore
import { usePioneer } from "pioneer-react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Select,
  Flex,
  Button,
  Text,
} from "@chakra-ui/react";
import EvmSendModal from "./evmSendModal";

interface TokenInfo {
  id: string;
  networkId: number;
  address: string;
  label: string;
  name: string;
  balance: string;
  balanceUSD: string;
  caip: string;
  canExchange: boolean;
  coingeckoId: string;
  context: string;
  contract: string;
  createdAt: string;
  dailyVolume: number;
  decimals: number;
  description: string;
  explorer: string;
  externallyVerified: boolean;
  hide: boolean;
  holdersEnabled: boolean;
  image: string;
  isToken: boolean;
  lastUpdated: number;
  marketCap: number;
  network: string;
  price: number;
  priceUpdatedAt: string;
  protocal: string;
  pubkey: string;
  source: string;
  status: string;
  symbol: string;
  totalSupply: string;
  updatedAt: string;
  verified: boolean;
  website: string;
}

interface EvmBalanceItem {
  id: string;
  image: string;
  name: string;
  balance: string;
  balanceUSD: string; // Change the type to string
  network: string;
  pubkey: string;
}

const EvmBalance: React.FC = (): JSX.Element => {
  const { state, dispatch } = usePioneer();
  const { app , status } = state;


  const headers = ["Asset", "Balance", "Balance USD"];

  const [tableData, setTableData] = useState<EvmBalanceItem[]>(app?.balances || []);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<TokenInfo | null>(null);

  useEffect(() => {
    console.log("Balances: ", app?.balances)

    if (app?.balances) {
      let sortedBalances: EvmBalanceItem[] = [];
      if (selectedBlockchain === "all") {
        sortedBalances = app.balances.slice();
      } else {
        sortedBalances = app.balances.filter(
          (balance: EvmBalanceItem) => balance.network === selectedBlockchain
        );
      }

      // Sort the balances array in descending order based on balanceUSD
      sortedBalances.sort((a: EvmBalanceItem, b: EvmBalanceItem) =>
        parseFloat(b.balanceUSD) - parseFloat(a.balanceUSD)
      );

      setTableData(sortedBalances);
      console.log("STATUS: ",status)
    }
  }, [selectedBlockchain, app?.balances , status]);

  const blockchains: string[] = Array.from(
    new Set(app?.balances?.map((balance: EvmBalanceItem) => balance.network))
  ) || [];
  blockchains.unshift("all");

  const totalBalanceUSD = tableData.reduce(
    (total, balance) => total + parseFloat(balance.balanceUSD || "0"),
    0
  );

  const copyToClipboard = (address: string): void => {
    const textarea = document.createElement("textarea");
    textarea.value = address;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert(address + " copied to clipboard!");
  };

  const handleSendButtonClick = (tokenInfo: TokenInfo): void => {
    setSelectedTokenInfo(tokenInfo);
    setIsModalOpen(true);
  };

  return (
    <Box
      className="hive_box"
      borderRadius="12px"
      border="1px solid limegreen"
      padding="10px"
      overflow="auto"
      fontFamily="'Courier New', monospace"
    >
      <Text
        textAlign="center"
        borderRadius="12px"
        fontWeight="700"
        fontSize="18px"
        color="limegreen"
        padding="10px"
      >
        EVM Balance
      </Text>

      <Flex align="center">
        <Box>
          <h2>Total Estimated Balance of EVMs</h2>
          <p>{totalBalanceUSD.toFixed(2)} USD</p>
        </Box>
        <Select
          value={selectedBlockchain}
          onChange={(e) => setSelectedBlockchain(e.target.value)}
          ml="auto"
          w="150px"
        >
          {blockchains.map((blockchain) => (
            <option key={blockchain} value={blockchain as string}>
              {blockchain === "all" ? "All Blockchains" : blockchain}
            </option>
          ))}
        </Select>
      </Flex>
      {tableData.length === 0 ? (
        <p>No balances found for the selected blockchain. Try to connect wallet again</p>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {headers.map((header, index) => (
                <Th key={index}>{header}</Th>
              ))}
              <Th>Receive</Th>
              <Th>Send</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableData.map((balance) => (
              <Tr key={balance.id}>
                <Td>
                  <Image src={balance.image} alt={balance.name} boxSize="20px" mr="2" />
                  {balance.name}
                </Td>
                <Td>{parseFloat(balance.balance).toFixed(3)}</Td>
                <Td>{parseFloat(balance.balanceUSD).toFixed(2)}</Td>
                <Td>
                  <Button border="1px solid limegreen" onClick={() => copyToClipboard(balance.pubkey)}>Receive</Button>
                </Td>
                <Td>
                  <Button border="1px solid limegreen" onClick={() => handleSendButtonClick(balance as TokenInfo)}>
                    Send
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <EvmSendModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tokenInfo={selectedTokenInfo} />
    </Box>
  );
};

export default EvmBalance;
