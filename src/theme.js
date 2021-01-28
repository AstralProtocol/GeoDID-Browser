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
      white: '#e5e5e5',
      grey: '#333333', // $astral-grey
      orange: '#f97b3d', // $astral-orange
    },
    secondary: {
      main: '#333333', // $astral-grey
    },
    error: {
      main: red.A400,
    },
    sider: {
      background: '#333333', // $astral-grey
      text: '#fff',
    },
    content: {
      background: '#e5e5e5', // $astral-white
    },
  },
});

export default theme;
