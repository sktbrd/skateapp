import { extendTheme } from "@chakra-ui/react";

import '@fontsource-variable/roboto-mono';
import '@fontsource/press-start-2p';
import '@fontsource/castoro';

type GlobalStyleProps = { colorMode: "light" | "dark" };

const themeConfig = {

  useSystemColorMode: false,
};

export const theme = extendTheme({
  ...themeConfig,
  fonts: {
    heading: "Press Start 2P, sans serif", //not working
    body: "Roboto Mono Variable, sans serif,bold", 
  },

  components: {},

  styles: {
    global: (props: GlobalStyleProps) => ({
      body: { 
        background: "linear-gradient(to top, #0D0D0D, #060126, #3D278C)",
        color:  "black" ,
      },
      p: {
        color: "white",
      },

      heading:{
        fontSize: "75px",
      },

      // Style for Webkit scrollbars
      "::-webkit-scrollbar": {
        width: "4px",
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: "black",
      },
      "::-webkit-scrollbar-thumb": {
        backgroundColor: "black",
        borderRadius: "0px",
      },
      // Style for Firefox scrollbars
      scrollbarWidth: "thin",
      scrollbarColor: "black black",
    }),
  },
});
