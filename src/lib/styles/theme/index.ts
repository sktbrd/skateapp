import { extendTheme } from "@chakra-ui/react";
import '@fontsource-variable/roboto-mono';

type GlobalStyleProps = { colorMode: "light" | "dark" };

const themeConfig = {

  useSystemColorMode: false,
};


export const theme = extendTheme({
  ...themeConfig,
  fonts: {
  heading: "Terrorplate, sans-serif",
  body: "Terrorplate, sans-serif", 
  },
  

  components: {},

  styles: {
    global: (props: GlobalStyleProps) => ({
      body: { 
        background: "black",
        color:  "black" ,
        'font-family': 'Terrorplate, sans-serif',

      },
      p: {
        color: "white",
        'font-family': 'Terrorplate, sans-serif',

      },
      
      heading:{
        fontSize: "75px",
        'font-family': 'Terrorplate, sans-serif',
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