import { Text, View } from '@tarojs/components';
import type { ButtonProps } from '@/types/ui';

const VARIANT_STYLES: Record<Required<ButtonProps>['variant'], Record<string, string>> = {
  primary: {
    background: 'var(--primary-color)',
    color: 'var(--text-inverse)',
  },
  secondary: {
    background: 'var(--primary-50)',
    color: 'var(--primary-color)',
  },
  danger: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-color)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
};

const SIZE_STYLES: Record<Required<ButtonProps>['size'], Record<string, string>> = {
  sm: {
    paddingTop: 'var(--space-2)',
    paddingBottom: 'var(--space-2)',
    paddingLeft: 'var(--space-4)',
    paddingRight: 'var(--space-4)',
    fontSize: 'var(--text-sm)',
    borderRadius: 'var(--radius-md)',
  },
  md: {
    paddingTop: 'var(--space-4)',
    paddingBottom: 'var(--space-4)',
    paddingLeft: 'var(--space-6)',
    paddingRight: 'var(--space-6)',
    fontSize: 'var(--text-base)',
    borderRadius: 'var(--radius-md)',
  },
  lg: {
    paddingTop: 'var(--space-5)',
    paddingBottom: 'var(--space-5)',
    paddingLeft: 'var(--space-6)',
    paddingRight: 'var(--space-6)',
    fontSize: 'var(--text-lg)',
    borderRadius: 'var(--radius-lg)',
  },
};

export default function Button({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  block = true,
  className,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      onClick={isDisabled ? undefined : onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: block ? '100%' : 'auto',
        textAlign: 'center',
        fontWeight: 'var(--font-medium)',
        opacity: isDisabled ? 0.5 : 1,
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
    >
      {loading && (
        <View
          style={{
            width: size === 'sm' ? '20rpx' : '28rpx',
            height: size === 'sm' ? '20rpx' : '28rpx',
            marginRight: 'var(--space-2)',
            border: '2rpx solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: 'var(--radius-full)',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      <Text>{loading ? '加载中...' : children}</Text>
    </View>
  );
}
