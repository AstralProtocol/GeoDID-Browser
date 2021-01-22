import React from 'react';
import { connect } from 'react-redux';
import TabPanel from 'components/LayoutComponents/TabPanel';
import routes from 'utils/routes';

const AppLayout = (props) => {
  const { children, pathname } = props;

  return (
    <div>
      <TabPanel value={pathname !== '/' ? pathname : false} routes={routes} />
      {children}
    </div>
  );
};

const mapStateToProps = (state) => ({
  pathname: state.router.location.pathname,
});

export default connect(mapStateToProps, null)(AppLayout);
