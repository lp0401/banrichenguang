import type { AppConfig } from '@tarojs/taro';

const config: AppConfig = {
  pages: [
    'pages/index/index',
    'pages/daily/index',
    'pages/profile/index',
  ],
  subPackages: [
    {
      root: 'pages/bazi',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/ziwei',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/liuyao',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/qimen',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/daliuren',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/tarot',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/mbti',
      pages: ['index', 'result', 'test'],
    },
    {
      root: 'pages/face',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/palm',
      pages: ['index', 'result'],
    },
    {
      root: 'pages/records',
      pages: ['index', 'detail'],
    },
    {
      root: 'pages/membership',
      pages: ['index', 'redeem', 'admin-keys'],
    },
    {
      root: 'pages/checkin',
      pages: ['index'],
    },
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#8B5CF6',
    navigationBarTitleText: '半日辰光',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F3F4F6',
  },
  tabBar: {
    color: '#6B7280',
    selectedColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/daily/index',
        text: '运势',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
};

export default config;
