import { Box, Flex } from "@chakra-ui/react";
import { useContext, type ReactNode } from "react";

import { LoadingBar } from "lib/components/LoadingBar";
import { LoadingContext } from "lib/pages/utils/LoadingProvider";
import Footer from "./Footer";
import HeaderNew from "./Header";
import Meta from "./Meta";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { isLoadingInitial, setIsLoadingInitial } = useContext(LoadingContext);

  return (
    <Box margin="0 auto" minWidth={"100%"} transition="0.5s ease-out">
      <LoadingBar />
      {!isLoadingInitial && <HeaderNew />}
      <Meta />

      <Flex
        wrap="wrap"
        margin="0"
        minHeight="90vh"
        display={isLoadingInitial ? "none" : "flex"}
      >
        <Box width="full" as="main" marginY={-5}>
          {children}
        </Box>

        <Footer />
      </Flex>
    </Box>
  );
};

export default Layout;
