import React, { useState } from 'react';
import { PLATFORMS } from '../data/demoTrends';
import { SocialPlatform, TrendItem } from '../types/trend';
import { PlatformAppIcon } from './PlatformAppIcon';

export const Sparkline: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data,
  color = 'var(--t7-accent)',
  height = 28,
}) => {
  if (!data || data.length < 2) return null;
  const width = 84;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - 4 - ((val - min) / span) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible shrink-0" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

interface SeriesPoint {
  day: string;
  values: Record<SocialPlatform, number>;
}

const DEFAULT_SERIES: SeriesPoint[] = [
  { day: 'D-6', values: { instagram: 58, facebook: 44, youtube: 62, tiktok: 69, xiaohongshu: 51, threads: 48 } },
  { day: 'D-5', values: { instagram: 63, facebook: 47, youtube: 68, tiktok: 72, xiaohongshu: 54, threads: 56 } },
  { day: 'D-4', values: { instagram: 67, facebook: 50, youtube: 71, tiktok: 75, xiaohongshu: 60, threads: 65 } },
  { day: 'D-3', values: { instagram: 74, facebook: 53, youtube: 79, tiktok: 80, xiaohongshu: 68, threads: 74 } },
  { day: 'D-2', values: { instagram: 81, facebook: 60, youtube: 84, tiktok: 85, xiaohongshu: 77, threads: 83 } },
  { day: 'D-1', values: { instagram: 86, facebook: 66, youtube: 91, tiktok: 88, xiaohongshu: 84, threads: 90 } },
  { day: '今日', values: { instagram: 91, facebook: 74, youtube: 96, tiktok: 90, xiaohongshu: 89, threads: 94 } },
];

export const MultiPlatformLineChart: React.FC<{
  activePlatforms: SocialPlatform[];
  timeRangeLabel: string;
}> = ({ activePlatforms, timeRangeLabel }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 640;
  const height = 240;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const yTicks = [20, 40, 60, 80, 100];

  const getX = (i: number) => padL + (i / (DEFAULT_SERIES.length - 1)) * chartW;
  const getY = (val: number) => padT + ((100 - val) / 100) * chartH;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xs t7-text-subtle">
          跨平台熱度指數軌跡（0–100）· {timeRangeLabel} · 示範基準曲線
        </div>
        {hoverIdx !== null && (
          <div className="text-xs font-mono-num t7-text-muted">
            {DEFAULT_SERIES[hoverIdx].day}：
            {activePlatforms
              .slice(0, 3)
              .map((p) => {
                const meta = PLATFORMS.find((m) => m.id === p);
                return `${meta?.shortName} ${DEFAULT_SERIES[hoverIdx].values[p]}`;
              })
              .join(' · ')}
          </div>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={padL}
                y1={y}
                x2={width - padR}
                y2={y}
                stroke="var(--t7-border)"
                strokeDasharray="3 3"
              />
              <text
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono-num"
                fill="var(--t7-text-subtle)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {DEFAULT_SERIES.map((pt, idx) => (
          <text
            key={pt.day}
            x={getX(idx)}
            y={height - 8}
            textAnchor="middle"
            className="text-[10px] font-mono-num"
            fill="var(--t7-text-subtle)"
          >
            {pt.day}
          </text>
        ))}

        {activePlatforms.map((plat) => {
          const meta = PLATFORMS.find((p) => p.id === plat);
          const color = meta?.brandColor || '#3B82F6';
          const pathD = DEFAULT_SERIES.map((pt, i) => {
            const x = getX(i);
            const y = getY(pt.values[plat]);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(' ');
          return (
            <g key={plat}>
              <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              {DEFAULT_SERIES.map((pt, i) => (
                <circle
                  key={`${plat}-${i}`}
                  cx={getX(i)}
                  cy={getY(pt.values[plat])}
                  r={hoverIdx === i ? 4.5 : 2.5}
                  fill={color}
                />
              ))}
            </g>
          );
        })}

        {hoverIdx !== null && (
          <line
            x1={getX(hoverIdx)}
            y1={padT}
            x2={getX(hoverIdx)}
            y2={height - padB}
            stroke="var(--t7-text-subtle)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}

        {DEFAULT_SERIES.map((pt, idx) => {
          const sliceW = chartW / DEFAULT_SERIES.length;
          return (
            <rect
              key={`hit-${pt.day}`}
              x={getX(idx) - sliceW / 2}
              y={padT}
              width={sliceW}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          );
        })}
      </svg>
    </div>
  );
};

export const PlatformComparisonChart: React.FC<{ trends: TrendItem[] }> = ({ trends }) => {
  const stats = PLATFORMS.map((meta) => {
    const items = trends.filter((t) => t.platform === meta.id);
    const avgViral = items.length
      ? Math.round(items.reduce((acc, i) => acc + i.viralIndex, 0) / items.length)
      : 0;
    const growthItems = items.filter((i) => i.growthRate !== null);
    const avgGrowth = growthItems.length
      ? Math.round(growthItems.reduce((acc, i) => acc + (i.growthRate || 0), 0) / growthItems.length)
      : 0;
    return { meta, count: items.length, avgViral, avgGrowth };
  });

  return (
    <div className="space-y-3">
      {stats.map(({ meta, count, avgViral, avgGrowth }) => (
        <div key={meta.id} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium">
              <PlatformAppIcon platform={meta.id} size="sm" />
              <span>{meta.name}</span>
              <span className="text-xs t7-text-subtle">({count} 筆入榜)</span>
            </div>
            <div className="text-xs font-mono-num t7-text-muted">
              均指 {avgViral} / 100 · 成長 {avgGrowth > 0 ? `+${avgGrowth}%` : '暫無資料'}
            </div>
          </div>
          <div className="h-2.5 w-full rounded-full t7-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(4, avgViral))}%`,
                backgroundColor: meta.brandColor,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
