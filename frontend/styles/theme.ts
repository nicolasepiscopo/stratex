import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff2a7a',
    },
    secondary: {
      main: '#3f51b5',
    },
    background: {
      paper: 'rgb(13, 17, 28)',
      default: 'rgba(255, 255, 255, 0.0)',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'transparent',
          boxShadow: 'none',
        }
      }
    }
  }
});