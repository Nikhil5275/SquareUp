
import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import React from "react";

function MyApp({ Component, pageProps }: any) {
  return (
    <ChakraProvider>
      <ColorModeProvider>
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default MyApp;
