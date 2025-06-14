const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  return {
    entry: "./src/index.js", // Or your actual entry file e.g. "./src/components/app.js"
    output: {
      path: path.resolve(__dirname, "./static/frontend"),
      filename: "[name].js",
      publicPath: '/static/frontend/', // Unified publicPath
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
    optimization: {
      minimize: !isDevelopment, // Only minimize in production
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      }),
    ],
    devServer: {
      port: 8080,
      hot: true, // Enable Hot Module Replacement
      historyApiFallback: true, // Serve index.html for SPA routes
      static: { // Serve a base index.html for the dev server itself
        directory: path.join(__dirname, 'static'), // Create a simple static/index.html for dev server
      },
      devMiddleware: { // Ensure this is nested if you had it at top level
        publicPath: '/static/frontend/',
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      // allowedHosts: 'all', // 'all' is very permissive; consider being more specific if needed
      proxy: [ // Proxy API requests to your Django backend
        {
          context: ['/api'], // If your Django API routes start with /api
          target: 'http://localhost:8000', // Your Django server
          secure: false,
          changeOrigin: true,
        },
      ],
    },
  };
};