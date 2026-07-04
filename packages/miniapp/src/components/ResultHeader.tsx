import { Text, View } from '@tarojs/components';
import type { ResultHeaderProps } from '@/types/ui';

export default function ResultHeader({
  title,
  subtitle,
  emoji,
  tag,
  className,
  style,
}: ResultHeaderProps) {
  return (
    <View
      className={className}
      style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8) var(--space-6)',
        marginBottom: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: '-40rpx',
          right: '-40rpx',
          width: '160rpx',
          height: '160rpx',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
        }}
      />
      <View style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        {emoji && (
          <Text style={{ fontSize: 'var(--text-3xl)', marginRight: 'var(--space-3)' }}>
            {emoji}
          </Text>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text-inverse)',
              marginBottom: tag ? 'var(--space-2)' : 0,
            }}
          >
            {title}
          </Text>
          {tag && (
            <View
              style={{
                display: 'inline-flex',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-inverse)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <Text>{tag}</Text>
            </View>
          )}
        </View>
      </View>
      {subtitle && (
        <Text
          style={{
            fontSize: 'var(--text-base)',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
