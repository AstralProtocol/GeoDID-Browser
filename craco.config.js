const cracoLessPlugin = require('craco-less');
const path = require('path');
const { whenProd } = require('@craco/craco');

/* Allows importing code from other packages in a monorepo. Explanation:
When you use lerna / yarn workspaces to import a package, you create a symlink in node_modules to
that package's location. By default Webpack resolves those symlinks to the package's actual path,
which makes some create-react-app plugins and compilers fail (in prod builds) because you're only
allowed to import things from ./src or from node_modules
 */
/*
const disableSymlinkResolution = {
  plugin: {
    overrideWebpackConfig: ({ webpackConfig }) => {
      webpackConfig.resolve.symlinks = false;
      return webpackConfig;
    },
  },
};
*/
const webpackSingleModulesResolution = {
  alias: {
    loamLib: path.join(__dirname, 'node_modules', 'loam', 'lib'),
    gdalJs: path.join(__dirname, 'node_modules', 'gdal-js'),
  },
  configure: {
    module: {
      rules: [
        {
          test: /(loam-worker\.js|gdal\.js|gdal\.wasm|gdal\.data)$/,
          type: 'javascript/auto',
          loader: 'file-loader?name=[name].[ext]',
        },
        {
          test: require.resolve('loam'),
          loaders: ['expose-loader?loam'],
        },
      ],
    },
  },
};

module.exports = {
  // plugins: [...whenProd(() => [disableSymlinkResolution], [])],
  webpack: webpackSingleModulesResolution,
};
