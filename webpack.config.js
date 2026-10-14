import path from 'path';
import { fileURLToPath } from 'url';
import GopeedPolyfillPlugin from 'gopeed-polyfill-webpack-plugin';

export default (env, argv) => {
  const production = argv.mode === 'production';
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(fileURLToPath(import.meta.url), '../release'),
      filename: 'index.js',
      clean: true,
    },
    plugins: [new GopeedPolyfillPlugin()],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    devtool: production ? false : 'inline-source-map',
    optimization: {
      // Keep the bundle readable: Gopeed users (and reviewers) can audit what talks to their cookie.
      minimize: false,
    },
    performance: { hints: false },
  };
};
