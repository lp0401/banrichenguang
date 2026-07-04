import { Text, View } from '@tarojs/components';
import type { CardProps } from '@/types/ui';

const PADDING_STYLES: Record<Required<CardProps>['padding'], string> = {
  none: '0',
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

const BG_STYLES: Record<Required<CardProps>['bg'], Record<string, string>> = {
  default: {
    background: 'var(--bg-primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  muted: {
    background: 'var(--bg-muted)',
    boxShadow: 'none',
  },
  gradient: {
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
    color: 'var(--text-inverse)',
    boxShadow: 'var(--shadow-md)',
  },
};

export default function Card({
  children,
  title,
  className,
  style,
  padding = 'md',
  bg = 'default',
  onClick,
}: CardProps) {
  const bgStyle = BG_STYLES[bg];

  return (
    <View
      onClick={onClick}
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: PADDING_STYLES[padding],
        marginBottom: 'var(--space-6)',
        ...bgStyle,
        ...style,
      }}
    >
      {title && (
        <View
          style={{
            marginBottom: 'var(--space-4)',
          }}
        >
          <Text
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: bg === 'gradient' ? 'var(--text-inverse)' : 'var(--text-primary)',
            }}
          >
            {title}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
}
