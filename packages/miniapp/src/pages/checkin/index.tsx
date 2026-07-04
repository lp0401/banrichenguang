import Button from '@/components/Button';
import { useState, useCallback } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { get, post } from '@/utils/request';
import { formatMembershipLabel } from '@/lib/membership';
import { View, Text } from '@tarojs/components';

interface CheckinStatus {
  canCheckin: boolean;
  lastCheckin: string | null;
  todayCheckedIn: boolean;
  rewardRange: [number, number];
  currentCredits: number;
  creditLimit: number;
  blockedReason: 'already_checked_in' | 'credit_cap_reached' | null;
}

interface CheckinStats {
  totalDays: number;
  thisMonthDays: number;
  totalCreditsEarned: number;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export default function CheckinIndexPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [calendar, setCalendar] = useState<string[]>([]);
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [statusRes, calendarRes, statsRes] = await Promise.all([
        get<{ status: CheckinStatus }>('/api/checkin', { action: 'status' }),
        get<{ calendar: string[] }>('/api/checkin', { action: 'calendar', year, month }),
        get<{ stats: CheckinStats }>('/api/checkin', { action: 'stats' }),
      ]);
      setStatus(statusRes.status);
      setCalendar(calendarRes.calendar);
      setStats(statsRes.stats);
    } catch {
      // request 已 toast
    }
  }, [year, month]);

  useDidShow(() => {
    void loadAll();
  });

  const handleCheckin = async () => {
    if (!status?.canCheckin) return;
    setCheckingIn(true);
    try {
      const res = await post<{
        result: {
          rewardCredits: number;
          credits: number;
          creditLimit: number;
        };
      }>('/api/checkin');
      Taro.showToast({
        title: `签到成功，获得 ${res.result.rewardCredits} 积分`,
        icon: 'success',
      });
      await loadAll();
    } catch {
      // request 已 toast
    } finally {
      setCheckingIn(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: JSX.Element[] = [];
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    for (let i = 0; i < 7; i++) {
      cells.push(
        <View
          key={`h-${i}`}
          style={{
            width: '14.28%',
            textAlign: 'center',
            padding: '16rpx 0',
            color: 'var(--text-secondary)',
            fontSize: '26rpx',
          }}
        >
          {weekDays[i]}
        </View>
      );
    }

    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`e-${i}`} style={{ width: '14.28%' }} />);
    }

    const today = new Date();
    const isToday = (d: number) =>
      today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const checked = calendar.includes(dateStr);
      cells.push(
        <View
          key={`d-${d}`}
          style={{
            width: '14.28%',
            textAlign: 'center',
            padding: '20rpx 0',
            fontSize: '28rpx',
            color: isToday(d) ? 'var(--primary-color)' : 'var(--text-primary)',
            fontWeight: isToday(d) ? 'bold' : 'normal',
            position: 'relative',
          }}
        >
          {d}
          {checked && (
            <View
              style={{
                position: 'absolute',
                bottom: '8rpx',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12rpx',
                height: '12rpx',
                borderRadius: '50%',
                background: 'var(--primary-color)',
              }}
            />
          )}
        </View>
      );
    }

    return cells;
  };

  const buttonText = status
    ? status.todayCheckedIn
      ? '今日已签到'
      : status.blockedReason === 'credit_cap_reached'
        ? '积分已达上限'
        : `立即签到（+${status.rewardRange[0]}-${status.rewardRange[1]} 积分）`
    : '立即签到';

  return (
    <View className="container">
      <View className="card">
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', marginBottom: '32rpx' }}>
          每日签到
        </Text>

        {status && (
          <View
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
              borderRadius: '16rpx',
              padding: '40rpx',
              marginBottom: '32rpx',
            }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '30rpx', color: 'white' }}>{formatMembershipLabel('free')}</Text>
              <Text style={{ fontSize: '48rpx', fontWeight: 'bold', color: 'white' }}>{status.currentCredits}</Text>
            </View>
            <Text style={{ fontSize: '26rpx', color: 'rgba(255,255,255,0.9)' }}>
              积分上限 {status.creditLimit}
            </Text>
          </View>
        )}

        <Button
          onClick={handleCheckin}
          loading={checkingIn}
          disabled={!status?.canCheckin || checkingIn}
          className="btn-primary"
          style={{
            marginBottom: '32rpx',
            opacity: !status?.canCheckin ? 0.6 : 1,
          }}
        >
          {buttonText}
        </Button>

        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '24rpx',
          }}
        >
          <Text style={{ fontSize: '32rpx', fontWeight: 'bold' }}>
            {year} 年 {month} 月
          </Text>
          <View style={{ display: 'flex', gap: '16rpx' }}>
            <Text
              onClick={() => {
                if (month === 1) {
                  setYear(year - 1);
                  setMonth(12);
                } else {
                  setMonth(month - 1);
                }
              }}
              style={{ color: 'var(--primary-color)', fontSize: '28rpx' }}
            >
              上月
            </Text>
            <Text
              onClick={() => {
                if (month === 12) {
                  setYear(year + 1);
                  setMonth(1);
                } else {
                  setMonth(month + 1);
                }
              }}
              style={{ color: 'var(--primary-color)', fontSize: '28rpx' }}
            >
              下月
            </Text>
          </View>
        </View>

        <View style={{ display: 'flex', flexWrap: 'wrap', background: '#F9FAFB', borderRadius: '12rpx', padding: '16rpx' }}>
          {renderCalendar()}
        </View>

        {stats && (
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24rpx',
              background: '#FAFAFA',
              padding: '24rpx',
              borderRadius: '12rpx',
            }}
          >
            {[
              { label: '累计签到', value: stats.totalDays },
              { label: '本月签到', value: stats.thisMonthDays },
              { label: '累计积分', value: stats.totalCreditsEarned },
            ].map((item) => (
              <View key={item.label} style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '36rpx', fontWeight: 'bold', color: 'var(--primary-color)' }}>{item.value}</Text>
                <Text style={{ fontSize: '24rpx', color: 'var(--text-secondary)', marginTop: '8rpx' }}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
