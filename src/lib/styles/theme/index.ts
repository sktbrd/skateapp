import { extendTheme } from "@chakra-ui/react";

import '@fontsource/share-tech-mono';

type GlobalStyleProps = { colorMode: "light" | "dark" };

const themeConfig = {
  useSystemColorMode: false,
};

export const theme = extendTheme({
  ...themeConfig,
  fonts: {
    heading: "Share Tech Mono, monospace",
    body: "Share Tech Mono, monospace",
  },

  components: {},

  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        background: "linear-gradient(to top, #0D0D0D, #1C1C1C, #000000)",
        color: "white",
      },
      p: {
        color: "limegreen",
      },

      heading: {
        fontSize: "75px",
      },

      // Style for Webkit scrollbars
      "::-webkit-scrollbar": {
        width: "8px",
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
