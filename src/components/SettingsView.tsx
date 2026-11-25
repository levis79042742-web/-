import React, { useEffect, useState } from 'react';
import { Bell, Check, FolderCode, Plus, Smartphone, X } from 'lucide-react';
import { REGIONS, THEMES } from '../data/demoTrends';
import { NotificationSettings, RegionId, SocialPlatform, ThemeId } from '../types/trend';
import { PlatformAppIcon } from './PlatformAppIcon';

interface SettingsViewProps {
  theme: ThemeId;
  region: RegionId;
  notifications: NotificationSettings;
  onChangeTheme: (t: ThemeId) => void;
  onChangeRegion: (r: RegionId) => void;
  onUpdateNotifications: (n: NotificationSettings) => void;
  onOpenFlutterKit: () => void;
}

interface AdapterStatusResponse {
  geminiConnected: boolean;
  adapters: Record<string, { connected: boolean; mode: string; label: string }>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  region,
  notifications,
  onChangeTheme,
  onChangeRegion,
  onUpdateNotifications,
  onOpenFlutterKit,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [adapterStatus, setAdapterStatus] = useState<AdapterStatusResponse | null>(null);
  const [testNoticeMsg, setTestNoticeMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/adapters/status')
      .then((r) => r.json())
      .then((d) => setAdapterStatus(d))
      .catch(() => {});
  }, []);

  const addKeyword = () => {
    const clean = newKeyword.trim();
    if (!clean) return;
    if (!notifications.alertKeywords.includes(clean)) {
      onUpdateNotifications({
        ...notifications,
        alertKeywords: [...notifications.alertKeywords, clean],
      });
    }
    setNewKeyword('');
  };

  const removeKeyword = (kw: string) => {
    onUpdateNotifications({
      ...notifications,
      alertKeywords: notifications.alertKeywords.filter((k) => k !== kw),
    });
  };

  const triggerTestNotification = () => {
    setTestNoticeMsg(
      `已排程於每日 ${notifications.customTime} 推播（每日熱門：${notifications.dailyHotEnabled ? '開啟' : '關閉'}、每週排行：${notifications.weeklyRankingEnabled ? '開啟' : '關閉'}）`
    );
    setTimeout(() => setTestNoticeMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold">個人設定與專案開發中心</h1>
        <p className="text-xs t7-text-subtle">自由切換 6 種視覺主題、管理推播通知、地區語系與下載完整 Flutter Android APK 專案</p>
      </div>

      {/* 6 Themes Switcher */}
      <section className="t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
        <h2 className="text-base font-bold">六種主題即時切換</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeTheme(t.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 min-h-[92px] ${
                  active ? 'ring-2' : 'hover:opacity-90'
                }`}
                style={{
                  borderColor: active ? 'var(--t7-accent)' : 'var(--t7-border)',
                  boxShadow: active ? '0 0 0 1px var(--t7-accent)' : undefined,
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    {t.swatches.map((hex, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/15"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  {active && <Check className="w-4 h-4" style={{ color: 'var(--t7-accent)' }} />}
                </div>
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-[11px] t7-text-subtle">{t.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Notifications & Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              智慧爆紅通知設定
            </h2>
            <button
              type="button"
              onClick={triggerTestNotification}
              className="text-xs font-semibold"
              style={{ color: 'var(--t7-accent)' }}
            >
              驗證排程
            </button>
          </div>

          {testNoticeMsg && (
            <div className="p-3 rounded-xl t7-accent-soft text-xs font-medium">{testNoticeMsg}</div>
          )}

          <div className="divide-y" style={{ borderColor: 'var(--t7-border)' }}>
            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="text-sm font-medium">每日熱門趨勢通知</div>
                <div className="text-xs t7-text-subtle">整理過去 24 小時台灣六大社群焦點</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailyHotEnabled}
                onChange={(e) =>
                  onUpdateNotifications({ ...notifications, dailyHotEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-current"
              />
            </label>

            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="text-sm font-medium">每週爆紅排行榜通知</div>
                <div className="text-xs t7-text-subtle">每週自動產生完整 Trend7 趨勢報告</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyRankingEnabled}
                onChange={(e) =>
                  onUpdateNotifications({ ...notifications, weeklyRankingEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-current"
              />
            </label>

            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="text-sm font-medium">指定關鍵字爆紅通知</div>
                <div className="text-xs t7-text-subtle">關鍵字熱度飆升時即時提醒</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.keywordAlertEnabled}
                onChange={(e) =>
                  onUpdateNotifications({ ...notifications, keywordAlertEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-current"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="space-y-1 text-xs">
              <span className="t7-text-subtle block">自訂通知時間</span>
              <input
                type="time"
                value={notifications.customTime}
                onChange={(e) =>
                  onUpdateNotifications({ ...notifications, customTime: e.target.value })
                }
                className="w-full min-h-[42px] px-3 rounded-xl border t7-surface-muted font-mono-num text-xs outline-none"
                style={{ borderColor: 'var(--t7-border)' }}
              />
            </label>

            <label className="space-y-1 text-xs">
              <span className="t7-text-subtle block">資料更新頻率</span>
              <select
                value={notifications.updateFrequency}
                onChange={(e) =>
                  onUpdateNotifications({
                    ...notifications,
                    updateFrequency: e.target.value as NotificationSettings['updateFrequency'],
                  })
                }
                className="w-full min-h-[42px] px-3 rounded-xl border t7-surface-muted text-xs outline-none"
                style={{ borderColor: 'var(--t7-border)' }}
              >
                <option value="hourly">每小時檢查更新</option>
                <option value="daily">每日自動更新（預設）</option>
                <option value="weekly">每週整批更新</option>
              </select>
            </label>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-xs t7-text-subtle block">監控關鍵字清單</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="新增關鍵字（例如：AI 剪輯、台北美食）"
                className="flex-1 min-h-[40px] px-3 rounded-xl border t7-surface-muted text-xs outline-none"
                style={{ borderColor: 'var(--t7-border)' }}
              />
              <button
                type="button"
                onClick={addKeyword}
                className="min-h-[40px] px-3.5 rounded-xl t7-accent-btn text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                新增
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {notifications.alertKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg t7-surface-muted text-xs"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    aria-label={`移除 ${kw}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Region, Language & API Adapter Status */}
        <section className="lg:col-span-5 t7-surface border p-5 space-y-4" style={{ borderColor: 'var(--t7-border)' }}>
          <h2 className="text-base font-bold">地區語系與官方 API 介接狀態</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="t7-text-subtle block">預設地區</span>
              <select
                value={region}
                onChange={(e) => onChangeRegion(e.target.value as RegionId)}
                className="w-full min-h-[40px] px-2.5 rounded-xl border t7-surface-muted text-xs outline-none"
                style={{ borderColor: 'var(--t7-border)' }}
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-1">
              <span className="t7-text-subtle block">顯示語言</span>
              <div className="min-h-[40px] px-2.5 rounded-xl border t7-surface-muted flex items-center text-xs font-medium" style={{ borderColor: 'var(--t7-border)' }}>
                繁體中文（台灣）
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--t7-border)' }}>
            <div className="text-xs font-semibold t7-text-subtle">後端資料介面檢視（未授權明確標示）</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <span>Gemini AI 分析與創作引擎</span>
                <span className="font-mono-num font-semibold">
                  {adapterStatus?.geminiConnected ? '後端已就緒' : '檢查 Secrets 設定'}
                </span>
              </div>
              {adapterStatus &&
                Object.entries(adapterStatus.adapters).map(([key, info]) => (
                  <div key={key} className="py-1.5 border-t" style={{ borderColor: 'var(--t7-border)' }}>
                    <div className="flex items-center justify-between font-medium">
                      <span className="uppercase flex items-center gap-2">
                        <PlatformAppIcon platform={key as SocialPlatform} size="xs" />
                        {key}
                      </span>
                      <span className="font-mono-num t7-text-subtle">
                        {info.connected ? '官方 API 已連線' : '可替換介面（示範/搜尋）'}
                      </span>
                    </div>
                    <div className="text-[11px] t7-text-subtle mt-0.5">{info.label}</div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>

      {/* Flutter Android + GitHub Actions APK Export Center */}
      <section className="t7-surface border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: 'var(--t7-border)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-base">
            <Smartphone className="w-5 h-5" style={{ color: 'var(--t7-accent)' }} />
            Flutter Android 專案原始碼與 GitHub Actions 自動建置 APK
          </div>
          <p className="text-xs t7-text-muted">
            包含完整 Material 3 Dart 專案目錄、Supabase/Firebase 資料庫結構、GitHub Actions 編譯工作流，以及只用 Android 手機上傳 GitHub 與安裝 APK 的圖文步驟教學。
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFlutterKit}
          className="min-h-[44px] px-5 py-2.5 rounded-xl t7-accent-btn text-sm font-semibold flex items-center gap-2 shrink-0 whitespace-nowrap"
        >
          <FolderCode className="w-4 h-4" />
          開啟 Flutter 專案與教學
        </button>
      </section>
    </div>
  );
};
