import Taro from '@tarojs/taro';

/**
 * 处理占术分析接口返回的常见错误，显示对应引导弹窗。
 * @returns 若已处理并弹窗，返回 true；否则返回 false，调用方可继续 Toast 等处理。
 */
export function handleAnalysisError(message: string): boolean {
  if (message.includes('401') || message.includes('登录') || message.includes('认证')) {
    Taro.showModal({
      title: '登录已过期',
      content: '请重新登录以继续使用',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          void Taro.switchTab({ url: '/pages/profile/index' });
        }
      },
    });
    return true;
  }

  if (message.includes('403') || message.includes('Plus 会员')) {
    Taro.showModal({
      title: '需要会员',
      content: '该功能需要 Plus 会员或以上',
      confirmText: '去升级',
      success: (res) => {
        if (res.confirm) {
          void Taro.navigateTo({ url: '/pages/membership/index' });
        }
      },
    });
    return true;
  }

  if (message.includes('402') || message.includes('积分不足')) {
    Taro.showModal({
      title: '积分不足',
      content: '积分不足，请通过签到、激活码或会员权益获取积分后再使用',
      confirmText: '去获取积分',
      success: (res) => {
        if (res.confirm) {
          void Taro.navigateTo({ url: '/pages/membership/index' });
        }
      },
    });
    return true;
  }

  return false;
}
