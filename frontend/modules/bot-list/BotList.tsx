import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Token } from "../token-selector-modal/TokenSelectorModal.helpers";
import { useBotList } from "./BotList.helpers";
import Add from "@mui/icons-material/Add";

export interface Bot {
  id: string;
  lowerRange: number;
  upperRange: number;
  grids: number;
  createdAt: string;
  amount: number;
  token: Token;
  tokenPair: Token;
}

interface BotListProps {
  bots: Bot[];
  onCreateBot: () => void;
}

export function BotList ({ bots, onCreateBot }: BotListProps) {
  useBotList();

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
          const primary = `${bot.amount} ${bot.token.symbol} to ${bot.tokenPair.symbol}`;
          const secondary = `${bot.grids} Grids between ${bot.lowerRange} and ${bot.upperRange}`;

          return (
            <ListItem key={bot.id}>
              <ListItemAvatar>
                <Avatar 
                  src={bot.token.logoURI}
                  alt={bot.token.symbol}
                />
              </ListItemAvatar>
              <ListItemText primary={primary} secondary={secondary} />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}