import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ButtonBase, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  interactionAreaContainer: {
    display: 'grid',
    gridTemplateColumns: `repeat( auto-fit, minmax(250px, 1fr) )`,
    textAlign: 'center',
    justifyItems: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  collection: {
    width: '100%',
    height: '100%',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
    color: theme.palette.primary.grey,
    '&:hover': {
      background: 'linear-gradient(45deg, #8FB8ED 30%, #62BFED 90%)',
      color: '#fff',
    },
  },
  item: {
    width: '100%',
    height: '100%',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
    color: theme.palette.primary.grey,
    '&:hover': {
      background: 'linear-gradient(45deg, #ffa300 30%, #f97b3d 90%)',
      color: '#fff',
    },
  },
}));

export default function Create() {
  const classes = useStyles();
  const history = useHistory();

  return (
    <>
      <div className={classes.interactionAreaContainer}>
        <ButtonBase
          className={classes.collection}
          onClick={() => history.push(`/create/collection`)}
        >
          <Typography variant="h4" gutterBottom>
            Create a GeoDID Collection
          </Typography>
        </ButtonBase>
        <ButtonBase className={classes.item} onClick={() => history.push(`/create/item`)}>
          <Typography variant="h4" gutterBottom>
            Create a GeoDID Item
          </Typography>
        </ButtonBase>
      </div>
    </>
  );
}
