import { extendTheme } from "@chakra-ui/react";

type GlobalStyleProps = { colorMode: "light" | "dark" };

const themeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  ...themeConfig,
  fonts: {
    heading: "NunitoSans-Regular, sans-serif",
    body: "NunitoSans-Bold, sans-serif",
  },
  components: {},
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        backgroundColor: "black",
        color: props.colorMode === "dark" ? "white" : "black",
      },
      p: {
        color: "limegreen",
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