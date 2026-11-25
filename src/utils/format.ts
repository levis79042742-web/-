import { PLATFORMS } from '../data/demoTrends';
import { PlatformMeta, SocialPlatform } from '../types/trend';

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '暫無資料';
  }
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)} 億`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)} 萬`;
  }
  return value.toLocaleString('zh-TW');
}

export function formatGrowth(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '暫無資料';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

export function formatRankDelta(delta: number): { label: string; tone: 'up' | 'down' | 'new' | 'flat' } {
  if (delta >= 999) return { label: '新進榜', tone: 'new' };
  if (delta > 0) return { label: `↑ ${delta}`, tone: 'up' };
  if (delta < 0) return { label: `↓ ${Math.abs(delta)}`, tone: 'down' };
  return { label: '— 持平', tone: 'flat' };
}

export function getPlatformMeta(id: SocialPlatform): PlatformMeta {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[0];
}
