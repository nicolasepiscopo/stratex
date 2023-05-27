import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import { Bot, BotList } from "../bot-list";
import { EventList } from "../event-list";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Head from "next/head";
import { SwapBotWidget } from "../swap-bot-widget";
import { useBotList } from "../bot-list/BotList.helpers";
import { useEvents } from "../event-list/EventList.helpers";

export default function Dashboard () {
  const { account, library } = useWeb3React();
  const [isOpenSwapBotWidget, setIsOpenSwapBotWidget] = useState(false);
  const bots = useBotList();
  const { events, refetch } = useEvents();

  const isConnected = typeof account === "string" && !!library;
  const shouldShowSwapBotWidget = isConnected && (!bots.length || isOpenSwapBotWidget);
  
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
            <EventList events={events} refetch={refetch} />
          </Stack>
        )}
      </Container>
    </Box>
  );
}