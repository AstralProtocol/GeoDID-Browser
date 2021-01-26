import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

import AuxMonoRegular from 'assets/fonts/AuxMono-Regular.woff2';

const auxMono = {
  fontFamily: 'AuxMono',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `
    local('AuxMono'),
    local('AuxMono-Regular'),
    url(${AuxMonoRegular}) format('woff2')
  `,
};

// A custom theme for this app
const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'AuxMono',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [auxMono],
      },
    },
  },
  palette: {
    primary: {
      main: '#ffa300', // $astral-yellow
    },
    secondary: {
      main: '#e5e5e5', // $astral-white
    },
    error: {
      main: red.A400,
    },
    sider: {
      default: '#333333', // $astral-grey
    },
    background: {
      default: '#e5e5e5', // $astral-white
    },
  },
});

export default theme;
