import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import getLibrary from "../getLibrary";
import "../styles/globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "../styles/theme";
import { Navbar } from "../components/Navbar";
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

function NextWeb3App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{
            background: 'linear-gradient(rgb(32, 39, 56) 0%, rgb(7, 8, 22) 100%)',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: -1,
          }} />
          <Navbar />
          <Component {...pageProps} />
          <Analytics />
          <ToastContainer position="top-center" theme="dark" limit={1} />
        </ThemeProvider>
      </QueryClientProvider>
    </Web3ReactProvider>
  );
}

export default NextWeb3App;
