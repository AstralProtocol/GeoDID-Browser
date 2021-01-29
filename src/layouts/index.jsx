import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { initWeb3, checkRoles } from 'core/redux/login/actions';
import { initializeContracts } from 'core/redux/contracts/actions';
// import { Contracts } from 'core/redux/contracts/reducers';
import AppLayout from './AppLayout';

function MainLayout(props) {
  const { children } = props;

  /*
  // Connect to provider and init web3
  useEffect(() => {
    if (authorized) {
      initWeb3Props();
    }
  }, [authorized, initWeb3Props]);

  // Initialize Contracts after web3 is connected
  useEffect(() => {
    if (web3) {
      initializeContractsProps(Contracts, web3);
    }
  }, [web3, initializeContractsProps]);

  // Check user roles after contracts are initialized
  useEffect(() => {
    if (contractsInitialized) {
      checkRolesProps();
    }
  }, [contractsInitialized, checkRolesProps]);
 */
  return <AppLayout>{children}</AppLayout>;
}

const mapStateToProps = (state) => ({
  web3: state.login.web3,
  authorized: state.login.authorized,
  contractsInitialized: state.contracts.contractsInitialized,
});

const mapDispatchToProps = (dispatch) => ({
  initWeb3Props: () => dispatch(initWeb3()),
  initializeContractsProps: (contracts, web3) => dispatch(initializeContracts(contracts, web3)),
  checkRolesProps: () => dispatch(checkRoles()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainLayout));
