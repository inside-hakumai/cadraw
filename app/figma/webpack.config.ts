import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import HtmlInlineScriptPlugin from "html-inline-script-webpack-plugin";

const NODE_ENV: 'development' | 'production' = (() => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
    return process.env.NODE_ENV
  } else {
    return 'development'
  }
})()

const config: Configuration = {
  mode: NODE_ENV,
  devtool: NODE_ENV === 'production' ? false : 'inline-source-map',
  target: 'web',
  entry: {
    ui: './ui/index.tsx',
    code: './code/index.ts',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-react',
                  { runtime: 'automatic', importSource: '@emotion/react' }
                ],
              ],
              plugins: ['@emotion/babel-plugin'],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.ui.json',
            }
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './ui/index.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
      inject: 'body',
    }),
    new HtmlInlineScriptPlugin()
  ]

}

export default config
