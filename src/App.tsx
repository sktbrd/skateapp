import React, { useEffect } from 'react';
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PioneerProvider } from "pioneer-react";
import { BrowserRouter as Router } from "react-router-dom";

import Layout from "lib/layout";
import Routings from "lib/router/Routings";
import { theme } from "lib/styles/theme";





const App = () => {
  return (
   <PioneerProvider>
      <ChakraProvider theme={theme}>
          <Router>
            <Layout>
              <Routings />
            </Layout>
          </Router>
      </ChakraProvider>
   </PioneerProvider>
  );
};

export default App;
