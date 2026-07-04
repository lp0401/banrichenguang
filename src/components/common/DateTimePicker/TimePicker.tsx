/**
 * 时间选择器
 *
 * 时/分两列 <select>，支持 12 时辰快捷选择、不知时辰开关。
 */

'use client';

import { HOUR_OPTIONS } from '@/components/bazi/form/options';

interface TimePickerProps {
    hour: number;
    minute: number;
    onHourChange: (hour: number) => void;
    onMinuteChange: (minute: number) => void;
    showShiChenQuickPick?: boolean;
    allowUnknownTime?: boolean;
    isUnknownTime?: boolean;
    onUnknownTimeChange?: (unknown: boolean) => void;
    disabled?: boolean;
}

const HOUR_SELECT_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_SELECT_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

export function TimePicker({
    hour,
    minute,
    onHourChange,
    onMinuteChange,
    showShiChenQuickPick = false,
    allowUnknownTime = false,
    isUnknownTime = false,
    onUnknownTimeChange,
    disabled = false,
}: TimePickerProps) {
    const selectClassName = `w-full px-2 md:px-3 py-1.5 md:py-2 border border-border rounded-md bg-transparent text-sm text-foreground
        focus:outline-none focus:ring-2 focus:ring-[#2383e2]/20 focus:border-[#2383e2]
        disabled:opacity-50 disabled:cursor-not-allowed`;

    const safeHour = Math.max(0, Math.min(23, hour));
    const safeMinute = Math.max(0, Math.min(59, minute));

    return (
        <div className="space-y-4">
            {/* 不知时辰开关 */}
            {allowUnknownTime && onUnknownTimeChange && (
                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold uppercase tracking-wider text-foreground/60">
                        {isUnknownTime ? '不知时辰' : '已知时辰'}
                    </span>
                    <div
                        onClick={() => !disabled && onUnknownTimeChange(!isUnknownTime)}
                        className={`
                            relative w-10 h-5 rounded-full transition-all duration-150 ease-out flex items-center
                            ${!isUnknownTime ? 'bg-[#2383e2]' : 'bg-background-secondary'}
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <div
                            className={`
                                absolute w-4 h-4 bg-background rounded-full shadow-sm
                                transition-all duration-150
                                ${!isUnknownTime ? 'translate-x-5.5' : 'translate-x-0.5'}
                            `}
                        />
                    </div>
                </label>
            )}

            {!isUnknownTime && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-foreground/60 mb-1">时</label>
                            <select
                                value={safeHour}
                                onChange={(e) => onHourChange(Number(e.target.value))}
                                disabled={disabled}
                                className={selectClassName}
                            >
                                {HOUR_SELECT_OPTIONS.map((h) => (
                                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-foreground/60 mb-1">分</label>
                            <select
                                value={safeMinute}
                                onChange={(e) => onMinuteChange(Number(e.target.value))}
                                disabled={disabled}
                                className={selectClassName}
                            >
                                {MINUTE_SELECT_OPTIONS.map((m) => (
                                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 时辰快捷选择 */}
                    {showShiChenQuickPick && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                                    快捷选择时辰
                                </label>
                                <span className="text-[10px] font-medium text-foreground/30">
                                    点击选择将自动修正时间
                                </span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                {HOUR_OPTIONS.map(({ value, name, time }) => {
                                    const isSelected = safeHour === value && safeMinute === 0;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => {
                                                onHourChange(value);
                                                onMinuteChange(0);
                                            }}
                                            disabled={disabled}
                                            className={`
                                                relative overflow-hidden
                                                py-2 px-1 rounded-md border text-sm transition-all duration-150
                                                flex flex-col items-center justify-center gap-0.5
                                                ${isSelected
                                                    ? 'bg-[#2383e2] text-white border-[#2383e2]'
                                                    : 'bg-transparent border-border text-foreground hover:bg-background-secondary'
                                                }
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                            `}
                                        >
                                            <span className={`font-bold ${isSelected ? 'text-white' : ''}`}>
                                                {name}
                                            </span>
                                            <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-foreground/40 font-medium'}`}>
                                                {time}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
