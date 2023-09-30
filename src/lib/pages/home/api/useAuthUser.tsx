import { useState, useEffect } from "react";
import * as dhive from "@hiveio/dhive";

interface HiveKeychainResponse {
  success: boolean;
  publicKey: string;
  result: string;
}

// Define the Account type
interface Account {
  name: string;
}

export type AuthUser = {
  user: Account | null;
  loginWithHive: (username: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
};

export default function useAuthUser(): AuthUser {
  const dhiveClient = new dhive.Client([
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network",
  ]);
  const [user, setUser] = useState<Account | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const loginWithHive = async (username: string) => {
    if (typeof window === "undefined" || !(window as any).hive_keychain) {
      alert("Please install Hive Keychain first");
      window.location.href = "/tutorial";
      return;
    }

    if (!username) {
      alert("Please enter your username");
      return;
    }

    const memo = username + " signed up with skatehive app at " + Date.now();

    (window as any).hive_keychain.requestSignBuffer(
      username,
      memo,
      "Posting",
      async (response: HiveKeychainResponse) => {
        if (response.success === true) {
          console.log(response);
          const publicKey = response.publicKey;
          try {
            const val = await dhiveClient.keys.getKeyReferences([publicKey]);
            const accountName = val.accounts[0][0];
            if (accountName === username) {
              const sig = dhive.Signature.fromString(response.result);
              const key = dhive.PublicKey.fromString(publicKey);
              if (key.verify(dhive.cryptoUtils.sha256(memo), sig) === true) {
                const val2 = await dhiveClient.database.getAccounts([accountName]);
            
                const userAccount: Account = {
                    ...val2[0],
                };
            
                setUser(userAccount);
                sessionStorage.setItem("user", JSON.stringify(userAccount));
                window.location.reload(); // Refresh the page after login
                        
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    window.location.reload();
  };

  const isLoggedIn = () => {
    return !!user;
  };

  return {
    user,
    loginWithHive,
    logout,
    isLoggedIn,
  };
}
