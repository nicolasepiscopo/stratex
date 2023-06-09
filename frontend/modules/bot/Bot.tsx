import { EventList } from "../event-list";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Card from '@mui/material/Card';
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Head from "next/head";
import { useBot, useDeleteBot, useDeposit, usePauseBot, useResumeBot, useWithdraw } from "../bot-list/BotList.helpers";
import { useEvents } from "../event-list/EventList.helpers";
import CircularProgress from "@mui/material/CircularProgress";
import { useMediaQuery } from "@mui/material";
import ButtonGroup from "@mui/material/ButtonGroup";
import { theme } from "../../styles/theme";
import { useRouter } from "next/router";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Delete from "@mui/icons-material/Delete";
import MonetizationOn from "@mui/icons-material/MonetizationOn";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Wallet from "@mui/icons-material/Wallet";
import { useBotStats, useDepositsAmount, useInitialAmount } from "./Bot.helpers";
import { useMemo } from "react";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { BasicTabs } from "../../components/BasicTabs";

export default function Bot () {
  const router = useRouter();
  const { botId } = router.query;
  const { bot, isLoading } = useBot(botId as string);
  const { deleteBot, isLoading: isDeleting } = useDeleteBot();
  const { pause, isLoading: isPausing } = usePauseBot();
  const { resume, isLoading: isResuming } = useResumeBot();
  const { deposit, isLoading: isDepositing } = useDeposit(botId as string);
  const { withdraw, isLoading: isWithdrawing } = useWithdraw(botId as string);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const { events, refetch } = useEvents();
  const botEvents = events?.filter((event) => event.botId === botId) ?? [];
  const isRunning = bot?.status === 'running';
  const isDisabled = isResuming || isPausing || isDeleting || isDepositing || isWithdrawing;
  const {
    profit,
    profitPercentage,
    shouldShowProfit,
    totalAmount,
    totalInvested,
  } = useBotStats(bot);
  const graphicSymbol = bot?.tokenPair.symbol.at(0) === 'W' ? bot?.tokenPair.symbol.slice(1) : bot?.tokenPair.symbol;
  const MemoizedChart = useMemo(() => (
    <AdvancedRealTimeChart 
      theme="dark" 
      width="100%"
      height="500" 
      symbol={`BITSTAMP:${graphicSymbol}USD`} 
      hide_top_toolbar
      hide_legend
      hide_side_toolbar
      allow_symbol_change={false}
      show_popup_button={false}
      range="1D"
    />
  ), [graphicSymbol]);
  
  return (
    <Box>
      <Head>
        <title>StratEx - Bot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl">
        {(isLoading || isDeleting) && (
          <Stack justifyContent="center" alignItems="center" sx={{ position: 'absolute', top: 0, left: 0, bottom: '70vh', right: 0 }}>
            <CircularProgress color="secondary" />
          </Stack>
        )}
        {!isLoading && bot && (
          <Box pt={4}>
            <Stack direction="row" justifyContent="space-between" sx={{ position: 'relative' }}>
              <Button onClick={() => router.back()} startIcon={<ArrowBack />} color="inherit">
                My Bots
              </Button>
            </Stack>
            <Stack direction={!isSmallScreen ? "row" : "column"} spacing={2} mt={3}>
              <Box sx={{ minWidth: 400 }}>
                <Card sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2} pb={2} justifyContent="space-between" alignContent="center" alignItems="center"> 
                      <Stack direction="row" spacing={1} justifyContent="space-between" alignContent="center" alignItems="center">
                        <Avatar 
                          src={bot.token.logoURI}
                          alt={bot.token.symbol}
                        />
                        <ArrowForward />
                        <Avatar 
                          src={bot.tokenPair.logoURI}
                          alt={bot.tokenPair.symbol}
                        />
                      </Stack>
                      <Chip 
                        color={isRunning ? 'success' : 'warning'}
                        variant="filled"
                        label={isRunning ? 'RUNNING' : 'PAUSED'}
                      />
                    </Stack>
                    <List aria-label="bot details">
                      <ListItem>
                        <ListItemText primary={`${bot.token.symbol} Amount`} secondary={bot.amount.toFixed(4)} />
                        {bot.amount > 0 && bot.amountPair === 0 && (
                          <Button color="success" startIcon={<Wallet />} onClick={() => {
                            withdraw({ amount: bot.amount, token: bot.token });
                          }} disabled={isDisabled}>
                            Withdraw
                          </Button>
                        )}
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`${bot.tokenPair.symbol} Amount`} secondary={bot.amountPair.toFixed(4)} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`Total Invested`} secondary={`${totalInvested.toFixed(4)} ${bot.token.symbol}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`Total Balance`} secondary={`${totalAmount.toFixed(4)} ${bot.token.symbol}`} />
                      </ListItem>
                      {shouldShowProfit && <ListItem>
                        <ListItemText primary={`Profit So Far`} secondary={`${profit.toFixed(4)} ${bot.token.symbol}`} />
                        <Chip color={profit < 0 ? 'error' : 'success'} label={`${profit < 0 ? '' : '+'}${profitPercentage}%`} />
                      </ListItem>}
                      <ListItem>
                        <ListItemText primary="# Grids" secondary={bot.grids.toString()} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Lower Range" secondary={`$${bot.lowerRange.toString()}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Upper Range" secondary={`$${bot.upperRange.toString()}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Last execution" secondary={bot.lastExecution} />
                      </ListItem>
                    </List>
                    <ButtonGroup fullWidth>
                      {isRunning && <Button onClick={() => pause(bot.id)} startIcon={<Pause />} disabled={isDisabled}>
                        Pause
                      </Button>}
                      {!isRunning && <Button onClick={() => resume(bot.id)} startIcon={<PlayArrow />} disabled={isDisabled}>
                        Resume
                      </Button>}
                      <Button color="success" onClick={() => deposit(bot.token)} disabled={isDisabled} startIcon={<MonetizationOn />}>
                        Deposit
                      </Button>
                      <Button color="error" onClick={() => deleteBot(bot.id)} disabled={isDisabled} startIcon={<Delete />}>
                        Delete
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Card>
              </Box>
              <BasicTabs 
                tabs={[
                  {
                    label: `Transactions ${botEvents.length ? `(${botEvents.length})` : ''}`,
                    content: <EventList title="Transaction Events" events={botEvents} refetch={refetch} pageSize={5} />
                  },
                  ...graphicSymbol && [{
                    label: `Live ${graphicSymbol} Price`,
                    content: MemoizedChart
                  }]
                ]}
              />
              
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}