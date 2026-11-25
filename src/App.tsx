import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bookmark,
  FolderCode,
  Home,
  Palette,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { AIStudioView } from './components/AIStudioView';
import { AnalyticsView } from './components/AnalyticsView';
import { BookmarksView } from './components/BookmarksView';
import { FlutterKitModal } from './components/FlutterKitModal';
import { HomeView } from './components/HomeView';
import { RankingsView } from './components/RankingsView';
import { SearchOverlay } from './components/SearchOverlay';
import { SettingsView } from './components/SettingsView';
import { TrendDetailModal } from './components/TrendDetailModal';
import { DEMO_TRENDS, REGIONS, THEMES } from './data/demoTrends';
import {
  AppTabId,
  CategoryId,
  NotificationSettings,
  PlatformId,
  RegionId,
  SavedAIContent,
  ThemeId,
  TimeRangeId,
  TrendItem,
} from './types/trend';

const STORAGE_KEYS = {
  theme: 'trend7_theme_v2',
  region: 'trend7_region_v1',
  bookmarks: 'trend7_bookmarks_v1',
  keywords: 'trend7_keywords_v1',
  savedAi: 'trend7_saved_ai_v1',
  history: 'trend7_search_history_v1',
  notifications: 'trend7_notifications_v1',
  cachedLive: 'trend7_cached_live_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTabId>('home');
  const [theme, setTheme] = useState<ThemeId>(() => readStorage(STORAGE_KEYS.theme, 'dark-tech'));
  const [region, setRegion] = useState<RegionId>(() => readStorage(STORAGE_KEYS.region, 'TW'));
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeId>('7d');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const [trends, setTrends] = useState<TrendItem[]>(() => {
    const cached = readStorage<TrendItem[]>(STORAGE_KEYS.cachedLive, []);
    return cached.length > 0 ? cached : DEMO_TRENDS;
  });
  const [dataMode, setDataMode] = useState<'demo' | 'live_search' | 'official_api'>(() => {
    const cached = readStorage<TrendItem[]>(STORAGE_KEYS.cachedLive, []);
    return cached.length > 0 ? cached[0].dataSourceType : 'demo';
  });
  const [liveGroundingLinks, setLiveGroundingLinks] = useState<{ title: string; uri: string }[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [bookmarkedTrends, setBookmarkedTrends] = useState<TrendItem[]>(() =>
    readStorage(STORAGE_KEYS.bookmarks, [])
  );
  const [bookmarkedKeywords, setBookmarkedKeywords] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.keywords, ['台北美食', 'AI 工作流'])
  );
  const [savedAIContents, setSavedAIContents] = useState<SavedAIContent[]>(() =>
    readStorage(STORAGE_KEYS.savedAi, [])
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.history, ['台灣夜市美食', 'AI 剪輯'])
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(() =>
    readStorage(STORAGE_KEYS.notifications, {
      dailyHotEnabled: true,
      weeklyRankingEnabled: true,
      keywordAlertEnabled: true,
      alertKeywords: ['AI 科技', '台灣美食'],
      customTime: '09:00',
      updateFrequency: 'daily',
    })
  );

  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFlutterKitOpen, setIsFlutterKitOpen] = useState(false);
  const [aiPreselectedTopic, setAiPreselectedTopic] = useState('');
  const [showThemeQuickMenu, setShowThemeQuickMenu] = useState(false);

  // Sync theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark-tech' || theme === 'purple-ai') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.region, JSON.stringify(region));
  }, [region]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarkedTrends));
  }, [bookmarkedTrends]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.keywords, JSON.stringify(bookmarkedKeywords));
  }, [bookmarkedKeywords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.savedAi, JSON.stringify(savedAIContents));
  }, [savedAIContents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  const bookmarkedIds = useMemo(
    () => new Set(bookmarkedTrends.map((t) => t.id)),
    [bookmarkedTrends]
  );

  const regionLabel = REGIONS.find((r) => r.id === region)?.label || '台灣';

  const recordSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setSearchHistory((prev) => [clean, ...prev.filter((t) => t !== clean)].slice(0, 12));
  };

  const handleToggleBookmark = (item: TrendItem) => {
    setBookmarkedTrends((prev) =>
      prev.some((t) => t.id === item.id) ? prev.filter((t) => t.id !== item.id) : [item, ...prev]
    );
  };

  const handleToggleKeywordBookmark = (kw: string) => {
    setBookmarkedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [kw, ...prev]
    );
  };

  const handleLiveWebSearch = async (query = '') => {
    setIsLiveSearching(true);
    setLiveError(null);
    if (query) {
      recordSearchTerm(query);
    }
    try {
      const res = await fetch('/api/trends/live-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          platform: selectedPlatform,
          region,
          timeRange: selectedTimeRange,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '即時搜尋服務暫時無法使用');
      }
      if (Array.isArray(data.items) && data.items.length > 0) {
        setTrends(data.items);
        setDataMode('live_search');
        setLiveGroundingLinks(data.groundingUrls || []);
        localStorage.setItem(STORAGE_KEYS.cachedLive, JSON.stringify(data.items));
        setSearchQuery('');
        setActiveTab('rankings');
      } else {
        setLiveError('即時搜尋尚未回傳結構化榜單，請換個關鍵字或切換回示範資料。');
      }
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : '即時搜尋連線失敗');
    } finally {
      setIsLiveSearching(false);
    }
  };

  const restoreDemoDataset = () => {
    setTrends(DEMO_TRENDS);
    setDataMode('demo');
    setLiveGroundingLinks([]);
    setLiveError(null);
    localStorage.removeItem(STORAGE_KEYS.cachedLive);
  };

  const navItems: { id: AppTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: '首頁', icon: Home },
    { id: 'rankings', label: '排行榜', icon: Trophy },
    { id: 'ai-studio', label: 'AI 創作', icon: Sparkles },
    { id: 'bookmarks', label: '收藏', icon: Bookmark },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Left Navigation Rail */}
      <aside
        className="hidden lg:flex lg:w-56 lg:flex-col lg:fixed lg:inset-y-0 border-r p-4 justify-between z-30"
        style={{ backgroundColor: 'var(--t7-surface)', borderColor: 'var(--t7-border)' }}
      >
        <div className="space-y-6">
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="group rounded-[24px] focus-visible:outline-2 focus-visible:outline-offset-2 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
              aria-label="這週紅什麼 Trend7 首頁"
            >
              <img
                src="/assets/aistudio/file_000000001cb481fd82c66beb10659b10_b14ed9f1.png"
                alt="這週紅什麼 Trend7"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-[24px] object-cover shadow-lg border"
                style={{ borderColor: 'var(--t7-border)' }}
              />
            </button>
          </div>

          <nav className="space-y-1" aria-label="主導覽選單">
            {[
              { id: 'home' as AppTabId, label: '首頁', icon: Home },
              { id: 'rankings' as AppTabId, label: '排行榜', icon: Trophy },
              { id: 'analytics' as AppTabId, label: '趨勢分析', icon: BarChart3 },
              { id: 'ai-studio' as AppTabId, label: 'AI 創作', icon: Sparkles },
              { id: 'bookmarks' as AppTabId, label: '收藏', icon: Bookmark },
              { id: 'settings' as AppTabId, label: '設定', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors whitespace-nowrap ${
                    active ? 't7-accent-btn font-semibold' : 't7-text-muted hover:opacity-80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-t" style={{ borderColor: 'var(--t7-border)' }}>
          <button
            type="button"
            onClick={() => setIsFlutterKitOpen(true)}
            className="w-full min-h-[40px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 hover:opacity-85 t7-text-muted"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            <FolderCode className="w-4 h-4 shrink-0" style={{ color: 'var(--t7-accent)' }} />
            <span className="truncate">Flutter APK 專案</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-56 flex flex-col min-w-0">
        {/* Top Bar Contract (<= 56px mobile sticky height) */}
        <header
          className="sticky top-0 z-30 h-[54px] px-4 md:px-6 border-b backdrop-blur-md flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--t7-surface) 88%, transparent)',
            borderColor: 'var(--t7-border)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="lg:hidden flex items-center shrink-0 rounded-xl"
              aria-label="這週紅什麼 Trend7 首頁"
            >
              <img
                src="/assets/aistudio/file_000000001cb481fd82c66beb10659b10_b14ed9f1.png"
                alt="這週紅什麼 Trend7"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover shadow-sm"
              />
            </button>
            <div className="flex items-center gap-2 text-xs t7-text-subtle truncate">
              <span className="truncate">
                {dataMode === 'demo'
                  ? '示範資料'
                  : dataMode === 'live_search'
                    ? 'Google 即時彙整'
                    : '官方 API'}
              </span>
              {dataMode !== 'demo' && (
                <button
                  type="button"
                  onClick={restoreDemoDataset}
                  className="underline hover:opacity-80 flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  還原示範
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative">
            <button
              type="button"
              onClick={() => setShowThemeQuickMenu((s) => !s)}
              className="min-h-[38px] min-w-[38px] px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium t7-text-muted"
              style={{ borderColor: 'var(--t7-border)' }}
              aria-label="切換主題"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline whitespace-nowrap">
                {THEMES.find((t) => t.id === theme)?.name}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="min-h-[38px] px-3.5 rounded-xl t7-accent-btn text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              搜尋
            </button>

            {showThemeQuickMenu && (
              <div
                className="absolute right-0 top-12 w-52 t7-surface border rounded-2xl shadow-xl p-2 z-50 space-y-1"
                style={{ borderColor: 'var(--t7-border)' }}
              >
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeQuickMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                      theme === t.id ? 't7-accent-soft font-bold' : 'hover:opacity-80'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="flex gap-1">
                      {t.swatches.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {liveError && (
          <div className="mx-4 md:mx-6 mt-4 p-3 rounded-xl border border-red-500/40 bg-red-500/10 text-xs text-red-500 flex items-center justify-between">
            <span>{liveError}</span>
            <button type="button" onClick={() => setLiveError(null)} className="underline ml-3 shrink-0">
              關閉
            </button>
          </div>
        )}

        {liveGroundingLinks.length > 0 && dataMode === 'live_search' && (
          <div className="mx-4 md:mx-6 mt-4 p-3 rounded-xl border t7-surface text-xs flex flex-wrap items-center gap-x-3 gap-y-1" style={{ borderColor: 'var(--t7-border)' }}>
            <span className="font-semibold t7-text-subtle">搜尋來源連結：</span>
            {liveGroundingLinks.slice(0, 5).map((link, i) => (
              <a
                key={i}
                href={link.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="underline truncate max-w-[200px]"
                style={{ color: 'var(--t7-accent)' }}
              >
                {link.title}
              </a>
            ))}
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-10">
          {activeTab === 'home' && (
            <HomeView
              trends={trends}
              bookmarkedIds={bookmarkedIds}
              bookmarkedKeywords={bookmarkedKeywords}
              regionLabel={regionLabel}
              region={region}
              onSelectTrend={setSelectedTrend}
              onToggleBookmark={handleToggleBookmark}
              onToggleKeywordBookmark={handleToggleKeywordBookmark}
              onOpenPlatformRanking={(plat) => {
                setSelectedPlatform(plat);
                setActiveTab('rankings');
              }}
              onOpenAnalytics={() => setActiveTab('analytics')}
              onOpenKeywordSearch={(kw) => {
                setSearchQuery(kw);
                recordSearchTerm(kw);
                setActiveTab('rankings');
              }}
              onRunLiveSearch={() => handleLiveWebSearch('台灣本週爆紅社群話題')}
              isLiveSearching={isLiveSearching}
            />
          )}

          {activeTab === 'rankings' && (
            <RankingsView
              trends={trends}
              selectedPlatform={selectedPlatform}
              selectedTimeRange={selectedTimeRange}
              selectedRegion={region}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              bookmarkedIds={bookmarkedIds}
              onChangePlatform={setSelectedPlatform}
              onChangeTimeRange={setSelectedTimeRange}
              onChangeRegion={setRegion}
              onChangeCategory={setSelectedCategory}
              onOpenSearch={() => setIsSearchOpen(true)}
              onClearSearch={() => setSearchQuery('')}
              onSelectTrend={setSelectedTrend}
              onToggleBookmark={handleToggleBookmark}
              onRunLiveSearch={() => handleLiveWebSearch(searchQuery || '台灣熱門爆紅')}
              isLiveSearching={isLiveSearching}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              trends={trends}
              selectedTimeRange={selectedTimeRange}
              onChangeTimeRange={setSelectedTimeRange}
              onSearchKeyword={(kw) => {
                setSearchQuery(kw);
                recordSearchTerm(kw);
                setActiveTab('rankings');
              }}
            />
          )}

          {activeTab === 'ai-studio' && (
            <AIStudioView
              trends={trends}
              preselectedTopic={aiPreselectedTopic}
              onSaveAIContent={(entry) => setSavedAIContents((prev) => [entry, ...prev])}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BookmarksView
              bookmarkedTrends={bookmarkedTrends}
              bookmarkedKeywords={bookmarkedKeywords}
              savedAIContents={savedAIContents}
              onSelectTrend={setSelectedTrend}
              onToggleBookmark={handleToggleBookmark}
              onToggleKeyword={handleToggleKeywordBookmark}
              onRemoveAIContent={(id) =>
                setSavedAIContents((prev) => prev.filter((item) => item.id !== id))
              }
              onSearchKeyword={(kw) => {
                setSearchQuery(kw);
                setActiveTab('rankings');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              theme={theme}
              region={region}
              notifications={notifications}
              onChangeTheme={setTheme}
              onChangeRegion={setRegion}
              onUpdateNotifications={setNotifications}
              onOpenFlutterKit={() => setIsFlutterKitOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (5 destinations: 首頁、排行榜、AI 創作、收藏、設定) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t backdrop-blur-md grid grid-cols-5 items-center"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--t7-surface) 92%, transparent)',
          borderColor: 'var(--t7-border)',
        }}
        aria-label="手機底部導覽列"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors"
              style={{ color: active ? 'var(--t7-accent)' : 'var(--t7-text-subtle)' }}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Modals & Overlays */}
      <TrendDetailModal
        item={selectedTrend}
        isBookmarked={selectedTrend ? bookmarkedIds.has(selectedTrend.id) : false}
        onClose={() => setSelectedTrend(null)}
        onToggleBookmark={handleToggleBookmark}
        onSendToAIStudio={(item) => {
          setAiPreselectedTopic(item.title);
          setActiveTab('ai-studio');
        }}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        initialQuery={searchQuery}
        history={searchHistory}
        onClose={() => setIsSearchOpen(false)}
        onLocalSearch={(term) => {
          setSearchQuery(term);
          if (term) recordSearchTerm(term);
          setActiveTab('rankings');
        }}
        onLiveWebSearch={handleLiveWebSearch}
        onClearHistory={() => setSearchHistory([])}
        onRemoveHistoryItem={(term) =>
          setSearchHistory((prev) => prev.filter((t) => t !== term))
        }
        isLiveSearching={isLiveSearching}
      />

      <FlutterKitModal
        isOpen={isFlutterKitOpen}
        onClose={() => setIsFlutterKitOpen(false)}
      />
    </div>
  );
}
