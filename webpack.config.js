//@ts-check

'use strict';

import path from 'path';
import { fileURLToPath } from 'url';

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV == 'production';

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node',
  experiments: {
    outputModule: true,
    topLevelAwait: true,
  },
  entry: './src/open-doc-in-web.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.cjs',
    library: {
      type: 'module',
    },
    libraryTarget: 'commonjs',
    chunkFormat: 'module',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log',
  },
};

export default () => {
  if (isProduction) {
    extensionConfig.mode = 'production';
  } else {
    extensionConfig.mode = 'development';
  }

  return extensionConfig;
};
