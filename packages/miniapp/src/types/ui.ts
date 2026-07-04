import type { CSSProperties, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  style?: CSSProperties;
}

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardBackground = 'default' | 'muted' | 'gradient';

export interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  style?: CSSProperties;
  padding?: CardPadding;
  bg?: CardBackground;
  onClick?: () => void;
}

export interface FormItemProps {
  label: string;
  required?: boolean;
  error?: string | null;
  children: ReactNode;
  helper?: string;
  className?: string;
}

export type LoadingSize = 'sm' | 'md' | 'lg';

export interface LoadingProps {
  text?: string;
  size?: LoadingSize;
  fullScreen?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  style?: CSSProperties;
}

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  onBack?: () => void;
  backText?: string;
  className?: string;
  style?: CSSProperties;
}

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export interface TagProps {
  children: ReactNode;
  active?: boolean;
  variant?: TagVariant;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export type SafeAreaEdge = 'top' | 'bottom' | 'both';

export interface SafeAreaProps {
  children: ReactNode;
  edges?: SafeAreaEdge;
  className?: string;
  style?: CSSProperties;
}

export interface IconProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: CSSProperties;
}

export interface FormControlProps {
  children?: ReactNode;
  placeholder?: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
}

export interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface ResultHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  tag?: string;
  className?: string;
  style?: CSSProperties;
}

export interface DataGridItem {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
}

export interface DataGridProps {
  items: DataGridItem[];
  columns?: number;
  className?: string;
  style?: CSSProperties;
}
