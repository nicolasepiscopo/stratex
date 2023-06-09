import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import { Token } from "../token-selector-modal/TokenSelectorModal.helpers";
import Add from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Settings from "@mui/icons-material/Settings";
import { usePauseBot, useResumeBot } from "./BotList.helpers";
import { useRouter } from "next/router";

export interface Bot {
  id: string;
  lowerRange: number;
  upperRange: number;
  grids: number;
  lastExecution: string;
  amount: number;
  amountPair: number;
  token: Token;
  tokenPair: Token;
  status: 'running' | 'paused';
}

interface BotListProps {
  bots: Bot[];
  onCreateBot: () => void;
}

export function BotList ({ bots, onCreateBot }: BotListProps) {
  const router = useRouter();
  const { pause, isLoading: isPausing } = usePauseBot();
  const { resume, isLoading: isResuming } = useResumeBot();

  return (
    <Paper sx={{ minWidth: 400 }}>
      <Stack pt={1} px={2} direction="row" justifyContent="space-between" alignContent="center" alignItems="center">
        <Typography variant="overline">Active Bots</Typography>
        <Button size="small" onClick={onCreateBot} startIcon={<Add />}>
          New Bot
        </Button>
      </Stack>
      <List>
        {bots.map((bot) => {
          const primary = <>{bot.amount} {bot.token.symbol} ➟ {bot.tokenPair.symbol}</>;
          const secondary = `${bot.grids} Grids between $${bot.lowerRange} and $${bot.upperRange}`;
          const isRunning = bot.status === 'running';
          const isDisabled = isResuming || isPausing;

          return (
            <ListItem key={bot.id}>
              <ListItemAvatar>
                <Tooltip placement="top" title={isRunning ? `${bot.token.symbol} bot is running` : `${bot.token.symbol} Bot is paused`}>
                  <Badge color={isRunning ? 'success' : 'warning'} variant="dot">
                    <Avatar 
                      src={bot.token.logoURI}
                      alt={bot.token.symbol}
                    />
                  </Badge>
                </Tooltip>
              </ListItemAvatar>
              <ListItemText primary={primary} secondary={secondary} />
              {isRunning && (
                <Tooltip placement="top" title="Pause">
                  <IconButton color="warning" onClick={() => pause(bot.id)} disabled={isDisabled}>
                    <Pause fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {!isRunning && (
                <Tooltip placement="top" title="Resume">
                  <IconButton color="success" onClick={() => resume(bot.id)} disabled={isDisabled}>
                    <PlayArrow fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip placement="top" title="Settings">
                <IconButton disabled={isDisabled} onClick={() => router.push(`/app/${bot.id}`)}>
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}