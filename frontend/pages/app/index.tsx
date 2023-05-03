import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import { Box, Container } from "@mui/material";
import { SwapBotWidget } from "../../modules/swap-bot-widget";
import { Bot, BotList } from "../../modules/bot-list";

function App() {
  const { account, library } = useWeb3React();
  const bots: Bot[] = [];

  const isConnected = typeof account === "string" && !!library;

  return (
    <Box>
      <Head>
        <title>UniBot - App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl">
        {isConnected && !bots.length && (
          <SwapBotWidget />
        )}
        {isConnected && !!bots.length && (
          <BotList bots={bots} />
        )}
      </Container>
    </Box>
  );
}

export default App;
