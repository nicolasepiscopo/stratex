import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import { Bot } from "../bot-list";
import { Event } from "../event-list";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Head from "next/head";
import { SwapBotWidget } from "../swap-bot-widget";

export default function Dashboard () {
  const { account, library } = useWeb3React();
  const [isOpenSwapBotWidget, setIsOpenSwapBotWidget] = useState(false);
  const bots: Bot[] = [
    // {
    //   id: '1',
    //   amount: 10,
    //   createdAt: new Date().toISOString(),
    //   lowerRange: 90,
    //   upperRange: 100,
    //   grids: 4,
    //   token: {
    //     address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    //     chainId: 1,
    //     decimals: 18,
    //     logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    //     name: "Wrapped Ether",
    //     symbol: "WETH",
    //   },
    //   tokenPair: {
    //     address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    //     chainId: 1,
    //     decimals: 8,
    //     logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
    //     name: "Wrapped BTC",
    //     symbol: "WBTC",
    //   },
    // },
  ];
  const events: Event[] = [
    {
      id: '1',
      date: new Date().toLocaleString(),
      orderType: 'sell',
      quantity: 10,
      symbol: 'WETH',
      symbolImage: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
      tradePrice: 1816.53,
    },
    {
      id: '2',
      date: new Date().toLocaleString(),
      orderType: 'buy',
      quantity: 0.67670,
      symbol: 'WBTC',
      symbolImage: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
      tradePrice: 26843.80,
    },
    {
      id: '3',
      date: new Date().toLocaleString(),
      orderType: 'buy',
      quantity: 11,
      symbol: 'WETH',
      symbolImage: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
      tradePrice: 1760.00,
    },
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
        {/* {shouldShowSwapBotWidget && ( */}
          <SwapBotWidget onCancel={bots.length ? () => setIsOpenSwapBotWidget(false) : undefined} />
        {/* )} */}
        {/* {!shouldShowSwapBotWidget && (
          <Stack direction="row" spacing={2} mt={3}>
            <BotList bots={bots} onCreateBot={() => setIsOpenSwapBotWidget(true)}/>
            <EventList events={events} />
          </Stack>
        )} */}
      </Container>
    </Box>
  );
}