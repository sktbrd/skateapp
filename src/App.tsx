import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PioneerProvider } from "@pioneer-platform/pioneer-react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from "lib/layout";
import Routings from "lib/router/Routings";
import { theme } from "lib/styles/theme";
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { WagmiProvider } from 'wagmi'

// Create a client instance for React Query
const queryClient = new QueryClient();

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <PioneerProvider>
          <ChakraProvider theme={theme}>
            <Router>
              <Layout>
                <Routings />
              </Layout>
            </Router>
          </ChakraProvider>
        </PioneerProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default App;
