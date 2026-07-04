import { Text, View } from '@tarojs/components';
import type { TagProps } from '@/types/ui';

const VARIANT_STYLES: Record<Required<TagProps>['variant'], Record<string, string>> = {
  default: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    borderColor: 'var(--border-color)',
  },
  primary: {
    background: 'var(--primary-50)',
    color: 'var(--primary-color)',
    borderColor: 'var(--primary-light)',
  },
  success: {
    background: 'var(--success-bg)',
    color: 'var(--success-color)',
    borderColor: 'var(--success-color)',
  },
  warning: {
    background: 'var(--warning-bg)',
    color: 'var(--warning-color)',
    borderColor: 'var(--warning-color)',
  },
  danger: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-color)',
    borderColor: 'var(--danger-color)',
  },
};

export default function Tag({
  children,
  active = false,
  variant = 'default',
  onClick,
  className,
  style,
}: TagProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const activeStyle = active
    ? {
        background: 'var(--primary-color)',
        color: 'var(--text-inverse)',
        borderColor: 'var(--primary-color)',
      }
    : variantStyle;

  return (
    <View
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-full)',
        borderWidth: '1rpx',
        borderStyle: 'solid',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        ...activeStyle,
        ...style,
      }}
    >
      <Text>{children}</Text>
    </View>
  );
}
