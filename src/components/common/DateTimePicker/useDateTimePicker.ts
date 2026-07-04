/**
 * DateTimePicker 状态管理 Hook
 *
 * 封装日期时间状态中的常见逻辑：
 * - 年月日联动与边界修正
 * - 历法切换时的日期归一化
 * - 闰月自动取消/恢复
 */

import { useCallback, useMemo } from 'react';
import { Lunar, Solar } from 'lunar-javascript';
import type { CalendarType, DateTimeValue } from './types';
import { getDayCount } from '@/lib/date-utils';

interface UseDateTimePickerOptions {
    value: DateTimeValue;
    onChange: (value: DateTimeValue) => void;
    calendarType?: CalendarType;
}

export function useDateTimePicker({ value, onChange, calendarType = 'solar' }: UseDateTimePickerOptions) {
    const { year, month, day, hour = 0, minute = 0 } = value;

    const maxDay = useMemo(() => {
        return getDayCount(calendarType, year, month, false);
    }, [calendarType, year, month]);

    const clampedDay = useMemo(() => {
        if (day < 1) return 1;
        if (day > maxDay) return maxDay;
        return day;
    }, [day, maxDay]);

    const setDateField = useCallback(
        (field: keyof DateTimeValue, fieldValue: number) => {
            const next = { ...value, [field]: fieldValue };
            onChange(next);
        },
        [value, onChange]
    );

    /**
     * 设置年份，并修正日期边界
     */
    const setYear = useCallback(
        (nextYear: number) => {
            const nextMaxDay = getDayCount(calendarType, nextYear, month, false);
            onChange({
                ...value,
                year: nextYear,
                day: Math.min(day, nextMaxDay),
            });
        },
        [value, onChange, calendarType, month, day]
    );

    /**
     * 设置月份，并修正日期边界
     */
    const setMonth = useCallback(
        (nextMonth: number) => {
            const nextMaxDay = getDayCount(calendarType, year, nextMonth, false);
            onChange({
                ...value,
                month: nextMonth,
                day: Math.min(day, nextMaxDay),
            });
        },
        [value, onChange, calendarType, year, day]
    );

    /**
     * 设置日期
     */
    const setDay = useCallback(
        (nextDay: number) => {
            onChange({ ...value, day: nextDay });
        },
        [value, onChange]
    );

    /**
     * 设置小时
     */
    const setHour = useCallback(
        (nextHour: number) => {
            onChange({ ...value, hour: nextHour });
        },
        [value, onChange]
    );

    /**
     * 设置分钟
     */
    const setMinute = useCallback(
        (nextMinute: number) => {
            onChange({ ...value, minute: nextMinute });
        },
        [value, onChange]
    );

    /**
     * 历法切换时，将当前日期转换为对应历法的等价日期
     */
    const convertToCalendar = useCallback(
        (targetCalendar: CalendarType) => {
            if (targetCalendar === calendarType) return;

            try {
                if (targetCalendar === 'lunar') {
                    const solar = Solar.fromYmd(year, month, day);
                    const lunar = solar.getLunar();
                    onChange({
                        ...value,
                        year: lunar.getYear(),
                        month: Math.abs(lunar.getMonth()),
                        day: lunar.getDay(),
                    });
                } else {
                    const lunarMonth = month;
                    const lunar = Lunar.fromYmd(year, lunarMonth, day);
                    const solar = lunar.getSolar();
                    onChange({
                        ...value,
                        year: solar.getYear(),
                        month: solar.getMonth(),
                        day: solar.getDay(),
                    });
                }
            } catch {
                // 转换失败时保持原值，由调用方处理
            }
        },
        [value, onChange, calendarType, year, month, day]
    );

    return {
        year,
        month,
        day: clampedDay,
        hour,
        minute,
        maxDay,
        setYear,
        setMonth,
        setDay,
        setHour,
        setMinute,
        setDateField,
        convertToCalendar,
    };
}
