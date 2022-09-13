const path = require('path');

module.exports = {
  entry: {
    battle: './src/battle.ts',
    index: './src/index.ts',
    intro: './src/intro.ts',
    server: './src/server.ts'
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    //minimize: false,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },
};