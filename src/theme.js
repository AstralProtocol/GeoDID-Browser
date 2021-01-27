import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  typography: {
    fontFamily: ['VT323', 'monospace'].join(','),
    htmlFontSize: 12,
  },
  palette: {
    primary: {
      main: '#ffa300', // $astral-yellow
      white: '#fffff',
      grey: '#333333', // $astral-grey
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
