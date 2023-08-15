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
        backgroundColor: "black",
        color: props.colorMode === "dark" ? "white" : "black",
      },
      p: {
        color: "limegreen",
      },
    }),
  },
});
