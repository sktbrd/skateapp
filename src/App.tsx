import React, { useEffect } from 'react';
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PioneerProvider } from "pioneer-react";
import { BrowserRouter as Router } from "react-router-dom";

import Layout from "lib/layout";
import Routings from "lib/router/Routings";
import { theme } from "lib/styles/theme";



// @ts-ignore
const ForceDarkMode = ({ children }) => {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode("dark");
  }, [setColorMode]);

  return <>{children}</>;
};

const App = () => {
  return (
   <PioneerProvider>
      <ChakraProvider theme={theme}>
        <ForceDarkMode>
          <Router>
            <Layout>
              <Routings />
            </Layout>
          </Router>
        </ForceDarkMode>
      </ChakraProvider>
   </PioneerProvider>
  );
};

export default App;
