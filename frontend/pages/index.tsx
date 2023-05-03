import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { SwapBotWidget } from "../modules/swap-bot-widget";
import { ConnectButton } from "../components/ConnectButton";
import { Bot, BotList } from "../modules/bot-list";

function Home() {
  const { account, library } = useWeb3React();
  const bots: Bot[] = [];

  const isConnected = typeof account === "string" && !!library;

  return (
    <Box>
      <Head>
        <title>UniBot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl">
        {isConnected && !bots.length && (
          <SwapBotWidget />
        )}
        {isConnected && !!bots.length && (
          <BotList bots={bots} />
        )}
        {!isConnected && (
          <Stack justifyContent="space-between" alignItems="center" sx={{ height: '80vh'}}>
            <Image 
              alt="UniBot"
              src="/logo.png"
              width={200}
              height={200}
            />
            <Box textAlign="center">
              <Typography variant="h1" color="primary" sx={{ fontFamily: `'Rajdhani', sans-serif` }}>
                UNIBOT
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontFamily: `'Rajdhani', sans-serif` }}>
                The first decentralized trading bot powered by <strong>AWS</strong>, <strong>Chainlink</strong> and <strong>UniSwap</strong> protocol.
              </Typography>
            </Box>
            <Box py={6}>
              <ConnectButton 
                title="start making money"
              />
            </Box>
            <Box sx={{
              width: '70%',
              margin: 'auto',
            }}>
              <Typography sx={{
                opacity: .5,
                color: 'white',
                lineHeight: '2',
              }}>
                Welcome to UniBot, the application that allows you to perform automated swaps with smart contracts using buy and sell limits on Uniswap. With UniBot, you can make the most of your trades and get the best results quickly and easily. Our intuitive and user-friendly interface allows you to set your own buy and sell limits to get the best possible price.
              </Typography>
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default Home;
