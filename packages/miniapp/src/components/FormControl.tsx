import { Text, View } from '@tarojs/components';
import type { FormControlProps } from '@/types/ui';

const BASE_STYLE = {
  padding: 'var(--space-4) var(--space-5)',
  background: 'var(--bg-tertiary)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-primary)',
  minHeight: '88rpx',
  display: 'flex',
  alignItems: 'center',
} as const;

export default function FormControl({
  children,
  placeholder,
  suffix,
  className,
  style,
}: FormControlProps) {
  return (
    <View
      className={className}
      style={{
        ...BASE_STYLE,
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <Text
        style={{
          color: children ? 'var(--text-primary)' : 'var(--text-tertiary)',
        }}
      >
        {children || placeholder}
      </Text>
      {suffix && (
        <Text style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
          {suffix}
        </Text>
      )}
    </View>
  );
}
