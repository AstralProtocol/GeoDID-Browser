# Filecoin GeoDID front-end browser.

### A dApp for storing Spatio Temporal Asset Catalogs (https://stacspec.org) over Filecoin, using The Graph

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

- REACT_APP_GRAPHQL_HTTP_ENDPOINT=
- REACT_APP_GRAPHQL_WS_ENDPOINT=
- REACT_APP_MapboxAccessToken= ADD A MAPBOX API KEY HERE, YOU CAN GET ONE BY REGISTERING AT https://www.mapbox.com/

3. Do `yarn start`. Connect with your metamask wallet to the Ropsten network. You should be able to authenticate with the dApp

4. Upload some test stac items. You can find some examples here:

- [planet.stac.cloud](https://planet.stac.cloud) ([catalog on GitHub](https://github.com/cholmes/pdd-stac/))
- [CBERS](https://cbers.stac.cloud) ([catalog tools on GitHub](https://github.com/fredliporace/cbers-2-stac))
- [Google Earth Engine](https://gee.stac.cloud)
- [sat-api.stac.cloud](https://sat-api.stac.cloud) ([sat-api on GitHub](https://github.com/sat-utils/sat-api))

If a specific STAC item throws an error when trying to register it, change its ID by opening the json file and saving it again. The dApp was built with the assumption that a single STAC item belongs to a single ethereum address.

---

## Introduction

Spatial data contains information relevant to locations in the physical world. Different locations have different rules - depending on where you are you have to abide to a different regulatory framework.

To create decentralized applications that leverage spatial data and location information, we need to be able to store and access spatial data in ways that ensure it is simple and reliable for Web3 developers to work with.

For the past 10 years, the go-to standard for storing, retrieving, processing, and analyzing geospatial data, has traditionally been with cloud service providers.

As a result, most of the tooling, workflows, specifications, and projects have been built to compliment the web2 space. The Spatio Temporal Asset Catalog(STAC) specification and the Cloud Optimized GeoTIFFs (COGs) are two of the leading specifications/standards used within the geospatial industry.

STAC is supported by an active community of developers, with involvement from a large range of organizations, including Radiant Earth Foundation, Microsoft, Google Earth Engine, Near Space Labs, L3Harris, etc. In addition, COGs are gaining widespread adoption from the likes of Raster Foundry, GDAL, Google Earth Engine, QGIS, and interoperability with Amazon S3.

The problem is that the aforementioned specification and file standard are only beneficial for the web2 ecosystem. They are optimized and designed to leverage cloud architecture, and location based addresses. When porting these to web3, we see that they become useless because they are not interoperable with CIDs and distributed file systems, as they do not offer web3 leveraged features.

In order to solve these problems, we decided to hack geospatial applications into the Skynet Ecosystem and ultimately the greater web3 ecosystem as well. We believe that SkyDB can be a leading distributed file system of geospatial data in the web3 ecosystem.
