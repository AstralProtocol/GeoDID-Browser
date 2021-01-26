import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ffa300',
    },
    secondary: {
      main: '#e5e5e5',
    },
    error: {
      main: red.A400,
    },
    sider: {
      default: '#171819',
    },
    background: {
      default: '#e5e5e5',
    },
  },
});

export default theme;
