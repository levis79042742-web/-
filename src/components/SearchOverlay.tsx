import React, { useState } from 'react';
import { Clock, Globe, Search, Trash2, X } from 'lucide-react';
import { HOT_SEARCH_SUGGESTIONS } from '../data/demoTrends';

interface SearchOverlayProps {
  isOpen: boolean;
  initialQuery: string;
  history: string[];
  onClose: () => void;
  onLocalSearch: (query: string) => void;
  onLiveWebSearch: (query: string) => Promise<void>;
  onClearHistory: () => void;
  onRemoveHistoryItem: (term: string) => void;
  isLiveSearching: boolean;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  initialQuery,
  history,
  onClose,
  onLocalSearch,
  onLiveWebSearch,
  onClearHistory,
  onRemoveHistoryItem,
  isLiveSearching,
}) => {
  const [input, setInput] = useState(initialQuery);

  if (!isOpen) return null;

  const submitLocal = (term: string) => {
    const clean = term.trim();
    onLocalSearch(clean);
    onClose();
  };

  const submitLive = async (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    await onLiveWebSearch(clean);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 backdrop-blur-sm p-4 pt-12 md:pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="跨平台關鍵字搜尋"
    >
      <div className="w-full max-w-2xl t7-surface border shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--t7-border)' }}>
          <Search className="w-5 h-5 t7-text-subtle shrink-0" />
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitLocal(input);
              }
            }}
            placeholder="搜尋跨平台關鍵字、創作者、Hashtag 或商品..."
            className="w-full bg-transparent text-sm md:text-base outline-none placeholder:opacity-60"
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg t7-text-subtle hover:opacity-80"
              aria-label="清除搜尋文字"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-3 text-xs font-medium rounded-lg border t7-text-muted hover:opacity-80 whitespace-nowrap shrink-0"
            style={{ borderColor: 'var(--t7-border)' }}
          >
            關閉
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => submitLocal(input)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium t7-accent-btn transition-opacity hover:opacity-90 whitespace-nowrap"
            >
              篩選目前榜單
            </button>
            <button
              type="button"
              disabled={!input.trim() || isLiveSearching}
              onClick={() => submitLive(input)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              <Globe className="w-4 h-4" />
              {isLiveSearching ? '即時搜尋彙整中...' : 'Google 搜尋即時查趨勢'}
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold t7-text-subtle mb-2.5">熱門搜尋推薦</h3>
            <div className="flex flex-wrap gap-2">
              {HOT_SEARCH_SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setInput(term);
                    submitLocal(term);
                  }}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium t7-surface-muted hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-semibold t7-text-subtle">歷史搜尋紀錄</h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-xs t7-text-subtle hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  全部清除
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs t7-text-subtle">尚無歷史搜尋紀錄</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--t7-border)' }}>
                {history.map((term) => (
                  <div key={term} className="flex items-center justify-between py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInput(term);
                        submitLocal(term);
                      }}
                      className="flex items-center gap-2.5 text-sm text-left flex-1 min-h-[40px]"
                    >
                      <Clock className="w-4 h-4 t7-text-subtle shrink-0" />
                      <span className="truncate">{term}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveHistoryItem(term)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center t7-text-subtle hover:opacity-75"
                      aria-label={`刪除 ${term}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
