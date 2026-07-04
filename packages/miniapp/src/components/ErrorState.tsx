import { Text, View } from '@tarojs/components';
import Button from './Button';
import type { ErrorStateProps } from '@/types/ui';

export default function ErrorState({
  message = '出错了，请重试',
  onRetry,
  retryText = '重试',
  onBack,
  backText = '返回',
  className,
  style,
}: ErrorStateProps) {
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
        ⚠️
      </Text>
      <Text
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {message}
      </Text>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
        }}
      >
        {onRetry && (
          <View style={{ flex: 1, marginRight: onBack ? 'var(--space-3)' : 0 }}>
            <Button variant="primary" size="md" block={false} onClick={onRetry}>
              {retryText}
            </Button>
          </View>
        )}
        {onBack && (
          <View style={{ flex: 1, marginLeft: onRetry ? 'var(--space-3)' : 0 }}>
            <Button variant="ghost" size="md" block={false} onClick={onBack}>
              {backText}
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
