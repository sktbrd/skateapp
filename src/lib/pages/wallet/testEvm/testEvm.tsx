import React from "react";
import { Box } from '@chakra-ui/react';
//@ts-ignore
import { Pioneer } from "pioneer-react"
//@ts-ignore
import { usePioneer } from "pioneer-react"
import { useEffect,useState } from "react";


const TestEvm = () => {

    const { state, dispatch } = usePioneer();
    const { api, app, user, status } = state;
    const [walletType, setWalletType] = useState("");
    const [context, setContext] = useState("");
    const [pubkeyContext, setPubkeyContext] = useState("");

    
    const setContextWallet = async function (wallet: string) {
        try {
          console.log("setContextWallet: ", wallet);
          // eslint-disable-next-line no-console
          console.log("wallets: ", app.wallets);
          const matchedWallet = app.wallets.find(
            (w: { type: string }) => w.type === wallet
          );
          console.log("matchedWallet: ", matchedWallet);
          if (matchedWallet) {
            setWalletType(matchedWallet.type);
            const context = await app.setContext(matchedWallet.wallet);
            console.log("result change: ", context);
            console.log("app.context: ", app.context);
            setContext(app.context);
            console.log(
               "app.pubkeyContext: ",
               app.pubkeyContext.master || app.pubkeyContext.pubkey
             );
            const pubkeyContext =
              app.pubkeyContext.master || app.pubkeyContext.pubkey;
            setPubkeyContext(pubkeyContext);
            dispatch({ type: "SET_CONTEXT", payload: app.context });
            dispatch({ type: "SET_PUBKEY_CONTEXT", payload: app.pubkeyContext });
            // dispatch({ type: "SET_WALLET", payload: wallet });
          } else {
            console.log("No wallet matched the type of the context");
          }
        } catch (e) {
          console.error("header e: ", e);
        }
      };

      useEffect(() => {
        dispatch({ type: "SET_CONTEXT", payload: context });
        setContext(app?.context);
        console.log(context)
        console.log(app?.pubkeyContext.address)
      }, [app?.context]); // once on startup



  return(
  <Box>
    
    <Pioneer/>
    <p>{app?.pubkeyContext.address}</p>

  </Box>
  )
};

export default TestEvm;
