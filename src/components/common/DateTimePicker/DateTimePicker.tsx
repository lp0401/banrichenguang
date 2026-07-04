/**
 * DateTimePicker 主组件
 *
 * 统一日期时间选择器，支持：
 * - 年/月/日选择（公历/农历）
 * - 时/分选择 + 时辰快捷选择
 * - 不知时辰
 * - 正时/活时切换
 */

'use client';

import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { useDateTimePicker } from './useDateTimePicker';
import type { DateTimePickerProps, TimeMode } from './types';

export function DateTimePicker({
    value,
    onChange,
    precision,
    calendarType = 'solar',
    onCalendarTypeChange,
    showCalendarToggle = false,
    isLeapMonth = false,
    onLeapMonthChange,
    showShiChenQuickPick = false,
    allowUnknownTime = false,
    isUnknownTime = false,
    onUnknownTimeChange,
    timeMode = 'custom',
    onTimeModeChange,
    showTimeModeToggle = false,
    className = '',
}: DateTimePickerProps) {
    const {
        year,
        month,
        day,
        hour,
        minute,
        setYear,
        setMonth,
        setDay,
        setHour,
        setMinute,
        convertToCalendar,
    } = useDateTimePicker({ value, onChange, calendarType });

    const isReadOnly = showTimeModeToggle && timeMode === 'now';

    const handleCalendarTypeChange = (nextType: 'solar' | 'lunar') => {
        if (onCalendarTypeChange) {
            convertToCalendar(nextType);
            onCalendarTypeChange(nextType);
            onLeapMonthChange?.(false);
        }
    };

    const handleTimeModeChange = (nextMode: TimeMode) => {
        onTimeModeChange?.(nextMode);
        if (nextMode === 'now') {
            const now = new Date();
            onChange({
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                hour: now.getHours(),
                minute: now.getMinutes(),
            });
        }
    };

    const buttonBaseClass = 'px-4 py-2 rounded-md border text-sm font-semibold transition-all duration-150';

    return (
        <div className={`space-y-4 ${className}`}>
            {/* 正时/活时切换 */}
            {showTimeModeToggle && onTimeModeChange && (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleTimeModeChange('now')}
                        className={`${buttonBaseClass} ${
                            timeMode === 'now'
                                ? 'border-[#2383e2] bg-[#2383e2] text-white'
                                : 'border-border bg-background text-foreground hover:bg-background-secondary'
                        }`}
                    >
                        正时（当前时间）
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTimeModeChange('custom')}
                        className={`${buttonBaseClass} ${
                            timeMode === 'custom'
                                ? 'border-[#2383e2] bg-[#2383e2] text-white'
                                : 'border-border bg-background text-foreground hover:bg-background-secondary'
                        }`}
                    >
                        活时（自选时间）
                    </button>
                </div>
            )}

            {/* 历法切换 */}
            {showCalendarToggle && onCalendarTypeChange && (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleCalendarTypeChange('solar')}
                        className={`${buttonBaseClass} ${
                            calendarType === 'solar'
                                ? 'border-[#2383e2] bg-[#2383e2] text-white'
                                : 'border-border bg-background text-foreground hover:bg-background-secondary'
                        }`}
                    >
                        公历
                    </button>
                    <button
                        type="button"
                        onClick={() => handleCalendarTypeChange('lunar')}
                        className={`${buttonBaseClass} ${
                            calendarType === 'lunar'
                                ? 'border-[#2383e2] bg-[#2383e2] text-white'
                                : 'border-border bg-background text-foreground hover:bg-background-secondary'
                        }`}
                    >
                        农历
                    </button>
                </div>
            )}

            {/* 日期选择 */}
            {precision !== 'date' || showCalendarToggle ? (
                <DatePicker
                    year={year}
                    month={month}
                    day={day}
                    onYearChange={setYear}
                    onMonthChange={setMonth}
                    onDayChange={setDay}
                    calendarType={calendarType}
                    isLeapMonth={isLeapMonth}
                    onLeapMonthChange={onLeapMonthChange}
                    disabled={isReadOnly}
                />
            ) : (
                <DatePicker
                    year={year}
                    month={month}
                    day={day}
                    onYearChange={setYear}
                    onMonthChange={setMonth}
                    onDayChange={setDay}
                    disabled={isReadOnly}
                />
            )}

            {/* 时间选择 */}
            {(precision === 'hour' || precision === 'minute') && (
                <TimePicker
                    hour={hour ?? 0}
                    minute={minute ?? 0}
                    onHourChange={setHour}
                    onMinuteChange={setMinute}
                    showShiChenQuickPick={showShiChenQuickPick}
                    allowUnknownTime={allowUnknownTime}
                    isUnknownTime={isUnknownTime}
                    onUnknownTimeChange={onUnknownTimeChange}
                    disabled={isReadOnly}
                />
            )}
        </div>
    );
}
