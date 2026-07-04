import { View } from '@tarojs/components';
import type { SafeAreaProps } from '@/types/ui';

export default function SafeArea({
  children,
  edges = 'both',
  className,
  style,
}: SafeAreaProps) {
  const edgeClasses = [
    edges === 'top' || edges === 'both' ? 'safe-area-top' : '',
    edges === 'bottom' || edges === 'both' ? 'safe-area-bottom' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const combinedClassName = [edgeClasses, className].filter(Boolean).join(' ');

  return (
    <View className={combinedClassName} style={style}>
      {children}
    </View>
  );
}
