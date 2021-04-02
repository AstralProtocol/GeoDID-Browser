# Filecoin GeoDID front-end browser.

Available at https://studio.astral.global

### Instructions to try the dApp

The current requirements are an Ethereum account connected to the Ropsten network preloaded with some faucet ETH. Browsers should be either Chrome or Brave (please check for any extensions that may be restricting features, such as Brave Site Shield, they must (!) be disabled for now, otherwise the token to access the powergate instance cannot be fetched).

The current process goes like this:

As soon as the user has some test ETH, they may log-in in our dapp, go into the 'Account' section in the left panel and enable their GeoDID creator role (currently this requires a small test eth fee).

Then, they are able to create GeoDID Collections, Items, Create/Update the relationships between them and add assets that represent anything in the map. These assets are currently restricted to:

- GeoJSONs 
- GeoTIFFs referenced in the WGS84 coordinate system (important!)

Disclaimer: some small bugs are to be expected. Please report them in issues.

### Introduction: A dApp for storing GeoDIDs over Filecoin, using The Graph

This will be the front-end interface that allows spatial data providers to register spatial assets
that follow the STAC spec and transform them into a GeoDID format, managing all the related
CRUD operations within the Filecoin network and Ethereum registry smart contracts.

We believe web3 currently has some interaction barriers and we want to make it as frictionless
as possible to register a spatial asset for a data provider. Given this, the interface will be built
using React according to the latest front end methodologies and will be UX focused, allowing for
a seamless and beautiful overview of GeoDIDs using react-mapbox-gl.

It will also allow for a seamless browsing of registered GeoDIDs and their properties, allowing a
user to quickly query and find any spatial data asset they find relevant over the Filecoin network.

DID Controllers will sign into the client-side dapp with Metamask or a similar gateway. This will
automatically fetch the GeoDID(s) they have registered, and provide UI elements enabling them
to update metadata or spatial data assets, and to deregister the DID. This architectural design
provides the DID Controller full sovereignty over their spatial data assets.

## How to work with the dApp in development mode:

1. `yarn`
2. Create a .env file with the following variables:

- REACT_APP_GRAPHQL_HTTP_ENDPOINT=https://api.thegraph.com/subgraphs/name/astralprotocol/spatialassetsfinalv1
- REACT_APP_GRAPHQL_WS_ENDPOINT=wss://api.thegraph.com/subgraphs/name/astralprotocol/spatialassetsfinalv1
- REACT_APP_HTTP_ENDPOINT=https://ropsten.infura.io/v3/YOUR_KEY
- REACT_APP_INFURA_ID=YOUR_KEY
- REACT_APP_NETWORK_ID=3
- REACT_APP_ETHERSCAN_KEY=YOUR_ETHERSCAN_KEY
- REACT_APP_BNC_NOTIFY_API_KEY=YOUR_BNC_NOTIFY_KEY (https://docs.blocknative.com/notify)

3. Do `yarn start`. Connect with your metamask wallet to the Ropsten network. You should be able to authenticate with the dApp. You need test ETH to interact.

4. Enable the GeoDID creator role in your Account

6. Upload some test geojson or geotiff (wgs84) items or changes the GeoDID relationships.
