import Box from "@mui/material/Box";
import { useBotTokenIn } from "./SymbolCell.helpers";

interface SymbolCellProps {
  botId: string;
}

export function SymbolCell ({ botId }: SymbolCellProps) {
  const { tokenIn, isLoading } = useBotTokenIn(botId);

  if (!tokenIn || isLoading) return null;

  return (
    <Box
      aria-label={tokenIn.symbol}
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundImage: `url(${tokenIn.logoURI})`,
        backgroundSize: 'cover',
      }}
    />
  );
}