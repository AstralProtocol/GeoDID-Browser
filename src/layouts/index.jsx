import React from 'react';
import AppLayout from './AppLayout';

export default function MainLayout(props) {
  const { children } = props;

  return <AppLayout>{children}</AppLayout>;
}
