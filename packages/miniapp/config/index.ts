import path from 'path';
import webpack from 'webpack';
import type { UserConfigExport } from '@tarojs/cli';

const config: UserConfigExport = {
  projectName: 'banri-chenguang-miniapp',
  date: '2026-6-29',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  esnextModules: ['banri-chenguang-core'],
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    'banri-chenguang-core$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'index.js'),
    'banri-chenguang-core/bazi$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'domains', 'bazi', 'index.js'),
    'banri-chenguang-core/ziwei$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'domains', 'ziwei', 'index.js'),
    'banri-chenguang-core/liuyao$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'domains', 'liuyao', 'index.js'),
    'banri-chenguang-core/qimen$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'domains', 'qimen', 'index.js'),
    'banri-chenguang-core/daliuren$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'domains', 'daliuren', 'index.js'),
    'banri-chenguang-core/tarot$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'domains', 'tarot', 'index.js'),
    'banri-chenguang-core/almanac$': path.resolve(__dirname, '..', '..', 'core', 'dist', 'domains', 'almanac', 'index.js'),
  },
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false,
  },
  mini: {
    webpackChain(chain) {
      chain.plugins.delete('progress');
      chain.resolve.alias.set(
        'crypto',
        path.resolve(__dirname, '..', 'src', 'lib', 'crypto-shim.ts'),
      );
      chain.plugin('provide-process').use(webpack.ProvidePlugin, [
        {
          process: [path.resolve(__dirname, '..', 'src', 'lib', 'banri-chenguang-core-shim.ts'), 'default'],
        },
      ]);
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024,
        },
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['banri-chenguang-core'],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
};

export default config;
