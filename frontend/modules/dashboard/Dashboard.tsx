import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import { BotList } from "../bot-list";
import { EventList } from "../event-list";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Head from "next/head";
import { SwapBotWidget } from "../swap-bot-widget";
import { useBotList } from "../bot-list/BotList.helpers";
import { useEvents } from "../event-list/EventList.helpers";
import CircularProgress from "@mui/material/CircularProgress";
import { useMediaQuery } from "@mui/material";
import { theme } from "../../styles/theme";

export default function Dashboard () {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const { account, library } = useWeb3React();
  const [isOpenSwapBotWidget, setIsOpenSwapBotWidget] = useState(false);
  const { bots, isLoading } = useBotList();
  const { events, refetch } = useEvents();

  const isConnected = typeof account === "string" && !!library;
  const shouldShowSwapBotWidget = isConnected && (!bots.length || isOpenSwapBotWidget);
  
  return (
    <Box>
      <Head>
        <title>StratEx - App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl">
        {isLoading && (
          <Stack justifyContent="center" alignItems="center" sx={{ position: 'absolute', top: 0, left: 0, bottom: '70vh', right: 0 }}>
            <CircularProgress color="secondary" />
          </Stack>
        )}
        {!isLoading && (
          <>
            {shouldShowSwapBotWidget && (
              <SwapBotWidget onCancel={bots.length ? () => setIsOpenSwapBotWidget(false) : undefined} />
            )}
            {!shouldShowSwapBotWidget && !isSmallScreen && (
              <Stack direction="row" spacing={2} mt={3}>
                <BotList bots={bots} onCreateBot={() => setIsOpenSwapBotWidget(true)}/>
                <EventList events={events} refetch={refetch} />
              </Stack>
            )}
            {!shouldShowSwapBotWidget && isSmallScreen && (
              <Stack direction="column" spacing={2} mt={3}>
                <BotList bots={bots} onCreateBot={() => setIsOpenSwapBotWidget(true)}/>
                <EventList events={events} refetch={refetch} />
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}