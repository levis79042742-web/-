import React, { useState } from 'react';
import { Bookmark, Search, Trash2 } from 'lucide-react';
import { SavedAIContent, TrendItem } from '../types/trend';
import { TrendCard } from './TrendCard';

interface BookmarksViewProps {
  bookmarkedTrends: TrendItem[];
  bookmarkedKeywords: string[];
  savedAIContents: SavedAIContent[];
  onSelectTrend: (item: TrendItem) => void;
  onToggleBookmark: (item: TrendItem) => void;
  onToggleKeyword: (kw: string) => void;
  onRemoveAIContent: (id: string) => void;
  onSearchKeyword: (kw: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarkedTrends,
  bookmarkedKeywords,
  savedAIContents,
  onSelectTrend,
  onToggleBookmark,
  onToggleKeyword,
  onRemoveAIContent,
  onSearchKeyword,
}) => {
  const [tab, setTab] = useState<'trends' | 'keywords' | 'ai'>('trends');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold">收藏中心</h1>
        <p className="text-xs t7-text-subtle">所有項目皆已自動寫入本機離線儲存空間，無網路時亦可隨時查閱</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--t7-border)' }}>
        <button
          type="button"
          onClick={() => setTab('trends')}
          className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold ${
            tab === 'trends' ? 't7-accent-btn' : 't7-surface-muted t7-text-muted'
          }`}
        >
          影片與貼文 ({bookmarkedTrends.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('keywords')}
          className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold ${
            tab === 'keywords' ? 't7-accent-btn' : 't7-surface-muted t7-text-muted'
          }`}
        >
          關鍵字 ({bookmarkedKeywords.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('ai')}
          className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold ${
            tab === 'ai' ? 't7-accent-btn' : 't7-surface-muted t7-text-muted'
          }`}
        >
          AI 生成內容 ({savedAIContents.length})
        </button>
      </div>

      {tab === 'trends' && (
        bookmarkedTrends.length === 0 ? (
          <div className="t7-surface border p-8 text-center space-y-2" style={{ borderColor: 'var(--t7-border)' }}>
            <Bookmark className="w-7 h-7 mx-auto t7-text-subtle" />
            <p className="text-sm font-medium">尚未收藏任何影片或貼文</p>
            <p className="text-xs t7-text-subtle">在首頁或排行榜點擊書籤圖示，即可離線保留喜愛的爆紅趨勢。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarkedTrends.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                isBookmarked
                onSelect={onSelectTrend}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        )
      )}

      {tab === 'keywords' && (
        bookmarkedKeywords.length === 0 ? (
          <div className="t7-surface border p-8 text-center space-y-2" style={{ borderColor: 'var(--t7-border)' }}>
            <p className="text-sm font-medium">尚未追蹤任何關鍵字</p>
            <p className="text-xs t7-text-subtle">在首頁熱門關鍵字區點擊書籤，即可快速追蹤話題。</p>
          </div>
        ) : (
          <div className="t7-surface border divide-y" style={{ borderColor: 'var(--t7-border)' }}>
            {bookmarkedKeywords.map((kw) => (
              <div key={kw} className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSearchKeyword(kw)}
                  className="flex items-center gap-2 text-sm font-semibold hover:underline"
                >
                  <Search className="w-4 h-4 t7-text-subtle" />
                  {kw}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleKeyword(kw)}
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center t7-text-subtle hover:text-red-500"
                  aria-label={`移除關鍵字 ${kw}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'ai' && (
        savedAIContents.length === 0 ? (
          <div className="t7-surface border p-8 text-center space-y-2" style={{ borderColor: 'var(--t7-border)' }}>
            <p className="text-sm font-medium">尚未儲存任何 AI 生成創作內容</p>
            <p className="text-xs t7-text-subtle">前往「AI 創作」生成腳本與文案後，點擊「收藏此創作內容」即可離線保存。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedAIContents.map((entry) => (
              <div key={entry.id} className="t7-surface border p-5 space-y-3" style={{ borderColor: 'var(--t7-border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base">{entry.topicTitle}</h3>
                    <p className="text-xs t7-text-subtle font-mono-num">儲存時間：{entry.createdAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveAIContent(entry.id)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center t7-text-subtle hover:text-red-500"
                    aria-label="刪除 AI 收藏"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 rounded-xl t7-surface-muted text-xs space-y-1.5">
                  <div className="font-semibold">短影音前 3 秒鉤子：{entry.output.shortVideoScript.hook}</div>
                  <div>推薦標題：{entry.output.videoTitles[0]}</div>
                  <div className="font-mono-num t7-text-subtle">
                    生圖提示詞：{entry.output.imagePrompt.slice(0, 120)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
