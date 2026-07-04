import { Text, View } from '@tarojs/components';
import Button from './Button';
import type { EmptyStateProps } from '@/types/ui';

export default function EmptyState({
  icon = '📭',
  title = '暂无数据',
  description,
  actionText,
  onAction,
  className,
  style,
}: EmptyStateProps) {
  return (
    <View
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        ...style,
      }}
    >
      <Text
        style={{
          fontSize: 'var(--text-3xl)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {icon}
      </Text>
      <Text
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          marginBottom: description ? 'var(--space-2)' : 0,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: actionText ? 'var(--space-6)' : 0,
          }}
        >
          {description}
        </Text>
      )}
      {actionText && onAction && (
        <Button variant="primary" size="md" block={false} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </View>
  );
}
