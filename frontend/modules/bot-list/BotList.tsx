import { Avatar, Box, Button, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { Token } from "../token-selector-modal/TokenSelectorModal.helpers";

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
  return (
    <Paper sx={{ minWidth: 400 }}>
      <Stack pt={1} px={2} direction="row" justifyContent="space-between" alignContent="center" alignItems="center">
        <Typography variant="overline">Active Bots</Typography>
        <Button size="small" onClick={onCreateBot}>
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