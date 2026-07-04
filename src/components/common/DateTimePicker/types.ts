/**
 * DateTimePicker 共享类型
 */

export type CalendarType = 'solar' | 'lunar';
export type TimeMode = 'now' | 'custom';

export interface DateTimeValue {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
}

export interface DateTimePickerProps {
    /** 当前值 */
    value: DateTimeValue;
    /** 变更回调 */
    onChange: (value: DateTimeValue) => void;
    /** 时间精度 */
    precision: 'date' | 'hour' | 'minute';

    // 历法（仅八字/紫微使用）
    calendarType?: CalendarType;
    onCalendarTypeChange?: (type: CalendarType) => void;
    showCalendarToggle?: boolean;

    // 闰月（仅农历模式）
    isLeapMonth?: boolean;
    onLeapMonthChange?: (isLeap: boolean) => void;

    // 时辰快捷选择（八字/紫微）
    showShiChenQuickPick?: boolean;

    // 不知时辰（八字）
    allowUnknownTime?: boolean;
    isUnknownTime?: boolean;
    onUnknownTimeChange?: (unknown: boolean) => void;

    // 正时/活时（奇门/大六壬/六爻）
    timeMode?: TimeMode;
    onTimeModeChange?: (mode: TimeMode) => void;
    showTimeModeToggle?: boolean;

    className?: string;
}
