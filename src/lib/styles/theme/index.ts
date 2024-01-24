import { extendTheme } from "@chakra-ui/react";

import '@fontsource-variable/roboto-mono';
import '@fontsource/press-start-2p';

type GlobalStyleProps = { colorMode: "light" | "dark" };

const themeConfig = {

  useSystemColorMode: false,
};

export const theme = extendTheme({
  ...themeConfig,
  fonts: {
    heading: "Press Start 2P, sans serif", //not working
    body: "Roboto Mono Variable, sans serif",
  },

  components: {},

  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        background: "linear-gradient(to top, #0D0D0D, #1C1C1C, black)",
        color: "white",
      },
      p: {
        color: "orange",
      },

      heading: {
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
        backgroundColor: "limegreen",
        borderRadius: "0px",
      },
      // Style for Firefox scrollbars
      scrollbarWidth: "thin",
      scrollbarColor: "limegreen black",
    }),
  },
});
