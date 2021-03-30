import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { useWallet } from 'core/hooks/web3';
import { useSnackbar } from 'notistack';
import AstralButton from 'components/AstralButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { ethers } from 'ethers';
import Authorize from 'components/LayoutComponents/Authorize';

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
  const { tx, contracts, adminRole, creatorRole, filecoinAllowed, astralSpace } = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const [showToken, setShowToken] = useState(false);
  const classes = useStyles();

  const [tokenId, setTokenId] = useState(null);
  const handleAddMinterRole = async () => {
    await tx(contracts.SpatialAssets.registerRole(), enqueueSnackbar);
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await astralSpace.private.get('tokenId');

      setTokenId(token);
    };

    loadToken();
  }, [astralSpace]);

  const handleEnableFilecoin = async () => {
    await tx(
      contracts.SpatialAssets.enableStorage(ethers.utils.formatBytes32String('FILECOIN')),
      enqueueSnackbar,
    );
  };

  let rolesArea;

  if (adminRole && (creatorRole || !creatorRole)) {
    rolesArea = (
      <List>
        <ListItem key="adminRole" role={undefined} dense>
          <ListItemText id="adminRole" primary="GeoDID Admin Role" secondary="Enabled ✅" />
        </ListItem>
        <ListItem key="creatorRole" role={undefined} dense>
          <ListItemText id="creatorRole" primary="GeoDID Creator Role" secondary="Enabled ✅" />
        </ListItem>
      </List>
    );
  } else if (!adminRole && creatorRole) {
    rolesArea = (
      <List>
        <ListItem key="creatorRole" role={undefined} dense>
          <ListItemText id="creatorRole" primary="GeoDID Creator Role" secondary="Enabled ✅" />
        </ListItem>
      </List>
    );
  } else if (!adminRole && !creatorRole) {
    rolesArea = (
      <AstralButton
        key="enableMinter"
        click={() => handleAddMinterRole()}
        title="Enable GeoDID creation"
      />
    );
  }

  let storageArea;

  if (filecoinAllowed) {
    storageArea = (
      <List>
        <ListItem key="filecoinEnabled" role={undefined} dense>
          <ListItemText id="filecoinEnabled" primary="Filecoin Storage" secondary="Enabled ✅" />
        </ListItem>
      </List>
    );
  } else {
    storageArea = (
      <List>
        <ListItem
          key="enableStorage"
          role={undefined}
          dense
          button
          onClick={() => handleEnableFilecoin()}
        >
          <ListItemText id="enableStorage" primary="Filecoin Storage" secondary="Click to enable" />
        </ListItem>
      </List>
    );
  }

  let tokenIdArea;

  if (tokenId) {
    tokenIdArea = (
      <List>
        <ListItem key="tokenArea" role={undefined} dense button>
          <TextField
            name="token"
            label="Your token securely saved on 3box. Click to view."
            type={showToken ? 'text' : 'password'}
            value={tokenId}
            style={{ minWidth: '400px' }}
          />
          <IconButton onClick={() => setShowToken(!showToken)}>
            {showToken ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </ListItem>
      </List>
    );
  } else {
    tokenIdArea = (
      <List>
        <ListItem key="tokenArea" role={undefined} dense button>
          <TextField
            name="token"
            label="Error loading token"
            type="text"
            style={{ minWidth: '400px' }}
          />
        </ListItem>
      </List>
    );
  }
  return (
    <Authorize redirect>
      <Card classes={{ root: classes.container }} variant="outlined" style={{ height: '96vh' }}>
        <CardContent>
          <Typography variant="h3" component="h1" gutterBottom>
            Your account
          </Typography>
          {rolesArea}
          {storageArea}
          {tokenIdArea}
        </CardContent>
      </Card>
    </Authorize>
  );
};

export default AccountArea;
