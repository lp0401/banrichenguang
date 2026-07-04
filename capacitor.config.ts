import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hhs.banrichenguang',
  appName: '半日辰光',
  webDir: 'capacitor-www',
  server: {
    url: 'https://www.mingai.fun',
    cleartext: false,
    allowNavigation: [
      'mingai.fun',
      '*.mingai.fun',
      '*.vercel.app',
    ],
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
