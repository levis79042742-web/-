import React, { useState } from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';
import { TrendItem } from '../types/trend';
import { formatCount, formatGrowth, formatRankDelta, getPlatformMeta } from '../utils/format';
import { PlatformAppIcon } from './PlatformAppIcon';

interface TrendCardProps {
  item: TrendItem;
  isBookmarked: boolean;
  onSelect: (item: TrendItem) => void;
  onToggleBookmark: (item: TrendItem) => void;
  compact?: boolean;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  item,
  isBookmarked,
  onSelect,
  onToggleBookmark,
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const meta = getPlatformMeta(item.platform);
  const delta = formatRankDelta(item.rankDelta);

  return (
    <article
      className="t7-surface border overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 flex flex-col"
      style={{ borderColor: 'var(--t7-border)' }}
    >
      <div className={`flex ${compact ? 'flex-row gap-3.5 p-3.5 items-start' : 'flex-col'}`}>
        {/* Thumbnail */}
        <button
          type="button"
          onClick={() => onSelect(item)}
          className={`relative overflow-hidden t7-surface-muted shrink-0 text-left group ${
            compact ? 'w-24 h-20 rounded-xl' : 'w-full aspect-[4/3]'
          }`}
        >
          {item.thumbnailUrl && !imgError ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-3 text-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${meta.brandColor}24 0%, var(--t7-surface-muted) 100%)`,
              }}
            >
              <PlatformAppIcon platform={item.platform} size={compact ? 'md' : 'lg'} />
              {!compact && (
                <span className="text-[11px] font-medium t7-text-muted">{meta.name}</span>
              )}
            </div>
          )}
        </button>

        {/* Body */}
        <div className={`${compact ? 'flex-1 min-w-0' : 'p-4 flex-1 flex flex-col justify-between'} space-y-2.5`}>
          <div className="space-y-1.5">
            {/* Unboxed Metadata Line (Zero-pill discipline) */}
            <div className="flex items-center justify-between gap-2 text-xs t7-text-subtle">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <PlatformAppIcon platform={item.platform} size="xs" />
                <span className="font-mono-num font-bold" style={{ color: 'var(--t7-text)' }}>
                  #{item.rank}
                </span>
                <span className="font-mono-num">{delta.label}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium" style={{ color: meta.brandColor }}>
                  {meta.shortName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{item.category}</span>
              </div>
              <span className="font-mono-num font-bold shrink-0" style={{ color: 'var(--t7-accent)' }}>
                指數 {item.viralIndex}
              </span>
            </div>

            {/* Title */}
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="text-left block w-full"
            >
              <h3 className={`font-bold leading-snug hover:underline ${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-2'}`}>
                {item.title}
              </h3>
            </button>

            <div className="text-xs t7-text-subtle flex items-center gap-1.5 truncate">
              <span className="truncate">{item.creatorName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num shrink-0">{item.publishedAt}</span>
            </div>
          </div>

          {/* Metrics & Actions */}
          <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--t7-border)' }}>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono-num t7-text-muted flex-1 min-w-0">
              <div className="truncate">
                <span className="t7-text-subtle block text-[10px]">觀看</span>
                {formatCount(item.views)}
              </div>
              <div className="truncate">
                <span className="t7-text-subtle block text-[10px]">按讚</span>
                {formatCount(item.likes)}
              </div>
              <div className="truncate">
                <span className="t7-text-subtle block text-[10px]">成長率</span>
                {formatGrowth(item.growthRate)}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onToggleBookmark(item)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl hover:opacity-80 t7-text-muted"
                aria-label={isBookmarked ? '取消收藏' : '加入收藏'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} style={isBookmarked ? { color: 'var(--t7-accent)' } : undefined} />
              </button>
              <a
                href={item.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl hover:opacity-80 t7-text-muted"
                aria-label="開啟原始內容連結"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
