import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 300,
    width: '100%',
  },
  buttonArea: {
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.sider.default,
    height: 150,
    '&:hover, &$focusVisible': {
      backgroundColor: theme.palette.primary.main,
    },
    borderRadius: '15px',
  },
}));

export default function AreaButton(props) {
  const classes = useStyles();
  const { text } = props;
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
        <div className={classes.button}>{text}</div>
      </ButtonBase>
    </div>
  );
}
