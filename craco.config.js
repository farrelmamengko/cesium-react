const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.modules = [
        ...webpackConfig.resolve.modules,
        path.resolve(__dirname, 'node_modules/cesium')
      ];

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url'),
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify'),
      };
      
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('/cesium')
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'node_modules/cesium/Build/Cesium/Workers',
              to: 'cesium/Workers'
            },
            {
              from: 'node_modules/cesium/Build/Cesium/Assets',
              to: 'cesium/Assets'
            },
            {
              from: 'node_modules/cesium/Build/Cesium/ThirdParty',
              to: 'cesium/ThirdParty'
            },
            {
              from: 'node_modules/cesium/Build/Cesium/Widgets',
              to: 'cesium/Widgets'
            }
          ]
        })
      ];

      return webpackConfig;
    }
  }
}; 