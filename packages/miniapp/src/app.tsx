import Taro from '@tarojs/taro';
import '@/lib/banri-chenguang-core-shim';
import { Component, PropsWithChildren } from 'react';
import './app.css';

function migrateLegacyMiniappStorage(): void {
  const legacyKeys = [
    'taibu_access_token',
    'taibu_refresh_token',
    'taibu_user',
  ];
  const newKeys = [
    'banri_chenguang_access_token',
    'banri_chenguang_refresh_token',
    'banri_chenguang_user',
  ];

  for (let i = 0; i < legacyKeys.length; i += 1) {
    const oldKey = legacyKeys[i];
    const newKey = newKeys[i];
    try {
      const value = Taro.getStorageSync<string | object>(oldKey);
      if (value !== undefined && value !== null && value !== '') {
        const existing = Taro.getStorageSync<unknown>(newKey);
        if (existing === undefined || existing === null || existing === '') {
          Taro.setStorageSync(newKey, value);
        }
      }
      Taro.removeStorageSync(oldKey);
    } catch {
      // ignore storage errors
    }
  }
}

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    migrateLegacyMiniappStorage();
  }

  render() {
    return this.props.children;
  }
}

export default App;
