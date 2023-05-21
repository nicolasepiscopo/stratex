import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import { Box, Container, Stack } from "@mui/material";
import { SwapBotWidget } from "../../modules/swap-bot-widget";
import { Bot, BotList } from "../../modules/bot-list";
import { useState } from "react";
import { Event, EventList } from "../../modules/event-list";

function App() {
  const { account, library } = useWeb3React();
  const [isOpenSwapBotWidget, setIsOpenSwapBotWidget] = useState(false);
  const bots: Bot[] = [
    {
      id: '1',
      amount: 10,
      createdAt: new Date().toISOString(),
      lowerRange: 90,
      upperRange: 100,
      grids: 4,
      token: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        chainId: 1,
        decimals: 18,
        logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        name: "Wrapped Ether",
        symbol: "WETH",
      },
      tokenPair: {
        address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
        chainId: 1,
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
        name: "Polygon",
        symbol: "MATIC",
      },
    },
  ];
  const events: Event[] = [
    {
      amountInvested: 1,
      amountReceived: 2,
      date: new Date().toISOString(),
      tokenAddressFrom: '0x0',
      tokenAddressTo: '0x0',
      transactionFee: .0050,
      transactionHash: '0x0'
    }
  ];

  const isConnected = typeof account === "string" && !!library;
  const shouldShowSwapBotWidget = (isConnected && !bots.length) || isOpenSwapBotWidget;

  return (
    <Box>
      <Head>
        <title>UniBot - App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl">
        {shouldShowSwapBotWidget && (
          <SwapBotWidget onCancel={bots.length ? () => setIsOpenSwapBotWidget(false) : undefined} />
        )}
        {!shouldShowSwapBotWidget && (
          <Stack direction="row" spacing={2} mt={3}>
            <BotList bots={bots} onCreateBot={() => setIsOpenSwapBotWidget(true)}/>
            <EventList events={events} />
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default App;
