const path = require('path');

const config = {
  projectName: 'banri-chenguang-miniapp',
  date: '2024-01-01',
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
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    // banri-chenguang-core 在小程序里用到 Node 的 crypto，这里指向最小 polyfill
    crypto: path.resolve(__dirname, '..', 'src/lib/node-crypto-shim.ts'),
  },
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'webpack5',
  mini: {
    // 关闭主包优化，避免 Taro/webpack5 把多个分包共享模块抽到 sub-common
    // 导致微信运行时出现 "module 'pages/xxx/sub-common/...js' is not defined" 错误。
    optimizeMainPackage: {
      enable: false,
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
    },
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
