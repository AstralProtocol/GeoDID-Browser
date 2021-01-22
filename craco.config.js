const CracoLessPlugin = require('craco-less');
const { getThemeVariables } = require('antd/dist/theme');
const theme = getThemeVariables({dark: true})


module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {         
                ...theme,
                'primary-color': '#4ed18f',
                'link-color': '#4ed18f' 
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};