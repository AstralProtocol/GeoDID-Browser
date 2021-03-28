import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography } from '@material-ui/core';
import { useWallet } from 'core/hooks/web3';
import { useSnackbar } from 'notistack';
import AstralButton from 'components/AstralButton';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    paddingTop: '10px',

    paddingBottom: '10px',
    width: '100%',
  },
  container: {
    paddingTop: '10px',
    paddingLeft: '10px',
    width: '100%',
  },

  tables: {
    width: '100%',
  },
  createButton: {
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

const AccountArea = () => {
  const { tokenId, tx, contracts, adminRole, creatorRole } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();

  const handleAddMinterRole = async () => {
    await tx(contracts.SpatialAssets.registerRole(), enqueueSnackbar);
  };

  let rolesArea;

  if (adminRole) {
    rolesArea = (
      <>
        <Typography variant="h6" gutterBottom>
          GeoDID Admin Role Enabled
        </Typography>
        <Typography variant="h6" gutterBottom>
          GeoDID Creator Role Enabled
        </Typography>
      </>
    );
  } else if (!adminRole && creatorRole) {
    rolesArea = (
      <Typography variant="h6" gutterBottom>
        GeoDID Creator Role Enabled
      </Typography>
    );
  } else if (!adminRole && !creatorRole) {
    rolesArea = (
      <AstralButton
        key="view"
        click={() => handleAddMinterRole()}
        title="Enable ability to create GeoDIDs"
      />
    );
  }
  return (
    <Card classes={{ root: classes.container }} variant="outlined" style={{ height: '96vh' }}>
      <CardContent>
        <Typography variant="h3" component="h1" gutterBottom>
          Your account
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your token {tokenId}
        </Typography>
        {rolesArea}
      </CardContent>
    </Card>
  );
};

export default AccountArea;
