const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

function initCanisterEnv() {
  let localCanisters, prodCanisters;
  try {
    localCanisters = require(path.resolve(
      ".dfx",
      "local",
      "canister_ids.json"
    ));
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing production");
  }
  try {
    prodCanisters = require(path.resolve("canister_ids.json"));
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing with local");
  }

  const network =
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === "production" ? "ic" : "local");

  const canisterConfig = network === "local" ? localCanisters : prodCanisters;

  return Object.entries(canisterConfig).reduce((prev, current) => {
    const [canisterName, canisterDetails] = current;
    prev[canisterName.toUpperCase() + "_CANISTER_ID"] =
      canisterDetails[network];
    return prev;
  }, {});
}
const canisterEnvVariables = initCanisterEnv();

const isDevelopment = process.env.NODE_ENV !== "production";

const frontendDirectory = "hub_assets";

const asset_entry = path.join("src", frontendDirectory, "src", "index.html");

module.exports = {
  target: "web",
  // mode: isDevelopment ? "development" : "production",
  mode: "development",
  entry: {
    // The frontend.entrypoint points to the HTML file for this build, so we need
    // to replace the extension to `.js`.
    index: path.join(__dirname, asset_entry).replace(/\.html$/, ".js"),
  },
  devtool: "source-map", // isDevelopment ? "source-map" : false,
  optimization: {
    minimize:  false,
    minimizer: [new TerserPlugin()],
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      events: require.resolve("events/"),
      stream: require.resolve("stream-browserify/"),
      util: require.resolve("util/"),
    },
  },
  output: {
    filename: "index.js",
    path: path.join(__dirname, "dist", frontendDirectory),
  },

  // Depending in the language or framework you are using for
  // front-end development, add module loaders to the default
  // webpack configuration. For example, if you are using React
  // modules and CSS as described in the "Adding a stylesheet"
  // tutorial, uncomment the following lines:
  module: {

    rules: [
      //  { test: /\.(ts|tsx|jsx)$/, loader: "ts-loader" },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(css|less)$/i,
        use: [
          // compiles Less to CSS
          { loader: "style-loader" },
          { loader: "css-loader" },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  'primary-color': '#0E61FE'
                },
              },
            }
          },
        ],
      },
      // { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, asset_entry),
      cache: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "src", frontendDirectory, "assets"),
          to: path.join(__dirname, "dist", frontendDirectory),
        },
      ],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      ...canisterEnvVariables,
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
    }),
    // new CompressionPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
  // proxy /api to port 8000 during development
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
      "/_": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/candidplus": {
        target: "http://localhost:8080",
        pathRewrite: function (path, req) {
          return "";
        },
      },
      "/prefollow": {
        target: "http://localhost:8080",
        pathRewrite: function (path, req) {
          return ""
        },
      },
      "/connect": {
        target: "http://localhost:8080",
        pathRewrite: function (path, req) {
          return ""
        },
      },
      hot: true,
      watchFiles: [path.resolve(__dirname, "src", frontendDirectory)],
      liveReload: true,
    },
  }
}
