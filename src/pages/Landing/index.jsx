import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import AstralButton from 'components/AstralButton';
import { connect } from 'react-redux';
import { changeAuthorization } from 'core/redux/login/actions';

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: '20vh',
    paddingBottom: '4em',
    textAlign: 'center',
  },
  interactionAreaContainer: {
    display: 'grid',
    gridTemplateColumns: `repeat( auto-fit, minmax(250px, 1fr) )`,
    gridGap: '1rem',
    textAlign: 'center',
    justifyItems: 'center',
    alignItems: 'center',
  },
  element1: {
    width: '60%',
    objectFit: 'cover',
  },
}));

function Landing(props) {
  const classes = useStyles();
  const { dispatchChangeAuthorization } = props;

  return (
    <>
      <div className={classes.header}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Enter the Astral Studio
          </Typography>
        </Container>
      </div>
      <div className={classes.interactionAreaContainer}>
        <div className={classes.element1}>
          <Typography variant="h3" component="h1" gutterBottom>
            Read a GeoDID
          </Typography>
          <TextField fullWidth id="filled-basic" label="GeoDid" variant="filled" />
        </div>
        <div className={classes.element2}>
          <Typography variant="h3" component="h1" gutterBottom>
            Log-in
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            Create / Edit / Delete
          </Typography>
          <AstralButton click={() => dispatchChangeAuthorization()} title="Connect your wallet" />
        </div>
      </div>
    </>
  );
}

const mapDispatchToProps = (dispatch) => ({
  dispatchChangeAuthorization: () => dispatch(changeAuthorization()),
});

export default connect(null, mapDispatchToProps)(Landing);
