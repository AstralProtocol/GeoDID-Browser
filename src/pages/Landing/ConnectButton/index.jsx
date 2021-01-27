import React from 'react';
import { connect } from 'react-redux';
import { changeAuthorization } from 'core/redux/login/actions';
import { makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 300,
    width: '100%',
  },
  buttonArea: {
    color: theme.palette.primary.grey,
    backgroundColor: theme.palette.primary.white,
    height: 150,
    '&:hover, &$focusVisible': {
      backgroundColor: theme.palette.primary.main,
    },
    borderRadius: '15px',
  },
}));

function ConnectButton(props) {
  const classes = useStyles();
  const { dispatchChangeAuthorization } = props;

  return (
    <div className={classes.root}>
      <ButtonBase
        focusRipple
        className={classes.buttonArea}
        focusVisibleClassName={classes.focusVisible}
        style={{
          width: '30%',
        }}
        onClick={() => dispatchChangeAuthorization()}
      >
        <div className={classes.button}>Connect to your wallet</div>
      </ButtonBase>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  dispatchChangeAuthorization: () => dispatch(changeAuthorization()),
});

export default connect(null, mapDispatchToProps)(ConnectButton);
