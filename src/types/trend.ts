export type PlatformId =
  | 'all'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  | 'xiaohongshu'
  | 'threads';

export type SocialPlatform = Exclude<PlatformId, 'all'>;

export type TimeRangeId = '24h' | '3d' | '7d' | '30d';

export type RegionId = 'TW' | 'JP' | 'KR' | 'US' | 'GLOBAL';

export type CategoryId =
  | '全部'
  | '爆紅影片及短影音'
  | '熱門貼文'
  | '熱門新聞及時事'
  | '流行音樂及背景配樂'
  | '熱門 Hashtag'
  | '網路迷因及流行語'
  | '熱門商品'
  | '美食及旅遊'
  | '美妝及穿搭'
  | '明星及網紅'
  | '寵物及搞笑'
  | 'AI 科技'
  | '生活及娛樂';

export type ThemeId =
  | 'dark-tech'
  | 'minimal-white'
  | 'purple-ai'
  | 'hot-orange'
  | 'colorful-gradient'
  | 'cute-healing';

export type AppTabId = 'home' | 'rankings' | 'analytics' | 'ai-studio' | 'bookmarks' | 'settings';

export type DataSourceType = 'demo' | 'live_search' | 'official_api';

export interface TrendItem {
  id: string;
  rank: number;
  rankDelta: number; // positive = up, negative = down, 0 = steady, 999 = new entry
  title: string;
  summary: string;
  platform: SocialPlatform;
  category: Exclude<CategoryId, '全部'>;
  region: RegionId;
  timeRange: TimeRangeId;
  creatorName: string;
  creatorHandle: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  growthRate: number | null; // percentage, e.g. 184 means +184%
  viralIndex: number; // 0 - 100
  keywords: string[];
  hashtags: string[];
  originalUrl: string;
  dataSourceType: DataSourceType;
  sourceLabel: string;
  lastUpdatedAt: string;
  sparkline: number[]; // 7-point historical trajectory
}

export interface PlatformMeta {
  id: SocialPlatform;
  name: string;
  shortName: string;
  brandColor: string;
  apiStatus: 'connected' | 'grounding_ready' | 'unconnected';
  apiStatusText: string;
}

export interface AIAnalysisResult {
  viralReason: string;
  nextWavePrediction: string;
  crossPlatformComparison: string;
  commerceOpportunity: string;
  recommendedAngles: string[];
  disclaimer: string;
}

export interface AICreativeOutput {
  shortVideoScript: {
    hook: string;
    scenes: { timeRange: string; visual: string; voiceover: string; caption: string }[];
    cta: string;
  };
  videoTitles: string[];
  socialCaptions: {
    platform: string;
    copy: string;
  }[];
  hashtags: {
    highTraffic: string[];
    nicheTargeted: string[];
  };
  videoPrompt: string;
  imagePrompt: string;
}

export interface AISummaryOutput {
  dailySummary: string;
  weeklyHighlights: string[];
  emergingKeywords: { keyword: string; momentum: string; platforms: string[] }[];
  personalizedIdeas: { title: string; format: string; reason: string }[];
  groundingUrls?: { title: string; uri: string }[];
}

export interface SavedAIContent {
  id: string;
  topicTitle: string;
  createdAt: string;
  output: AICreativeOutput;
}

export interface NotificationSettings {
  dailyHotEnabled: boolean;
  weeklyRankingEnabled: boolean;
  keywordAlertEnabled: boolean;
  alertKeywords: string[];
  customTime: string; // HH:mm
  updateFrequency: 'hourly' | 'daily' | 'weekly';
}

export interface FlutterKitFile {
  path: string;
  title: string;
  category: 'flutter' | 'github' | 'database' | 'guide';
  content: string;
}
