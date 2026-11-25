import React, { useMemo, useState } from 'react';
import { Globe, RotateCcw, Search } from 'lucide-react';
import { CATEGORIES, PLATFORMS, REGIONS, TIME_RANGES } from '../data/demoTrends';
import { CategoryId, PlatformId, RegionId, TimeRangeId, TrendItem } from '../types/trend';
import { PlatformAppIcon } from './PlatformAppIcon';
import { TrendCard } from './TrendCard';

interface RankingsViewProps {
  trends: TrendItem[];
  selectedPlatform: PlatformId;
  selectedTimeRange: TimeRangeId;
  selectedRegion: RegionId;
  selectedCategory: CategoryId;
  searchQuery: string;
  bookmarkedIds: Set<string>;
  onChangePlatform: (p: PlatformId) => void;
  onChangeTimeRange: (t: TimeRangeId) => void;
  onChangeRegion: (r: RegionId) => void;
  onChangeCategory: (c: CategoryId) => void;
  onOpenSearch: () => void;
  onClearSearch: () => void;
  onSelectTrend: (item: TrendItem) => void;
  onToggleBookmark: (item: TrendItem) => void;
  onRunLiveSearch: () => Promise<void>;
  isLiveSearching: boolean;
}

type SortKey = 'viralIndex' | 'growthRate' | 'views' | 'likes';

export const RankingsView: React.FC<RankingsViewProps> = ({
  trends,
  selectedPlatform,
  selectedTimeRange,
  selectedRegion,
  selectedCategory,
  searchQuery,
  bookmarkedIds,
  onChangePlatform,
  onChangeTimeRange,
  onChangeRegion,
  onChangeCategory,
  onOpenSearch,
  onClearSearch,
  onSelectTrend,
  onToggleBookmark,
  onRunLiveSearch,
  isLiveSearching,
}) => {
  const [sortBy, setSortBy] = useState<SortKey>('viralIndex');
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = trends.filter((item) => {
      if (selectedPlatform !== 'all' && item.platform !== selectedPlatform) return false;
      if (selectedCategory !== '全部' && item.category !== selectedCategory) return false;
      if (selectedRegion !== 'GLOBAL' && item.region !== selectedRegion && item.dataSourceType === 'demo' && selectedRegion !== 'TW') {
        // Allow demo TW items when viewing TW or GLOBAL, or matching region
        if (item.region !== selectedRegion) return false;
      }
      if (q) {
        const hay = `${item.title} ${item.summary} ${item.creatorName} ${item.keywords.join(' ')} ${item.hashtags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'viralIndex') return b.viralIndex - a.viralIndex;
      if (sortBy === 'growthRate') return (b.growthRate ?? -1) - (a.growthRate ?? -1);
      if (sortBy === 'views') return (b.views ?? -1) - (a.views ?? -1);
      return (b.likes ?? -1) - (a.likes ?? -1);
    });
  }, [trends, selectedPlatform, selectedCategory, selectedRegion, searchQuery, sortBy]);

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold">TOP 100 爆紅排行榜</h1>
          <p className="text-xs t7-text-subtle">
            支援六大社群跨平台綜合與單平台篩選 · 無法取得的數據顯示「暫無資料」
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 whitespace-nowrap"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            <Search className="w-4 h-4" />
            {searchQuery ? `搜尋：${searchQuery}` : '跨平台搜尋'}
          </button>

          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="min-h-[42px] px-3 py-2 rounded-xl t7-surface-muted text-xs font-medium flex items-center gap-1 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清除
            </button>
          )}

          <button
            type="button"
            onClick={onRunLiveSearch}
            disabled={isLiveSearching}
            className="min-h-[42px] px-3.5 py-2 rounded-xl t7-accent-btn text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
          >
            <Globe className="w-4 h-4" />
            {isLiveSearching ? '即時擷取中...' : 'Google 即時查'}
          </button>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => onChangePlatform('all')}
          className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            selectedPlatform === 'all' ? 't7-accent-btn' : 't7-surface border t7-text-muted'
          }`}
          style={selectedPlatform === 'all' ? undefined : { borderColor: 'var(--t7-border)' }}
        >
          跨平台綜合
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChangePlatform(p.id)}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-2 transition-colors ${
              selectedPlatform === p.id ? 't7-accent-btn' : 't7-surface border t7-text-muted'
            }`}
            style={selectedPlatform === p.id ? undefined : { borderColor: 'var(--t7-border)' }}
          >
            <PlatformAppIcon platform={p.id} size="sm" />
            {p.name}
          </button>
        ))}
      </div>

      {/* Filter Bar: Time Range, Region, Category, Sort */}
      <div className="t7-surface border p-3.5 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ borderColor: 'var(--t7-border)' }}>
        <label className="space-y-1 text-xs">
          <span className="t7-text-subtle block">時間範圍</span>
          <select
            value={selectedTimeRange}
            onChange={(e) => onChangeTimeRange(e.target.value as TimeRangeId)}
            className="w-full min-h-[40px] px-2.5 rounded-lg border t7-surface-muted text-xs font-medium outline-none"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            {TIME_RANGES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs">
          <span className="t7-text-subtle block">地區篩選</span>
          <select
            value={selectedRegion}
            onChange={(e) => onChangeRegion(e.target.value as RegionId)}
            className="w-full min-h-[40px] px-2.5 rounded-lg border t7-surface-muted text-xs font-medium outline-none"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs">
          <span className="t7-text-subtle block">內容分類（13 類）</span>
          <select
            value={selectedCategory}
            onChange={(e) => onChangeCategory(e.target.value as CategoryId)}
            className="w-full min-h-[40px] px-2.5 rounded-lg border t7-surface-muted text-xs font-medium outline-none"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs">
          <span className="t7-text-subtle block">熱度排序</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="w-full min-h-[40px] px-2.5 rounded-lg border t7-surface-muted text-xs font-medium outline-none"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            <option value="viralIndex">AI 爆紅指數（高到低）</option>
            <option value="growthRate">熱度成長率（高到低）</option>
            <option value="views">觀看次數（高到低）</option>
            <option value="likes">按讚數（高到低）</option>
          </select>
        </label>
      </div>

      {/* Results */}
      {isLiveSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-2xl t7-skeleton" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="t7-surface border p-8 text-center space-y-3" style={{ borderColor: 'var(--t7-border)' }}>
          <p className="text-sm font-medium">目前篩選條件下尚無符合的榜單內容</p>
          <p className="text-xs t7-text-subtle">您可以放寬分類/地區條件，或使用「Google 即時查」取得最新公開話題。</p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onChangePlatform('all');
                onChangeCategory('全部');
                onChangeRegion('TW');
                onClearSearch();
              }}
              className="min-h-[42px] px-4 py-2 rounded-xl border text-xs font-medium"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              重設所有篩選
            </button>
            <button
              type="button"
              onClick={onRunLiveSearch}
              className="min-h-[42px] px-4 py-2 rounded-xl t7-accent-btn text-xs font-semibold"
            >
              Google 搜尋即時查
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayed.map((item, idx) => (
              <TrendCard
                key={item.id}
                item={{ ...item, rank: idx + 1 }}
                isBookmarked={bookmarkedIds.has(item.id)}
                onSelect={onSelectTrend}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 8)}
                className="min-h-[44px] px-6 py-2.5 rounded-xl border text-sm font-medium hover:opacity-85"
                style={{ borderColor: 'var(--t7-border)' }}
              >
                載入更多排行（剩餘 {filtered.length - visibleCount} 筆）
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
