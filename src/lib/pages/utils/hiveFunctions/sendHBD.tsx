import { KeychainSDK } from "keychain-sdk";

export default async function sendHBD(amount: string, toAddress: string, hiveMemo: string, username: string): Promise<void> {
  try {
    const parsedAmount = parseFloat(amount).toFixed(3);

    const keychain = new KeychainSDK(window);

    const transferParams = {
      data: {
        username: username,
        to: toAddress,
        amount: parsedAmount,
        memo: hiveMemo,
        enforce: false,
        currency: "HBD",
      },
    };
    const transfer = await keychain.transfer(transferParams.data);


  } catch (error) {
    console.error("Transfer error:", error);
  }
};