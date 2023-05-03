import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { Token } from "../token-selector-modal/TokenSelectorModal.helpers";

export interface Bot {
  id: string;
  lowerRange: number;
  upperRange: number;
  createdAt: string;
  amount: number;
  token: Token;
  tokenPair: Token;
}

interface BotListProps {
  bots: Bot[];
}

export function BotList ({ bots }: BotListProps) {
  return (
    <List>
      {bots.map((bot) => {
        const primary = `Amount invested: ${bot.amount} ${bot.token.symbol} - Swap to: ${bot.tokenPair.symbol}`;
        const secondary = `Play between ${bot.lowerRange} and ${bot.upperRange}`;

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
  );
}