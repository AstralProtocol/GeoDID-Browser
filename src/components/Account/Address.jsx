import React from 'react';
import Blockies from 'react-blockies';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useLookupAddress } from 'core/hooks/web3hooks';

const useStyles = makeStyles(() => ({
  address: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    textAlign: 'center',
    justifyItems: 'center',
    alignItems: 'center',
  },
}));

const blockExplorerLink = (address, blockExplorer) =>
  `${blockExplorer || 'https://etherscan.io/'}${'address/'}${address}`;

export default function Address(props) {
  const classes = useStyles();

  const ens = useLookupAddress(props.ensProvider, props.value);

  if (!props.value) {
    return <span>No address</span>;
  }

  let displayAddress = props.value.substr(0, 6);

  if (ens && ens.indexOf('0x') < 0) {
    displayAddress = ens;
  } else if (props.size === 'short') {
    displayAddress += '...' + props.value.substr(-4);
  } else if (props.size === 'long') {
    displayAddress = props.value;
  }

  const etherscanLink = blockExplorerLink(props.value, props.blockExplorer);
  if (props.minimized) {
    return (
      <span style={{ verticalAlign: 'middle' }}>
        <a
          style={{ color: '#e5e5e5' }}
          target="_blank"
          href={etherscanLink}
          rel="noopener noreferrer"
        >
          <Blockies seed={props.value.toLowerCase()} size={8} scale={2} />
        </a>
      </span>
    );
  }

  let text;
  if (props.onChange) {
    text = (
      <Typography>
        <a
          style={{ color: '#e5e5e5' }}
          target="_blank"
          href={etherscanLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      </Typography>
    );
  } else {
    text = (
      <Typography>
        <a
          style={{ color: '#e5e5e5' }}
          target="_blank"
          href={etherscanLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      </Typography>
    );
  }

  return (
    <div className={classes.address}>
      <Blockies
        seed={props.value.toLowerCase()}
        size={8}
        scale={props.fontSize ? props.fontSize / 7 : 4}
      />
      {text}
    </div>
  );
}
