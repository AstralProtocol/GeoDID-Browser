import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useWallet } from 'core/hooks/web3';

const Authorize = (props) => {
  const { address } = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const { children, redirect = false, to = '/' } = props;
  const authorized = !!address;

  const AuthorizedChildren = () => {
    // if user not equal needed role and if component is a page - make redirect to needed route
    if (!authorized && redirect) {
      enqueueSnackbar(`You have to login to access this page!`, {
        variant: 'warning',
      });

      return <Redirect to={to} />;
    }
    // if user not authorized return null to component
    if (!authorized) {
      return null;
    }
    // if access is successful render children
    return <div>{children}</div>;
  };
  return AuthorizedChildren();
};

export default Authorize;
