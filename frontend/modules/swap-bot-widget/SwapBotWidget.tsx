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
import { ethers } from "ethers";
import { useCreateBot } from "./SwapBotWidget.helpers";

interface SwapBotWidgetProps {
  onCancel?: () => void;
}

export function SwapBotWidget ({ onCancel }: SwapBotWidgetProps) {
  const tokens = useTokenList();
  const wethToken = tokens.find(token => token.symbol === 'WETH'); 
  const { account } = useWeb3React<Web3Provider>();
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
  const createBot = useCreateBot();

  const selectedTokenImg = selectedToken?.logoURI;
  const selectedTargetTokenImg = selectedTargetToken?.logoURI;
  const amount = selectedTokenPrice ? Number(amountToSwap) * selectedTokenPrice : 0;
  const balance = balanceData ? ethers.utils.formatEther(balanceData).toString() : 0;
  const targetCoinsQty = (Number(amount)/selectedTargetTokenPrice).toFixed(6);
  const insufficientBalance = balanceData && ethers.utils.parseEther(`0${amountToSwap}`).gt(balanceData);
  const isSubmitEnabled = !!selectedTargetToken && !isEmptyOrZero(amountToSwap) && !!lowerRange && !!upperRange && !insufficientBalance;

  const isLoading = !selectedToken;

  useEffect(() => {
    if (wethToken && !selectedToken) {
      setSelectedToken(wethToken);
    }
  }, [selectedToken, wethToken])

  useEffect(() => {
    setLowerRange(
      selectedTargetTokenPrice ? (selectedTargetTokenPrice / 1.10).toFixed(4) : ''
    );
    setUpperRange(
      selectedTargetTokenPrice ? (selectedTargetTokenPrice * 1.10).toFixed(4) : ''
    );
  }, [selectedTargetTokenPrice]);

  if (isLoading) return null;

  const handleOnSubmit = async () => {
    try {
      await createBot({
        amount: ethers.utils.parseEther(amountToSwap),
        grids: Number(grids),
        lowerRange: lowerRange ? Number(lowerRange) : 0,
        upperRange: upperRange ? Number(upperRange) : 0,
      });
      console.log('success');
    } catch (error) {
      console.log(error);
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
          />
          <Stack direction="row" justifyContent="space-between">
            {selectedTokenPriceLoading ? 
              <Skeleton variant="text" sx={{ fontSize: '1rem', width: '5rem' }} />
            : <Typography variant="caption">{!!amount && `$${amount}`}</Typography>}
            <Typography variant="caption" sx={{ cursor: 'pointer' }} role="button" onClick={() => setAmountToSwap(balance.toString())}>Balance: {!balanceData.isZero() ? '~' : ''}{`${balance}`.slice(0, 6)} {selectedToken.symbol}</Typography>
          </Stack>
          {selectedTargetToken && 
            <Stack spacing={1}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption">
                  Swapping Pair:
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
                  {!!selectedTargetTokenPrice && ` ~$${selectedTargetTokenPrice.toFixed(4)}`}
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
              Select Target Token for Swap
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
              <TextField fullWidth variant="outlined" label="Lower Range" value={lowerRange} onChange={(e) => setLowerRange(e.target.value)} />
              <TextField fullWidth variant="outlined" label="Upper Range" value={upperRange} onChange={(e) => setUpperRange(e.target.value)} />
            </Stack>
          </>}
          {selectedTargetToken && <Button size="large" variant="outlined" color="primary" disabled={!isSubmitEnabled} onClick={handleOnSubmit}>
            {isEmptyOrZero(amountToSwap) && 'Enter Amount'}
            {!isEmptyOrZero(amountToSwap) && !selectedTargetToken && 'Select Target Token'}
            {!isEmptyOrZero(amountToSwap) && selectedTargetToken && (!lowerRange || !upperRange) && 'Enter Range'}
            {insufficientBalance && 'Insufficient Balance'}
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
      </Card>
    </Box>
  );
}