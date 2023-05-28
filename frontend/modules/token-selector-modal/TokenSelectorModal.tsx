import type { Web3Provider } from "@ethersproject/providers";
import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Image from "next/image";
import { Virtuoso } from 'react-virtuoso'
import { Token, useTokenList } from "./TokenSelectorModal.helpers";
import Clear from "@mui/icons-material/Clear";
import Search from "@mui/icons-material/Search";
import { useMemo, useState } from "react";
import { useThrottle } from "../../hooks/useThrottle";
import { useWeb3React } from "@web3-react/core";

interface TokenSelectorModalProps {
  onClose: (token: Token) => void;
  open: boolean;
  selectedValue: Token | undefined;
}

const POPULAR_TOKENS = [
  'ETH',
  'USDT',
  'USDC',
  'DAI',
  'WBTC',
  'WETH',
]

export function TokenSelectorModal ({ onClose, selectedValue, open }: TokenSelectorModalProps) {
  const [search, setSearch] = useState('');
  const { chainId } = useWeb3React<Web3Provider>();
  const filterKey = useThrottle(search, 200);
  const tokens = useTokenList(chainId);
  const filteredTokens = useMemo(() => tokens.filter(token => token.symbol !== selectedValue?.symbol && token.chainId === chainId && (token.symbol.toLowerCase().includes(filterKey.toLowerCase()) || token.name.toLowerCase().includes(filterKey.toLowerCase()))), [tokens, selectedValue?.symbol, chainId, filterKey]);
  const popularTokens = useMemo(() => tokens.filter(token => token.symbol !== selectedValue?.symbol && POPULAR_TOKENS.includes(token.symbol) && token.chainId === chainId), [tokens, selectedValue?.symbol, chainId]);

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: Token) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="xs">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          Select a Token
          <TextField 
            size="small"
            variant="standard"
            placeholder="Search for a token"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search />
              ),
              endAdornment: (
                <ButtonBase onClick={() => setSearch('')} sx={{
                  visibility: search ? 'visible' : 'hidden',
                }}>
                  <Clear />
                </ButtonBase>
              )
            }}
          />
        </Stack>
      </DialogTitle>
      <Stack direction="row" p={2} flexWrap="wrap" sx={{ gap: 1 }}>
        {selectedValue && <Chip 
          color="primary"
          label={selectedValue.symbol} 
          avatar={
            <Avatar 
              alt={selectedValue.symbol}
              src={selectedValue.logoURI} 
            />
          }
          variant="outlined" 
          onClick={() => handleListItemClick(selectedValue)} 
        />}
        {popularTokens.map(token => (
          <Chip
            key={token.symbol}
            label={token.symbol}
            avatar={
              <Avatar
                alt={token.symbol}
                src={token.logoURI}
              />
            }
            variant="outlined"
            onClick={() => handleListItemClick(token)}
          />
        ))}
      </Stack>
      <List sx={{ pt: 0 }}>
        <Virtuoso 
          seamless
          data={filteredTokens}
          keyParams="symbol"
          style={{
            height: '300px',
          }}
          itemContent={(_, token) => (
            <ListItem disableGutters key={token.symbol}>
              <ListItemButton onClick={() => handleListItemClick(token)}>
                <ListItemAvatar>
                  <Avatar>
                    <Image 
                      alt={token.symbol}
                      src={token.logoURI}
                      width={24}
                      height={24}
                    />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={token.name} secondary={token.symbol} />
              </ListItemButton>
            </ListItem>
          )}
        />
      </List>
    </Dialog>
  )
}