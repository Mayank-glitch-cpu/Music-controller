const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "./static/frontend"),
      filename: "[name].js",
      publicPath: '/static/frontend/',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
      ],
    },
    resolve: {
      fallback: {
        "events": require.resolve("events/"),
        "util": require.resolve("util/"),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
      }
    },
    optimization: {
      minimize: !isDevelopment,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    devServer: {
      port: 8080,
      hot: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'static'),
      },
      devMiddleware: {
        publicPath: '/static/frontend/',
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:8000',
          secure: false,
          changeOrigin: true,
        },
      ],
    },
  };
};