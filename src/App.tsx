import { ChakraProvider } from "@chakra-ui/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PioneerProvider } from "@pioneer-platform/pioneer-react";
import { LoadingProvider } from "lib/pages/utils/LoadingProvider";
import { BrowserRouter as Router } from "react-router-dom";

import Layout from "lib/layout";
import Routings from "lib/router/Routings";
import { theme } from "lib/styles/theme";

const App = () => {
  return (
    <PioneerProvider>
      <ChakraProvider theme={theme}>
        <LoadingProvider>
          <Router>
            <Layout>
              <Routings />
            </Layout>
          </Router>
        </LoadingProvider>
      </ChakraProvider>
    </PioneerProvider>
  );
};

export default App;
