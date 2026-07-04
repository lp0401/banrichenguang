import { Text, View } from '@tarojs/components';
import type { SectionProps } from '@/types/ui';

export default function Section({
  title,
  description,
  children,
  className,
  style,
}: SectionProps) {
  return (
    <View
      className={className}
      style={{
        marginBottom: 'var(--space-6)',
        ...style,
      }}
    >
      <View
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <Text
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </Text>
      </View>
      {description && (
        <Text
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-4)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {description}
        </Text>
      )}
      {children}
    </View>
  );
}
