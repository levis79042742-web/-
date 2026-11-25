import React, { useState } from 'react';
import { Bookmark, ExternalLink, Sparkles, X } from 'lucide-react';
import { AIAnalysisResult, TrendItem } from '../types/trend';
import { formatCount, formatGrowth, formatRankDelta, getPlatformMeta } from '../utils/format';
import { PlatformAppIcon } from './PlatformAppIcon';

interface TrendDetailModalProps {
  item: TrendItem | null;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: (item: TrendItem) => void;
  onSendToAIStudio: (item: TrendItem) => void;
}

export const TrendDetailModal: React.FC<TrendDetailModalProps> = ({
  item,
  isBookmarked,
  onClose,
  onToggleBookmark,
  onSendToAIStudio,
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  if (!item) return null;

  const platformMeta = getPlatformMeta(item.platform);
  const delta = formatRankDelta(item.rankDelta);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          platform: platformMeta.name,
          category: item.category,
          summary: item.summary,
          region: item.region,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI 分析服務暫時無法使用');
      }
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析請求失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="w-full max-w-3xl max-h-[92vh] t7-surface border rounded-t-3xl md:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--t7-border)' }}>
          <div className="flex items-center gap-2 text-xs font-medium t7-text-muted min-w-0">
            <PlatformAppIcon platform={item.platform} size="sm" />
            <span className="font-mono-num">第 {item.rank} 名</span>
            <span aria-hidden="true">·</span>
            <span>{platformMeta.name}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{item.category}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl t7-surface-muted hover:opacity-80"
            aria-label="關閉詳情"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">
          {/* Media + Title */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-5 aspect-[4/3] rounded-xl overflow-hidden t7-surface-muted border relative" style={{ borderColor: 'var(--t7-border)' }}>
              {item.thumbnailUrl && !imgError ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-4 text-center gap-2.5"
                  style={{
                    background: `linear-gradient(135deg, ${platformMeta.brandColor}22 0%, var(--t7-surface-muted) 100%)`,
                  }}
                >
                  <PlatformAppIcon platform={item.platform} size="lg" />
                  <span className="text-xs font-medium t7-text-muted">{platformMeta.name} · {item.category}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-3">
              <div className="text-xs t7-text-subtle flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium" style={{ color: platformMeta.brandColor }}>
                  {item.creatorName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{item.publishedAt}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{delta.label}</span>
              </div>

              <h2 className="text-lg md:text-xl font-bold leading-snug text-balance">{item.title}</h2>
              <p className="text-sm leading-relaxed t7-text-muted">{item.summary}</p>

              <div className="text-xs t7-text-subtle pt-1">
                資料來源：{item.sourceLabel} · 最後更新：{item.lastUpdatedAt}
              </div>
            </div>
          </div>

          {/* Metrics Grid (Tabular Numerals + Honest Null Handling) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: '觀看次數', val: formatCount(item.views) },
              { label: '按讚數', val: formatCount(item.likes) },
              { label: '留言數', val: formatCount(item.comments) },
              { label: '分享數', val: formatCount(item.shares) },
              { label: '熱度成長率', val: formatGrowth(item.growthRate) },
              { label: 'AI 爆紅指數', val: `${item.viralIndex} / 100` },
            ].map((m) => (
              <div
                key={m.label}
                className="p-3 rounded-xl t7-surface-muted border"
                style={{ borderColor: 'var(--t7-border)' }}
              >
                <div className="text-[11px] t7-text-subtle mb-1">{m.label}</div>
                <div className="text-sm font-bold font-mono-num">{m.val}</div>
              </div>
            ))}
          </div>

          {/* Keywords & Hashtags */}
          <div className="text-xs t7-text-muted flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="t7-text-subtle">關鍵字：</span>
            {item.keywords.map((k) => (
              <span key={k} className="font-medium">
                {k}
              </span>
            ))}
            <span className="t7-text-subtle ml-2">標籤：</span>
            {item.hashtags.map((h) => (
              <span key={h} className="font-mono-num t7-text-subtle">
                {h}
              </span>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onToggleBookmark(item)}
              className="min-h-[44px] px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 hover:opacity-85 transition-opacity whitespace-nowrap"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? '已離線收藏' : '加入收藏'}
            </button>

            <a
              href={item.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 hover:opacity-85 transition-opacity whitespace-nowrap"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              <ExternalLink className="w-4 h-4" />
              原始內容連結
            </a>

            <button
              type="button"
              onClick={() => {
                onSendToAIStudio(item);
                onClose();
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 hover:opacity-85 transition-opacity whitespace-nowrap"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              一鍵二創腳本與文案
            </button>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading}
              className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold t7-accent-btn flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'AI 分析中...' : 'AI 分析爆紅與商機'}
            </button>
          </div>

          {/* AI Analysis Section */}
          {loading && (
            <div className="space-y-3 p-4 rounded-xl border" style={{ borderColor: 'var(--t7-border)' }}>
              <div className="h-4 w-40 rounded t7-skeleton" />
              <div className="h-16 w-full rounded t7-skeleton" />
              <div className="h-16 w-full rounded t7-skeleton" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-500">
              {error}
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--t7-border)' }}>
              <h3 className="text-base font-bold">AI 深度趨勢與商機報告</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl t7-surface-muted space-y-1.5">
                  <div className="text-xs font-semibold t7-text-subtle">爆紅原因拆解</div>
                  <p className="text-sm leading-relaxed">{analysis.viralReason}</p>
                </div>
                <div className="p-4 rounded-xl t7-surface-muted space-y-1.5">
                  <div className="text-xs font-semibold t7-text-subtle">下一波熱門趨勢預測</div>
                  <p className="text-sm leading-relaxed">{analysis.nextWavePrediction}</p>
                </div>
                <div className="p-4 rounded-xl t7-surface-muted space-y-1.5">
                  <div className="text-xs font-semibold t7-text-subtle">跨平台話題比對</div>
                  <p className="text-sm leading-relaxed">{analysis.crossPlatformComparison}</p>
                </div>
                <div className="p-4 rounded-xl t7-surface-muted space-y-1.5">
                  <div className="text-xs font-semibold t7-text-subtle">熱門商品與商機分析</div>
                  <p className="text-sm leading-relaxed">{analysis.commerceOpportunity}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl t7-surface-muted space-y-2">
                <div className="text-xs font-semibold t7-text-subtle">推薦跟進創作切角</div>
                <ul className="space-y-1.5 text-sm list-disc list-inside">
                  {analysis.recommendedAngles.map((angle, idx) => (
                    <li key={idx}>{angle}</li>
                  ))}
                </ul>
              </div>

              <p className="text-xs t7-text-subtle">{analysis.disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
