import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ConnectButton from './ConnectButton';
import ProTip from './ProTip';

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: '20vh',
    paddingBottom: '8em',
    textAlign: 'center',
  },
  interactionAreaContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    justifyItems: 'center',
    textAlign: 'center',
  },
}));

export default function App() {
  const classes = useStyles();
  return (
    <>
      <div className={classes.header}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom>
            Enter the Astral Studio
          </Typography>
          <ProTip />
        </Container>
      </div>
      <div className={classes.interactionAreaContainer}>
        <div>empty</div>
        <ConnectButton />
      </div>
    </>
  );
}
