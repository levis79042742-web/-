import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PLATFORMS, TIME_RANGES } from '../data/demoTrends';
import { SocialPlatform, TimeRangeId, TrendItem } from '../types/trend';
import { PlatformAppIcon } from './PlatformAppIcon';
import { MultiPlatformLineChart, PlatformComparisonChart } from './TrendCharts';

interface AnalyticsViewProps {
  trends: TrendItem[];
  selectedTimeRange: TimeRangeId;
  onChangeTimeRange: (t: TimeRangeId) => void;
  onSearchKeyword: (kw: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trends,
  selectedTimeRange,
  onChangeTimeRange,
  onSearchKeyword,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    'youtube',
    'threads',
    'instagram',
    'tiktok',
  ]);
  const [aiCrossCompare, setAiCrossCompare] = useState<string | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const togglePlatform = (id: SocialPlatform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((p) => p !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const keywordStats = useMemo(() => {
    const map = new Map<string, { count: number; maxViral: number; platforms: Set<string> }>();
    for (const item of trends) {
      for (const kw of item.keywords) {
        const entry = map.get(kw) || { count: 0, maxViral: 0, platforms: new Set<string>() };
        entry.count += 1;
        entry.maxViral = Math.max(entry.maxViral, item.viralIndex);
        entry.platforms.add(item.platform);
        map.set(kw, entry);
      }
    }
    return Array.from(map.entries())
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        maxViral: data.maxViral,
        platforms: Array.from(data.platforms),
      }))
      .sort((a, b) => b.maxViral - a.maxViral)
      .slice(0, 10);
  }, [trends]);

  const timeRangeLabel = TIME_RANGES.find((t) => t.id === selectedTimeRange)?.label || '最近 7 天';

  const runCrossPlatformCompare = async () => {
    setLoadingCompare(true);
    try {
      const topSummary = trends
        .slice(0, 6)
        .map((t) => `[${t.platform}] ${t.title}`)
        .join('；');
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '本週六大社群跨平台話題流動總體比對',
          platform: 'IG / FB / YouTube / TikTok / 小紅書 / Threads',
          category: '跨平台綜合趨勢',
          summary: topSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '分析失敗');
      setAiCrossCompare(`${data.crossPlatformComparison}\n\n延伸趨勢預測：${data.nextWavePrediction}`);
    } catch (err) {
      setAiCrossCompare(err instanceof Error ? err.message : '分析失敗');
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold">趨勢數據分析</h1>
          <p className="text-xs t7-text-subtle">熱度折線軌跡、成長趨勢、跨平台比較與熱門關鍵字分析</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl t7-surface-muted border" style={{ borderColor: 'var(--t7-border)' }}>
          {TIME_RANGES.map((tr) => (
            <button
              key={tr.id}
              type="button"
              onClick={() => onChangeTimeRange(tr.id)}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTimeRange === tr.id ? 't7-accent-btn' : 't7-text-muted'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line Chart Card */}
      <section className="t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">跨平台熱度折線圖</h2>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => {
              const active = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-opacity ${
                    active ? 'opacity-100' : 'opacity-45'
                  }`}
                  style={{ borderColor: 'var(--t7-border)' }}
                >
                  <PlatformAppIcon platform={p.id} size="xs" />
                  {p.shortName}
                </button>
              );
            })}
          </div>
        </div>

        <MultiPlatformLineChart activePlatforms={selectedPlatforms} timeRangeLabel={timeRangeLabel} />
      </section>

      {/* Two-Column Platform Comparison & Keyword Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-6 t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
          <h2 className="text-base font-bold">跨平台熱度與成長比較</h2>
          <PlatformComparisonChart trends={trends} />
        </section>

        <section className="lg:col-span-6 t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
          <h2 className="text-base font-bold">熱門關鍵字分析</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b t7-text-subtle text-left" style={{ borderColor: 'var(--t7-border)' }}>
                  <th className="py-2 font-semibold">關鍵字</th>
                  <th className="py-2 font-semibold">跨平台數</th>
                  <th className="py-2 font-semibold text-right">最高爆紅指數</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--t7-border)' }}>
                {keywordStats.map((row) => (
                  <tr key={row.keyword} className="hover:opacity-80">
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => onSearchKeyword(row.keyword)}
                        className="font-medium hover:underline text-left"
                      >
                        {row.keyword}
                      </button>
                    </td>
                    <td className="py-2.5 t7-text-muted">{row.platforms.join(', ')}</td>
                    <td className="py-2.5 text-right font-mono-num font-bold">{row.maxViral} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* AI Cross-Platform Topic Comparison */}
      <section className="t7-surface border p-5 space-y-3" style={{ borderColor: 'var(--t7-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">AI 跨平台話題比對與下波預測</h2>
            <p className="text-xs t7-text-subtle">分析話題如何在 Threads、IG、TikTok、YouTube、小紅書與 FB 之間發酵遷移</p>
          </div>
          <button
            type="button"
            onClick={runCrossPlatformCompare}
            disabled={loadingCompare}
            className="min-h-[42px] px-4 py-2 rounded-xl t7-accent-btn text-xs font-semibold flex items-center gap-2 disabled:opacity-60 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            {loadingCompare ? 'AI 比對中...' : '產生 AI 跨平台比對'}
          </button>
        </div>

        {loadingCompare && <div className="h-24 rounded-xl t7-skeleton" />}

        {aiCrossCompare && !loadingCompare && (
          <div className="p-4 rounded-xl t7-surface-muted text-sm leading-relaxed whitespace-pre-line">
            {aiCrossCompare}
          </div>
        )}
      </section>
    </div>
  );
};
