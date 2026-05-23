const path = require('node:path');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: path.resolve(__dirname, 'src/game/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist-lib'),
    filename: 'index.js',
    library: {
      type: 'module',
    },
    clean: true,
    environment: {
      module: true,
    },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.lib.json'),
        },
      },
    ],
  },
  devtool: 'source-map',
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
};
