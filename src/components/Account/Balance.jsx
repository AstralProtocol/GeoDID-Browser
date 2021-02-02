import React, { useState } from 'react';
import { formatEther } from '@ethersproject/units';
import { usePoller } from 'eth-hooks';
import Button from '@material-ui/core/Button';

/*

  <Balance
    address={selectedAddress}
    provider={props.provider}
    dollarMultiplier={props.price}
  />

*/

export default function Balance(props) {
  const [dollarMode, setDollarMode] = useState(true);
  const [balance, setBalance] = useState();

  const getBalance = async () => {
    if (props.address && props.provider) {
      try {
        const newBalance = await props.provider.getBalance(props.address);
        setBalance(newBalance);
      } catch (e) {
        console.log(e);
      }
    }
  };

  usePoller(
    () => {
      getBalance();
    },
    props.pollTime ? props.pollTime : 1999,
  );

  let floatBalance = parseFloat('0.00');

  let usingBalance = balance;

  if (typeof props.balance !== 'undefined') {
    usingBalance = props.balance;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toFixed(4);

  if (props.dollarMultiplier && dollarMode) {
    displayBalance = '$' + (floatBalance * props.dollarMultiplier).toFixed(2);
  }

  return (
    <Button
      style={{
        verticalAlign: 'middle',
        fontSize: props.size ? props.size : 24,
        padding: 8,
        borderRadius: '25px',
        cursor: 'pointer',
        color: '#e5e5e5',
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {displayBalance}
    </Button>
  );
}
