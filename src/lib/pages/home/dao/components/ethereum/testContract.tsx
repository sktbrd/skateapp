import { Text } from "@chakra-ui/react";
import { ethers } from "ethers";

const gnars_contract = "0x558BFFF0D583416f7C4e380625c7865821b8E95C";
import ERC721_ABI from "./gnars_abi.json";

export default function Test() {
  const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/w_vXc_ypxkmdnNaOO34pF6Ca8IkIFLik");
  const contract = new ethers.Contract(gnars_contract, ERC721_ABI, provider);

  async function readContractData() {
    try {
      const result = await contract.getCurrentVotes("0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c");

      // Convert the result to a readable number
      const readableResult = ethers.utils.formatUnits(result, 0); // Assuming it's a uint256

      console.log("Contract result:", readableResult);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div>
      <Text>Test</Text>
      <button onClick={readContractData}>Get Current Votes</button>
    </div>
  );
}
