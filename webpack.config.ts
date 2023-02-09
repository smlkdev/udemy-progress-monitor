import * as webpack from "webpack";
import * as path from "path";

const commonConfig: webpack.Configuration = {
  entry: {
    app: "./src/app.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  target: "node",
};

const devConfig: webpack.Configuration = {
  ...commonConfig,
  mode: "development",
  name: "dev",
  watch: true,
};

const prodConfig: webpack.Configuration = {
  ...commonConfig,
  mode: "production",
  name: "prod",
};

export default [devConfig, prodConfig];
