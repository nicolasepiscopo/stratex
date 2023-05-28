import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#DD4980',
    },
    secondary: {
      main: '#FC6878',
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