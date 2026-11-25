import React, { useState } from 'react';
import { ArrowRight, Globe, Sparkles } from 'lucide-react';
import { PLATFORMS } from '../data/demoTrends';
import { AISummaryOutput, PlatformId, RegionId, TrendItem } from '../types/trend';
import { PlatformAppIcon } from './PlatformAppIcon';
import { TrendCard } from './TrendCard';

interface HomeViewProps {
  trends: TrendItem[];
  bookmarkedIds: Set<string>;
  bookmarkedKeywords: string[];
  regionLabel: string;
  region: RegionId;
  onSelectTrend: (item: TrendItem) => void;
  onToggleBookmark: (item: TrendItem) => void;
  onToggleKeywordBookmark: (keyword: string) => void;
  onOpenPlatformRanking: (platform: PlatformId) => void;
  onOpenAnalytics: () => void;
  onOpenKeywordSearch: (keyword: string) => void;
  onRunLiveSearch: () => Promise<void>;
  isLiveSearching: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  trends,
  bookmarkedIds,
  regionLabel,
  region,
  onSelectTrend,
  onToggleBookmark,
  onOpenPlatformRanking,
  onOpenAnalytics,
  onOpenKeywordSearch,
  onRunLiveSearch,
  isLiveSearching,
}) => {
  const [aiSummary, setAiSummary] = useState<AISummaryOutput | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const todayFocus = trends[0];
  const weeklyViral = [...trends].sort((a, b) => b.viralIndex - a.viralIndex).slice(0, 4);
  const fastRising = [...trends]
    .filter((t) => (t.growthRate ?? 0) > 0 || t.rankDelta > 0)
    .sort((a, b) => (b.growthRate ?? 0) - (a.growthRate ?? 0))
    .slice(0, 2);

  const hotKeywords = Array.from(new Set(trends.flatMap((t) => t.keywords))).slice(0, 10);

  const generateAISummary = async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          topTitles: trends.slice(0, 8).map((t) => t.title),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI 摘要生成失敗');
      setAiSummary(data);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : '無法產生 AI 摘要');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Hero + Today's Focus */}
      <section
        className="t7-surface border p-5 overflow-hidden"
        style={{ borderColor: 'var(--t7-border)', background: 'var(--t7-hero-bg)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="text-xs t7-text-subtle">
                {regionLabel} · 最近 7 天跨平台趨勢
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-balance">
                六大社群，一手掌握每週爆紅趨勢
              </h1>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={generateAISummary}
                disabled={loadingSummary}
                className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold t7-accent-btn flex items-center gap-2 hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                {loadingSummary ? 'AI 彙整中...' : 'AI 趨勢摘要'}
              </button>

              <button
                type="button"
                onClick={onRunLiveSearch}
                disabled={isLiveSearching}
                className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 hover:opacity-85 disabled:opacity-60 whitespace-nowrap"
                style={{ borderColor: 'var(--t7-border)', backgroundColor: 'var(--t7-surface)' }}
              >
                <Globe className="w-4 h-4" />
                {isLiveSearching ? '搜尋中...' : 'Google 即時查'}
              </button>
            </div>
          </div>

          {todayFocus && (
            <button
              type="button"
              onClick={() => onSelectTrend(todayFocus)}
              className="lg:col-span-5 t7-surface border p-4 text-left flex flex-col justify-between space-y-2.5 hover:opacity-95"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              <div className="flex items-center justify-between text-xs t7-text-subtle">
                <span className="font-semibold flex items-center gap-2" style={{ color: 'var(--t7-accent)' }}>
                  <PlatformAppIcon platform={todayFocus.platform} size="sm" />
                  今日焦點 #1
                </span>
                <span className="font-mono-num">指數 {todayFocus.viralIndex}</span>
              </div>
              <div className="text-sm md:text-base font-bold leading-snug line-clamp-2">
                {todayFocus.title}
              </div>
              <div className="text-xs t7-text-subtle flex items-center justify-between">
                <span className="truncate">{todayFocus.creatorName}</span>
                <span className="font-semibold shrink-0" style={{ color: 'var(--t7-accent)' }}>
                  查看分析 →
                </span>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* AI Summary Output */}
      {loadingSummary && (
        <div className="t7-surface border p-5 space-y-3" style={{ borderColor: 'var(--t7-border)' }}>
          <div className="h-5 w-40 rounded t7-skeleton" />
          <div className="h-16 w-full rounded t7-skeleton" />
        </div>
      )}

      {summaryError && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-500">
          {summaryError}
        </div>
      )}

      {aiSummary && !loadingSummary && (
        <section className="t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">AI 今日與每週趨勢摘要</h2>
            <span className="text-xs t7-text-subtle">Gemini AI</span>
          </div>
          <p className="text-sm leading-relaxed t7-text-muted">{aiSummary.dailySummary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl t7-surface-muted space-y-1.5">
              <div className="text-xs font-semibold t7-text-subtle">本週關鍵變化</div>
              <ul className="space-y-1 text-xs list-disc list-inside">
                {aiSummary.weeklyHighlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
            <div className="p-3.5 rounded-xl t7-surface-muted space-y-1.5">
              <div className="text-xs font-semibold t7-text-subtle">創作靈感推薦</div>
              {aiSummary.personalizedIdeas.slice(0, 3).map((idea, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold">{idea.title}</span>
                  <span className="t7-text-subtle"> · {idea.format}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Six Platforms App Icon Row */}
      <section className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpenPlatformRanking(p.id)}
            className="t7-surface border py-3 px-2 flex flex-col items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            <PlatformAppIcon platform={p.id} size="lg" />
            <span className="text-xs font-semibold truncate max-w-full">{p.name}</span>
          </button>
        ))}
      </section>

      {/* Fast Rising */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">快速飆升</h2>
          <button
            type="button"
            onClick={onOpenAnalytics}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--t7-accent)' }}
          >
            趨勢圖表
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {fastRising.map((item) => (
            <TrendCard
              key={item.id}
              item={item}
              compact
              isBookmarked={bookmarkedIds.has(item.id)}
              onSelect={onSelectTrend}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>

      {/* Weekly Viral Top 4 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">本週爆紅</h2>
          <button
            type="button"
            onClick={() => onOpenPlatformRanking('all')}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--t7-accent)' }}
          >
            完整排行榜
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {weeklyViral.map((item) => (
            <TrendCard
              key={item.id}
              item={item}
              isBookmarked={bookmarkedIds.has(item.id)}
              onSelect={onSelectTrend}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>

      {/* Clean Hot Keywords */}
      <section className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold t7-text-subtle mr-1">熱門關鍵字：</span>
        {hotKeywords.map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => onOpenKeywordSearch(kw)}
            className="min-h-[34px] px-3 py-1 rounded-lg t7-surface border text-xs font-medium hover:opacity-80"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            {kw}
          </button>
        ))}
      </section>
    </div>
  );
};
