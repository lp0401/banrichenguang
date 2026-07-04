/**
 * 日期选择器
 *
 * 年/月/日三列 <select> 联动，支持公历/农历切换与闰月。
 */

'use client';

import { LunarYear } from 'lunar-javascript';
import { LUNAR_MONTH_NAMES, YEAR_OPTIONS, MONTH_OPTIONS } from '@/components/bazi/form/options';
import type { CalendarType } from './types';
import { getDayCount } from '@/lib/date-utils';

interface DatePickerProps {
    year: number;
    month: number;
    day: number;
    onYearChange: (year: number) => void;
    onMonthChange: (month: number) => void;
    onDayChange: (day: number) => void;
    calendarType?: CalendarType;
    isLeapMonth?: boolean;
    onLeapMonthChange?: (isLeap: boolean) => void;
    disabled?: boolean;
}

export function DatePicker({
    year,
    month,
    day,
    onYearChange,
    onMonthChange,
    onDayChange,
    calendarType = 'solar',
    isLeapMonth = false,
    onLeapMonthChange,
    disabled = false,
}: DatePickerProps) {
    const dayCount = getDayCount(calendarType, year, month, isLeapMonth);
    const dayOptions = Array.from({ length: dayCount }, (_, i) => i + 1);

    // 农历模式下检查当前年份是否有闰月
    const leapMonth = calendarType === 'lunar' ? LunarYear.fromYear(year).getLeapMonth() : 0;
    const hasLeapMonth = leapMonth === month;

    const selectClassName = `w-full px-2 md:px-3 py-1.5 md:py-2 border border-border rounded-md bg-transparent text-sm text-foreground
        focus:outline-none focus:ring-2 focus:ring-[#2383e2]/20 focus:border-[#2383e2]
        disabled:opacity-50 disabled:cursor-not-allowed`;

    return (
        <div className="space-y-2 md:space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs text-foreground/60 mb-1">年</label>
                    <select
                        value={year}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                        disabled={disabled}
                        className={selectClassName}
                    >
                        {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-foreground/60 mb-1">月</label>
                    <select
                        value={month}
                        onChange={(e) => onMonthChange(Number(e.target.value))}
                        disabled={disabled}
                        className={selectClassName}
                    >
                        {MONTH_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                                {calendarType === 'lunar' ? LUNAR_MONTH_NAMES[m] : `${m}月`}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-foreground/60 mb-1">日</label>
                    <select
                        value={Math.min(day, dayCount)}
                        onChange={(e) => onDayChange(Number(e.target.value))}
                        disabled={disabled}
                        className={selectClassName}
                    >
                        {dayOptions.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 闰月开关（仅农历且当前月份为闰月时显示） */}
            {calendarType === 'lunar' && hasLeapMonth && onLeapMonthChange && (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isLeapMonth}
                        onChange={(e) => onLeapMonthChange(e.target.checked)}
                        disabled={disabled}
                        className="w-4 h-4 text-[#2383e2] border-border rounded focus:ring-[#2383e2]"
                    />
                    <span className="text-sm text-foreground/60">闰月</span>
                </label>
            )}
        </div>
    );
}
