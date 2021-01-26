import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    minWidth: 300,
    width: '100%',
  },
  buttonArea: {
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.sider.default,
    position: 'relative',
    height: 300,
    '&:hover, &$focusVisible': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export default function ButtonBases() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ButtonBase
        focusRipple
        className={classes.buttonArea}
        focusVisibleClassName={classes.focusVisible}
        style={{
          width: '30%',
        }}
      >
        <div className={classes.button}>hi</div>
      </ButtonBase>
    </div>
  );
}
