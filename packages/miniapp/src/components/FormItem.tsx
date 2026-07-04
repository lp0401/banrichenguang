import { Text, View } from '@tarojs/components';
import type { FormItemProps } from '@/types/ui';

const HELPER_TEXT_STYLE = {
  marginTop: 'var(--space-2)',
  fontSize: 'var(--text-sm)',
  lineHeight: 'var(--leading-normal)',
} as const;

interface HelperTextProps {
  children: string;
  color: string;
}

function HelperText({ children, color }: HelperTextProps) {
  return (
    <Text
      style={{
        ...HELPER_TEXT_STYLE,
        color,
      }}
    >
      {children}
    </Text>
  );
}

export default function FormItem({
  label,
  required = false,
  error,
  children,
  helper,
  className,
}: FormItemProps) {
  return (
    <View
      className={className}
      style={{
        marginBottom: 'var(--space-5)',
      }}
    >
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 'var(--space-3)',
        }}
      >
        <Text
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--text-primary)',
          }}
        >
          {label}
        </Text>
        {required && (
          <Text
            style={{
              marginLeft: 'var(--space-1)',
              color: 'var(--danger-color)',
            }}
          >
            *
          </Text>
        )}
      </View>
      {children}
      {helper && !error && (
        <HelperText color="var(--text-tertiary)">{helper}</HelperText>
      )}
      {error && (
        <HelperText color="var(--danger-color)">{error}</HelperText>
      )}
    </View>
  );
}
