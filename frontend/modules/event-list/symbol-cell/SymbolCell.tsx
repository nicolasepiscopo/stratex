import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useBotTokenIn } from "./SymbolCell.helpers";

interface SymbolCellProps {
  botId: string;
}

export function SymbolCell ({ botId }: SymbolCellProps) {
  const { tokenIn, isLoading } = useBotTokenIn(botId);

  if (isLoading) return null;

  if (!tokenIn) {
    return (
      <Typography variant="caption" color="gray">
        Deleted Bot
      </Typography>
    )
  }

  return (
    <Box
      aria-label={tokenIn.symbol}
      sx={{
        margin: 'auto',
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundImage: `url(${tokenIn.logoURI})`,
        backgroundSize: 'cover',
      }}
    />
  );
}