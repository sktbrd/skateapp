import { extendTheme } from "@chakra-ui/react";

type GlobalStyleProps = { colorMode: "light" | "dark" };

const themeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  ...themeConfig,
  fonts: {
    heading: "Courier New, monospace",
    body: "Courier New, monospace",
  },
  components: {},
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        backgroundColor: "white",
        color: props.colorMode === "dark" ? "white" : "black",
      },
      p: {
        color: "teal",
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
