import * as React from 'react';
import ReactDOM from 'react-dom';
import { setConfig } from 'react-hot-loader';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import Grow from '@material-ui/core/Grow';
import { SnackbarProvider } from 'notistack';
import App from './App';
import theme from './theme';

setConfig({
  ignoreSFC: true,
  pureRender: true,
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      TransitionComponent={Grow}
    >
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </SnackbarProvider>
  </ThemeProvider>,
  document.querySelector('#root'),
);
