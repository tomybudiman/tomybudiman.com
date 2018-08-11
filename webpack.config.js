const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const empty = require("empty-folder");
const path = require("path");
const fs = require("fs");

// Check if build folder is exists
if(fs.existsSync('./build')){
  // Purge build folder content if it exists
  empty('./build', false, e => {
    if(e.error){
      throw e.error
    }
  });
}

module.exports = (env, argv) => {
  return({
    output: {
      path: path.resolve(__dirname,'build'),
      chunkFilename: 'static/js/[id][hash:32].js',
      filename: 'static/js/bundle.js',
      publicPath: '/'
    },
    devServer: {
      open: true
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          include: path.resolve(__dirname,'src'),
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(css|scss|sass)$/,
          use: argv.mode === 'development' ? [
            {loader: 'style-loader'},
            {loader: 'css-loader'},
            {loader: 'sass-loader'}
          ] : [
            {loader: MiniCssExtractPlugin.loader},
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  require('autoprefixer')
                ]
              }
            },
            {loader: 'sass-loader'}
          ]
        },
        // Media file such as PNG, JPG, GIF, etc...
        {
          test: /\.(png|jpg|jpeg|gif|bmp|svg|ico)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'static/media/[hash:32].[ext]'
              }
            }
          ]
        },
        // Font file
        {
          test: /\.(ttf|otf|woff)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'static/assets/[hash:32].[ext]'
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    optimization: {
      splitChunks: {
        chunks: 'async',
        cacheGroups: {
          default: false,
          vendors: false,
          styles: {
            name: 'styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'all',
            enforce: true
          }
        }
      },
      minimizer: [
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        inject: true,
        template: "./public/index.html",
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        }
      }),
      new MiniCssExtractPlugin({
        chunkFilename: "static/css/style.css"
      }),
      new MinifyPlugin(),
      new CopyWebpackPlugin([
        {from: './public/favicon.ico', to: './favicon.ico'}
      ])
    ]
  })
};
