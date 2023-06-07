import type { Web3Provider } from "@ethersproject/providers";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useWeb3React } from "@web3-react/core";
import useBalance from "../../hooks/useBalance";
import { useEffect, useState } from "react";
import { useTokenPrice } from "../../hooks/useTokenPrice";
import { TokenSelectorModal } from "../token-selector-modal";
import { Token, useTokenList } from "../token-selector-modal/TokenSelectorModal.helpers";
import { isEmptyOrZero } from "../../utils/is-empty";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useCreateBot } from "./SwapBotWidget.helpers";
import { formatEther, parseEther } from "@ethersproject/units";

interface SwapBotWidgetProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function SwapBotWidget ({ onCancel, onSuccess }: SwapBotWidgetProps) {
  const { account, chainId } = useWeb3React<Web3Provider>();
  const tokens = useTokenList(chainId);
  const defaultToken = tokens.find(token => token.symbol === 'WMATIC'); 
  const [selectedToken, setSelectedToken] = useState<Token>();
  const balanceData = useBalance(account, selectedToken?.address);
  const [selectedTokenModalOpen, setSelectedTokenModalOpen] = useState<boolean>(false);
  const [selectedTargetToken, setSelectedTargetToken] = useState<Token | undefined>(undefined);
  const [selectedTargetTokenModalOpen, setSelectedTargetTokenModalOpen] = useState<boolean>(false);
  const [amountToSwap, setAmountToSwap] = useState<string>('0');
  const [lowerRange, setLowerRange] = useState<string>();
  const [upperRange, setUpperRange] = useState<string>();
  const [grids, setGrids] = useState<string>('2');
  const [gridIsArithmetic, setGridIsArithmetic] = useState<boolean>(true);
  const {
    price: selectedTokenPrice,
    isLoading: selectedTokenPriceLoading,
  } = useTokenPrice(selectedToken);
  const {
    price: selectedTargetTokenPrice,
    isLoading: selectedTargetTokenPriceLoading,
  } = useTokenPrice(selectedTargetToken);
  const { createBot, isLoading: isCreatingBot } = useCreateBot({
    onSuccess,
  });

  const selectedTokenImg = selectedToken?.logoURI;
  const selectedTargetTokenImg = selectedTargetToken?.logoURI;
  const amount = selectedTokenPrice ? Number(amountToSwap) * selectedTokenPrice : 0;
  const balance = balanceData ? formatEther(balanceData).toString() : 0;
  const targetCoinsQty = (Number(amount)/selectedTargetTokenPrice).toFixed(6);
  const insufficientBalance = balanceData && parseEther(`0${amountToSwap}`).gt(balanceData);
  const isSameToken = selectedToken?.address === selectedTargetToken?.address;
  const isSubmitEnabled = !!selectedTargetToken && !isEmptyOrZero(amountToSwap) && !!lowerRange && !!upperRange && !insufficientBalance && !isSameToken && !isCreatingBot;

  const isLoading = !selectedToken;

  useEffect(() => {
    if (defaultToken && !selectedToken) {
      setSelectedToken(defaultToken);
    }
  }, [selectedToken, defaultToken])

  useEffect(() => {
    setLowerRange(
      selectedTargetTokenPrice ? (selectedTargetTokenPrice / 1.10).toFixed(0) : ''
    );
    setUpperRange(
      selectedTargetTokenPrice ? (selectedTargetTokenPrice * 1.10).toFixed(0) : ''
    );
  }, [selectedTargetTokenPrice]);

  if (isLoading) return null;

  const handleOnSubmit = () => {
    try {
      createBot({
        amount: parseEther(amountToSwap),
        grids: Number(grids),
        lowerRange: lowerRange ? Number(lowerRange) : 0,
        upperRange: upperRange ? Number(upperRange) : 0,
        tokenIn: selectedToken.address,
        tokenOut: selectedTargetToken?.address,
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <Box sx={{ maxWidth: 500, width: '100%', mx: 'auto', my: 4 }}>
      {onCancel && (
        <Button onClick={onCancel} startIcon={<ArrowBack />} color="inherit">
          Go Back
        </Button>
      )}
      <Card variant="outlined" sx={{ p: 4, mt: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h5" mb={2}>
            Create a Bot
          </Typography>
          <TextField value={amountToSwap} onChange={(e) => setAmountToSwap(e.target.value ?? '0')} variant="outlined" label="Amount to Invest" InputProps={{
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
          />
          <Stack direction="row" justifyContent="space-between">
            {selectedTokenPriceLoading ? 
              <Skeleton variant="text" sx={{ fontSize: '1rem', width: '5rem' }} />
            : <Typography variant="caption">{!!amount && `$${amount}`}</Typography>}
            {balanceData ? <Typography variant="caption" sx={{ cursor: 'pointer' }} role="button" onClick={() => setAmountToSwap(balance.toString())}>Balance: {!balanceData.isZero() ? '~' : ''}{`${balance}`.slice(0, 6)} {selectedToken.symbol}</Typography> : <Skeleton variant="text" sx={{ fontSize: '1rem', width: '5rem' }} />}
          </Stack>
          {selectedTargetToken && 
            <Stack spacing={1}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption">
                  Trading Pair:
                </Typography>
                <Button sx={{ justifyContent: 'flex-start' }} variant="outlined" color="primary" startIcon={
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
                  {selectedTargetToken.symbol} 
                  {!!selectedTargetTokenPrice && ` ~$${selectedTargetTokenPrice.toFixed(0)}`}
                </Button>
              </Stack>
              {/* {!!targetCoinsQty && selectedTargetTokenPrice && 
              <>
                <Divider />
                <Stack px={2} direction="row" spacing={2} justifyContent="center">
                  <Typography variant="body1" color="secondary">
                    {Number(amountToSwap).toFixed(6)} {selectedToken.symbol} = {targetCoinsQty} {selectedTargetToken.symbol}
                  </Typography>
                </Stack>
                <Divider />
              </>} */}
            </Stack>
          }
          {!selectedTargetToken && 
            <Button variant="outlined" color="primary" onClick={() => setSelectedTargetTokenModalOpen(true)}>
              Select Target Token for Trade
            </Button>
          }
          {selectedTargetToken && 
          <>
            <Stack direction="row" spacing={1}>
              <TextField type="number" fullWidth variant="outlined" label="Grids" value={grids} onChange={(e) => setGrids(e.target.value)} />
              <Select
                value={gridIsArithmetic ? "arithmetic" : "geometric"}
                onChange={(e) => setGridIsArithmetic(e.target.value === "arithmetic")}
              >
                <MenuItem value="arithmetic">
                  Arithmetic
                </MenuItem>
                <MenuItem value="geometric">
                  Geometric
                </MenuItem>
              </Select>
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField fullWidth variant="outlined" label="Lower Range" value={lowerRange} onChange={(e) => !e.target.value.includes('.') && setLowerRange(e.target.value)} />
              <TextField fullWidth variant="outlined" label="Upper Range" value={upperRange} onChange={(e) => !e.target.value.includes('.') && setUpperRange(e.target.value)} />
            </Stack>
          </>}
          {selectedTargetToken && <Button size="large" variant={isSubmitEnabled ? "contained" : "outlined"} color="primary" disabled={!isSubmitEnabled} onClick={handleOnSubmit}>
            {isEmptyOrZero(amountToSwap) && 'Enter Amount'}
            {!isEmptyOrZero(amountToSwap) && !selectedTargetToken && 'Select Target Token'}
            {!isEmptyOrZero(amountToSwap) && selectedTargetToken && (!lowerRange || !upperRange) && 'Enter Range'}
            {insufficientBalance && 'Insufficient Balance'}
            {isSameToken && 'Select Different Token'}
            {isSubmitEnabled && 'Create Bot Now'}
            {isCreatingBot && 'Creating Bot'}
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
      </Card>
    </Box>
  );
}