import { Text, View } from '@tarojs/components';
import type { DataGridProps } from '@/types/ui';

export default function DataGrid({ items, columns = 4, className, style }: DataGridProps) {
  return (
    <View
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {items.map((item, index) => (
        <View
          key={item.label + index}
          style={{
            width: `${100 / columns}%`,
            padding: 'var(--space-5) var(--space-2)',
            textAlign: 'center',
            boxSizing: 'border-box',
            borderRight:
              (index + 1) % columns !== 0 ? '1rpx solid var(--border-color)' : 'none',
            borderBottom:
              index < items.length - columns ? '1rpx solid var(--border-color)' : 'none',
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              display: 'block',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-bold)',
              color: item.highlight ? 'var(--primary-color)' : 'var(--text-primary)',
              marginBottom: item.subValue ? 'var(--space-1)' : 0,
            }}
          >
            {item.value}
          </Text>
          {item.subValue && (
            <Text
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
              }}
            >
              {item.subValue}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
