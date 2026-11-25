import React, { useEffect, useState } from 'react';
import { BookmarkPlus, Check, Copy, Sparkles } from 'lucide-react';
import { AICreativeOutput, SavedAIContent, TrendItem } from '../types/trend';

interface AIStudioViewProps {
  trends: TrendItem[];
  preselectedTopic?: string;
  onSaveAIContent: (entry: SavedAIContent) => void;
}

export const AIStudioView: React.FC<AIStudioViewProps> = ({
  trends,
  preselectedTopic = '',
  onSaveAIContent,
}) => {
  const [topic, setTopic] = useState(preselectedTopic || (trends[0]?.title ?? ''));
  const [targetPlatform, setTargetPlatform] = useState('TikTok / IG Reels');
  const [tone, setTone] = useState('高互動接地氣');
  const [duration, setDuration] = useState('30 秒');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<AICreativeOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedFlag, setSavedFlag] = useState(false);

  useEffect(() => {
    if (preselectedTopic) {
      setTopic(preselectedTopic);
    }
  }, [preselectedTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setSavedFlag(false);
    try {
      const res = await fetch('/api/ai/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          targetPlatform,
          tone,
          duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI 創作生成失敗');
      setOutput(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleSave = () => {
    if (!output) return;
    onSaveAIContent({
      id: `ai-${Date.now()}`,
      topicTitle: topic.trim(),
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      output,
    });
    setSavedFlag(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold">AI 創作中心</h1>
        <p className="text-xs t7-text-subtle">
          選擇熱門話題或輸入靈感，一鍵生成短影音腳本、標題、貼文文案、Hashtag 與 AI 影像／圖片提示詞
        </p>
      </div>

      {/* Topic Selector */}
      <section className="t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
        <div className="space-y-2">
          <div className="text-xs font-semibold t7-text-subtle">快速帶入本週熱門話題</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {trends.slice(0, 6).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.title)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium border whitespace-nowrap shrink-0 max-w-[260px] truncate ${
                  topic === t.title ? 't7-accent-soft font-semibold' : 't7-surface-muted t7-text-muted'
                }`}
                style={{ borderColor: 'var(--t7-border)' }}
              >
                #{t.rank} {t.title}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold t7-text-subtle block" htmlFor="ai-topic-input">
            創作主題 / 熱門話題
          </label>
          <textarea
            id="ai-topic-input"
            rows={2}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="輸入想創作的社群話題、商品名稱或關鍵字..."
            className="w-full p-3 rounded-xl border t7-surface-muted text-sm outline-none resize-none"
            style={{ borderColor: 'var(--t7-border)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="space-y-1 text-xs">
            <span className="t7-text-subtle block">發布主平台</span>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border t7-surface-muted text-xs font-medium outline-none"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              <option value="TikTok / IG Reels">TikTok / IG Reels</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
              <option value="Threads 脆文">Threads 脆文</option>
              <option value="小紅書圖文">小紅書圖文</option>
              <option value="Facebook 長文">Facebook 長文</option>
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="t7-text-subtle block">內容語氣</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border t7-surface-muted text-xs font-medium outline-none"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              <option value="高互動接地氣">高互動接地氣</option>
              <option value="專業知識拆解">專業知識拆解</option>
              <option value="幽默反轉迷因">幽默反轉迷因</option>
              <option value="溫柔療癒生活感">溫柔療癒生活感</option>
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="t7-text-subtle block">影片預期秒數</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border t7-surface-muted text-xs font-medium outline-none"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              <option value="15 秒極短節奏">15 秒極短節奏</option>
              <option value="30 秒黃金結構">30 秒黃金結構</option>
              <option value="60 秒深度實測">60 秒深度實測</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="min-h-[46px] px-6 py-2.5 rounded-xl t7-accent-btn text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Gemini AI 全套生成中...' : '一鍵生成完整創作包'}
          </button>

          {output && (
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2"
              style={{ borderColor: 'var(--t7-border)' }}
            >
              {savedFlag ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
              {savedFlag ? '已儲存至收藏中心' : '收藏此創作內容'}
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-2xl t7-skeleton" />
          ))}
        </div>
      )}

      {output && !loading && (
        <div className="space-y-5">
          {/* Short Video Script */}
          <section className="t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">短影音分鏡腳本</h2>
              <button
                type="button"
                onClick={() =>
                  copyText(
                    'script',
                    `【前3秒鉤子】${output.shortVideoScript.hook}\n\n` +
                      output.shortVideoScript.scenes
                        .map((s) => `${s.timeRange}｜畫面：${s.visual}｜旁白：${s.voiceover}｜字幕：${s.caption}`)
                        .join('\n') +
                      `\n\n【結尾 CTA】${output.shortVideoScript.cta}`
                  )
                }
                className="min-h-[36px] px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5"
                style={{ borderColor: 'var(--t7-border)' }}
              >
                {copiedKey === 'script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'script' ? '已複製' : '複製腳本'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl t7-surface-muted text-sm">
              <span className="text-xs font-bold block mb-1" style={{ color: 'var(--t7-accent)' }}>
                前 3 秒吸睛鉤子（Hook）
              </span>
              {output.shortVideoScript.hook}
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--t7-border)' }}>
              {output.shortVideoScript.scenes.map((scene, idx) => (
                <div key={idx} className="py-3 grid grid-cols-1 md:grid-cols-12 gap-2 text-sm">
                  <div className="md:col-span-2 font-mono-num text-xs font-bold t7-text-subtle">
                    {scene.timeRange}
                  </div>
                  <div className="md:col-span-4">
                    <span className="text-[11px] t7-text-subtle block">畫面建議</span>
                    {scene.visual}
                  </div>
                  <div className="md:col-span-4">
                    <span className="text-[11px] t7-text-subtle block">旁白口播</span>
                    {scene.voiceover}
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[11px] t7-text-subtle block">螢幕字幕</span>
                    <span className="font-medium">{scene.caption}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl t7-surface-muted text-sm">
              <span className="text-xs font-bold t7-text-subtle block mb-1">結尾互動引導（CTA）</span>
              {output.shortVideoScript.cta}
            </div>
          </section>

          {/* Titles + Hashtags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="t7-surface border p-5 space-y-3" style={{ borderColor: 'var(--t7-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">5 組高點擊影片標題</h2>
                <button
                  type="button"
                  onClick={() => copyText('titles', output.videoTitles.join('\n'))}
                  className="text-xs font-medium t7-text-muted flex items-center gap-1"
                >
                  {copiedKey === 'titles' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  複製
                </button>
              </div>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                {output.videoTitles.map((title, idx) => (
                  <li key={idx} className="leading-snug">
                    {title}
                  </li>
                ))}
              </ol>
            </section>

            <section className="t7-surface border p-5 space-y-3" style={{ borderColor: 'var(--t7-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">AI Hashtag 分流推薦</h2>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      'hashtags',
                      [...output.hashtags.highTraffic, ...output.hashtags.nicheTargeted].join(' ')
                    )
                  }
                  className="text-xs font-medium t7-text-muted flex items-center gap-1"
                >
                  {copiedKey === 'hashtags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  全部複製
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="t7-text-subtle mb-1">大流量泛標籤</div>
                  <div className="font-mono-num leading-relaxed">{output.hashtags.highTraffic.join('  ')}</div>
                </div>
                <div>
                  <div className="t7-text-subtle mb-1">精準受眾長尾標籤</div>
                  <div className="font-mono-num leading-relaxed">{output.hashtags.nicheTargeted.join('  ')}</div>
                </div>
              </div>
            </section>
          </div>

          {/* Social Captions */}
          <section className="t7-surface border p-5 space-y-3" style={{ borderColor: 'var(--t7-border)' }}>
            <h2 className="text-base font-bold">跨平台貼文文案</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {output.socialCaptions.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl t7-surface-muted space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold" style={{ color: 'var(--t7-accent)' }}>
                      {c.platform}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{c.copy}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(`cap-${idx}`, c.copy)}
                    className="self-start text-xs font-medium t7-text-subtle flex items-center gap-1 pt-2"
                  >
                    {copiedKey === `cap-${idx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    複製文案
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Video & Image Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="t7-surface border p-5 space-y-2.5" style={{ borderColor: 'var(--t7-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">AI 影片生成提示詞（Veo / Sora）</h2>
                <button
                  type="button"
                  onClick={() => copyText('vprompt', output.videoPrompt)}
                  className="text-xs font-medium t7-text-muted flex items-center gap-1"
                >
                  {copiedKey === 'vprompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  複製
                </button>
              </div>
              <p className="text-xs font-mono-num leading-relaxed p-3 rounded-xl t7-surface-muted">
                {output.videoPrompt}
              </p>
            </section>

            <section className="t7-surface border p-5 space-y-2.5" style={{ borderColor: 'var(--t7-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">AI 封面圖片生成提示詞（Gemini / MJ）</h2>
                <button
                  type="button"
                  onClick={() => copyText('iprompt', output.imagePrompt)}
                  className="text-xs font-medium t7-text-muted flex items-center gap-1"
                >
                  {copiedKey === 'iprompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  複製
                </button>
              </div>
              <p className="text-xs font-mono-num leading-relaxed p-3 rounded-xl t7-surface-muted">
                {output.imagePrompt}
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
