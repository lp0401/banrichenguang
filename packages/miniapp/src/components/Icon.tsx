import { Text, View } from '@tarojs/components';
import type { IconProps } from '@/types/ui';

const SIZE_MAP: Record<Required<IconProps>['size'], string> = {
  sm: '40rpx',
  md: '56rpx',
  lg: '72rpx',
  xl: '96rpx',
};

export default function Icon({ emoji, size = 'md', style }: IconProps) {
  return (
    <Text
      style={{
        fontSize: SIZE_MAP[size],
        lineHeight: SIZE_MAP[size],
        ...style,
      }}
    >
      {emoji}
    </Text>
  );
}
