const path = require('path');

module.exports = {
  entry: {
    battle: {
      import: './src/battle.ts',
      dependOn: 'graphics'
    },
    intro: {
      import: './src/intro.ts',
      dependOn: 'graphics'
    },
    graphics: './src/graphics.ts',
    index: './src/index.ts',
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
    minimize: true,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },
};