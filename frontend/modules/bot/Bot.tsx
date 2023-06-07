import { EventList } from "../event-list";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Card from '@mui/material/Card';
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Head from "next/head";
import { useBot, useDeleteBot, useDeposit, usePauseBot, useResumeBot, useWithdraw } from "../bot-list/BotList.helpers";
import { useEvents } from "../event-list/EventList.helpers";
import CircularProgress from "@mui/material/CircularProgress";
import { ButtonGroup, Chip, List, ListItem, ListItemText, useMediaQuery } from "@mui/material";
import { theme } from "../../styles/theme";
import { useRouter } from "next/router";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { ArrowForward, Delete, MonetizationOn, Pause, PlayArrow, Wallet } from "@mui/icons-material";
import { formatEther, parseEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";

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
        {!isLoading && (
          <Box pt={4}>
            <Button onClick={() => router.back()} startIcon={<ArrowBack />} color="inherit">
              My Bots
            </Button>
            <Stack direction={!isSmallScreen ? "row" : "column"} spacing={2} mt={3}>
              <Card sx={{ p: 2, minWidth: 400 }}>
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
                      <ListItemText primary={`${bot.token.symbol} Amount`} secondary={bot.amount.toString()} />
                      {bot.amount > 0 && (
                        <Button color="success" startIcon={<Wallet />} onClick={() => {
                          withdraw({ amount: bot.amount, token: bot.token });
                        }}>
                          Withdraw
                        </Button>
                      )}
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`${bot.tokenPair.symbol} Amount`} secondary={bot.amountPair.toString()} />
                      {bot.amountPair > 0 && (
                        <Button color="success" startIcon={<Wallet />} onClick={() => {
                          withdraw({ amount: bot.amountPair, token: bot.tokenPair });
                        }}>
                          Withdraw
                        </Button>
                      )}
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="# Grids" secondary={bot.grids.toString()} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Lower Range" secondary={bot.lowerRange.toString()} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Upper Range" secondary={bot.upperRange.toString()} />
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
              <EventList events={botEvents} refetch={refetch} />
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}