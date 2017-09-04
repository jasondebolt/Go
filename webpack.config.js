var webpack = require('webpack');
module.exports = {
  entry: [
    "./src/index.js"
  ],
  externals: {
    'Config': JSON.stringify(
      process.env.SERVER_ENV == 'dev' ? {
        serverUrl: "https://z4ru6xjb9f.execute-api.us-west-2.amazonaws.com/dev",
        urlPath: "dev"
      } : {
        serverUrl: "http://127.0.0.1:5000",
        urlPath: "local"
      }
    )
  },
  output: {
    path: __dirname + '/static',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-1']
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: "style!css"
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  },
  plugins: [
  ]
};
