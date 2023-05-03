import { Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import Account from "./Account";
import { useWeb3React } from "@web3-react/core";

const pages = ['Products', 'Pricing', 'Blog'];

export function Navbar () {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const { account } =
    useWeb3React();
  const isConnected = typeof account === "string";

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const logo = <Image
    alt="UniBot"
    src={'/icon.png'}
    width={48}
    height={48}
  />;

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between'}}>
          <Box sx={{ display: { md: 'flex', xs: 'none' }, mr: 1 }}>
            {logo}
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {isConnected &&
          <Box sx={{ flexGrow: 1, justifyContent: 'center', display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            {logo}
          </Box>}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Account />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}