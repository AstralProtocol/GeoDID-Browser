import React from 'react';
import Container from '@material-ui/core/Container';
import AppBar from 'components/LayoutComponents/AppBar';
// import MenuSide from 'components/LayoutComponents/Menu/MenuSide';

const AppLayout = (props) => {
  const { children } = props;

  return (
    <div>
      <AppBar />
      <Container maxWidth="sm">{children}</Container>
    </div>
  );
};

export default AppLayout;
