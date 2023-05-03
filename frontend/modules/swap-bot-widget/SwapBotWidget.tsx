import type { Web3Provider } from "@ethersproject/providers";
import { Box, Button, Divider, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import useBalance from "../../hooks/useBalance";
import { useEffect, useState } from "react";
import { useTokenPrice } from "../../hooks/useTokenPrice";
import { TokenSelectorModal } from "../token-selector-modal";
import { ETHEREUM_TOKEN, Token } from "../token-selector-modal/TokenSelectorModal.helpers";
import { isEmptyOrZero } from "../../utils/is-empty";

export function SwapBotWidget () {
  const { account } = useWeb3React<Web3Provider>();
  const [selectedToken, setSelectedToken] = useState<Token>(ETHEREUM_TOKEN);
  const { data: balanceData } = useBalance(account, selectedToken.address);
  const [selectedTokenModalOpen, setSelectedTokenModalOpen] = useState<boolean>(false);
  const [selectedTargetToken, setSelectedTargetToken] = useState<Token | undefined>(undefined);
  const [selectedTargetTokenModalOpen, setSelectedTargetTokenModalOpen] = useState<boolean>(false);
  const [amountToSwap, setAmountToSwap] = useState<string>('0');
  const [lowerRange, setLowerRange] = useState<string>();
  const [upperRange, setUpperRange] = useState<string>();
  const {
    price: selectedTokenPrice,
    isLoading: selectedTokenPriceLoading,
  } = useTokenPrice(selectedToken);
  const {
    price: selectedTargetTokenPrice,
    isLoading: selectedTargetTokenPriceLoading,
  } = useTokenPrice(selectedTargetToken);

  const selectedTokenImg = selectedToken.logoURI;
  const selectedTargetTokenImg = selectedTargetToken?.logoURI;
  const amount = (Number(amountToSwap) * selectedTokenPrice).toFixed(4);
  const balance = balanceData ? balanceData.toNumber()/10**18 : 0;
  const targetCoinsQty = (Number(amount)/selectedTargetTokenPrice).toFixed(6);
  const isSubmitEnabled = !!selectedTargetToken && !isEmptyOrZero(amountToSwap) && !!lowerRange && !!upperRange && Number(amountToSwap) <= balance;

  useEffect(() => {
    setLowerRange(
      selectedTargetTokenPrice ? (selectedTargetTokenPrice / 1.10).toFixed(4) : ''
    );
    setUpperRange(
      selectedTargetTokenPrice ? (selectedTargetTokenPrice * 1.10).toFixed(4) : ''
    );
  }, [selectedTargetTokenPrice])
  
  return (
    <Paper sx={{ my: 4, maxWidth: 500, width: '100%', mx: 'auto', p: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5">
          Create a UniBot
        </Typography>
        <TextField value={amountToSwap} onChange={(e) => setAmountToSwap(e.target.value ?? '0')} variant="outlined" label="Amount to Swap" InputProps={{
          endAdornment: (
            <Button color="inherit" startIcon={
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundImage: `url(${selectedTokenImg})`,
                  backgroundSize: 'cover',
                }}
              />
            } onClick={() => setSelectedTokenModalOpen(true)}>
              {selectedToken.symbol}
            </Button>
          )
        }} 
          helperText={(
            <Stack direction="row" justifyContent="space-between">
              {selectedTokenPriceLoading ? 
                <Skeleton variant="text" sx={{ fontSize: '1rem', width: '5rem' }} />
              : <Typography>{!!amount && `$${amount}`}</Typography>}
              <Typography sx={{ cursor: 'pointer' }} role="button" onClick={() => setAmountToSwap(balance.toString())}>Balance: {balance > 0 ? '~' : ''}{`${balance}`.slice(0, 6)} {selectedToken.symbol}</Typography>
            </Stack>
          )}
        />
        {selectedTargetToken && 
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption">
                Swapping Pair:
              </Typography>
              <Button sx={{ justifyContent: 'flex-start' }} variant="text" color="inherit" startIcon={
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundImage: `url(${selectedTargetTokenImg})`,
                    backgroundSize: 'cover',
                  }}
                />
              } onClick={() => setSelectedTargetTokenModalOpen(true)}
                endIcon={selectedTargetTokenPriceLoading && <Skeleton variant="text" sx={{ fontSize: '1rem', width: '5rem' }} />}
              >
                {selectedTargetToken.symbol} {!!selectedTargetTokenPrice && `~$${selectedTargetTokenPrice.toFixed(4)}`}
              </Button>
            </Stack>
            {!!targetCoinsQty && selectedTargetTokenPrice && 
            <>
              <Divider />
              <Stack px={2} direction="row" spacing={2} justifyContent="center">
                <Typography variant="body1" color="secondary">
                  {Number(amountToSwap).toFixed(6)} {selectedToken.symbol} = {targetCoinsQty} {selectedTargetToken.symbol}
                </Typography>
              </Stack>
              <Divider />
            </>}
          </Stack>
        }
        {!selectedTargetToken && 
          <Button variant="contained" color="primary" onClick={() => setSelectedTargetTokenModalOpen(true)}>
            Select Target Token for Swap
          </Button>
        }
        {selectedTargetToken && 
        <Stack direction="row" spacing={1}>
          <TextField fullWidth variant="outlined" label="Lower Range" value={lowerRange} onChange={(e) => setLowerRange(e.target.value)} />
          <TextField fullWidth variant="outlined" label="Upper Range" value={upperRange} onChange={(e) => setUpperRange(e.target.value)} />
        </Stack>}
        {selectedTargetToken && <Button size="large" variant="contained" color="primary" disabled={!isSubmitEnabled}>
          {isEmptyOrZero(amountToSwap) && 'Enter Amount'}
          {!isEmptyOrZero(amountToSwap) && !selectedTargetToken && 'Select Target Token'}
          {!isEmptyOrZero(amountToSwap) && selectedTargetToken && (!lowerRange || !upperRange) && 'Enter Range'}
          {isSubmitEnabled && 'Create UniBot Now'}
        </Button>}
      </Stack>
      <TokenSelectorModal 
        open={selectedTokenModalOpen} 
        onClose={(token) => {
          setSelectedTokenModalOpen(false);
          setSelectedToken(token);
        }}
        selectedValue={selectedToken}
      />
      <TokenSelectorModal 
        open={selectedTargetTokenModalOpen} 
        onClose={(token) => {
          setSelectedTargetTokenModalOpen(false);
          setSelectedTargetToken(token);
        }}
        selectedValue={selectedTargetToken}
      />
    </Paper>
  );
}