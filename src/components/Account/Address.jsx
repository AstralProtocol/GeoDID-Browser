import React from 'react';
import Blockies from 'react-blockies';
import TextField from '@material-ui/core/TextField';
import { useLookupAddress } from 'core/newhooks';

const blockExplorerLink = (address, blockExplorer) =>
  `${blockExplorer || 'https://etherscan.io/'}${'address/'}${address}`;

export default function Address(props) {
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
          style={{ color: '#222222' }}
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
      <TextField>
        <a
          style={{ color: '#222222' }}
          target="_blank"
          href={etherscanLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      </TextField>
    );
  } else {
    text = (
      <TextField>
        <a
          style={{ color: '#222222' }}
          target="_blank"
          href={etherscanLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      </TextField>
    );
  }

  return (
    <span>
      <span style={{ verticalAlign: 'middle' }}>
        <Blockies
          seed={props.value.toLowerCase()}
          size={8}
          scale={props.fontSize ? props.fontSize / 7 : 4}
        />
      </span>
      <span
        style={{
          verticalAlign: 'middle',
          paddingLeft: 5,
          fontSize: props.fontSize ? props.fontSize : 28,
        }}
      >
        {text}
      </span>
    </span>
  );
}
