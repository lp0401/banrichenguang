import { Text, View } from '@tarojs/components';
import type { LoadingProps } from '@/types/ui';

const SIZE_STYLES: Record<Required<LoadingProps>['size'], Record<string, string>> = {
  sm: {
    width: '32rpx',
    height: '32rpx',
    borderWidth: '3rpx',
  },
  md: {
    width: '48rpx',
    height: '48rpx',
    borderWidth: '4rpx',
  },
  lg: {
    width: '64rpx',
    height: '64rpx',
    borderWidth: '5rpx',
  },
};

export default function Loading({
  text = '加载中...',
  size = 'md',
  fullScreen = false,
  className,
  style,
}: LoadingProps) {
  const sizeStyle = SIZE_STYLES[size];

  const spinner = (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          borderRadius: 'var(--radius-full)',
          borderStyle: 'solid',
          borderColor: 'var(--primary-color)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
          ...sizeStyle,
        }}
      />
      <Text
        style={{
          marginTop: 'var(--space-3)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
        }}
      >
        {text}
      </Text>
    </View>
  );

  if (!fullScreen) {
    return (
      <View className={className} style={style}>
        {spinner}
      </View>
    );
  }

  return (
    <View
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.72)',
        zIndex: 1000,
        ...style,
      }}
    >
      {spinner}
    </View>
  );
}
