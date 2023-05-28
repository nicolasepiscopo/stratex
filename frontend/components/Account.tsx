import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import useENSName from "../hooks/useENSName";
import { shortenHex } from "../util";
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import useEagerConnect from "../hooks/useEagerConnect";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ConnectButton } from "./ConnectButton";

const Account = () => {
  const triedToEagerConnect = useEagerConnect();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { error, account, deactivate } =
    useWeb3React();

  const ENSName = useENSName(account);

  if (error) {
    return null;
  }

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof account !== "string") {
    return (
      <>
        <Box sx={{ display: { md: 'flex', xs: 'none' } }}>
          <ConnectButton />
        </Box>
        <Box sx={{ display: { md: 'none', xs: 'flex' } }}>
          <ConnectButton title="Connect" />
        </Box>
      </>
    );
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <Tooltip title="Open settings">
        <>
          <Button size="small" color="inherit" startIcon={<Jazzicon diameter={32} seed={jsNumberForAddress(account)} />} onClick={handleOpenUserMenu} sx={{ display: { md: 'flex', xs: 'none' } }}>
            {ENSName || `${shortenHex(account, 4)}`}
          </Button>
          <IconButton size="small" color="inherit" onClick={handleOpenUserMenu} sx={{ display: { md: 'none', xs: 'flex' } }}>
            <Jazzicon diameter={32} seed={jsNumberForAddress(account)} />
          </IconButton>
        </>
      </Tooltip>
      {/* href: formatEtherscanLink("Account", [chainId, account]), */}
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem onClick={deactivate}>
          <Typography textAlign="center">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Account;
