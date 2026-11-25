import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { Check, Copy, Download, FileCode2, FolderTree, Smartphone, X } from 'lucide-react';
import { FlutterKitFile } from '../types/trend';

interface FlutterKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterKitModal: React.FC<FlutterKitModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<FlutterKitFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('README_TW.md');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FlutterKitFile['category']>('all');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen || files.length > 0) return;
    setLoading(true);
    fetch('/api/flutter-kit')
      .then((r) => r.json())
      .then((data) => {
        const list: FlutterKitFile[] = data.files || [];
        setFiles(list);
        if (list.some((f) => f.path === 'README_TW.md')) {
          setSelectedPath('README_TW.md');
        } else if (list[0]) {
          setSelectedPath(list[0].path);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, files.length]);

  if (!isOpen) return null;

  const visibleFiles =
    categoryFilter === 'all' ? files : files.filter((f) => f.category === categoryFilter);
  const activeFile = files.find((f) => f.path === selectedPath) || visibleFiles[0];

  const copyContent = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadZip = async () => {
    if (files.length === 0) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        zip.file(`trend7_flutter_app/${file.path}`, file.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trend7_flutter_android_project.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Flutter Android 專案與 APK 自動建置中心"
    >
      <div className="w-full max-w-5xl h-[88vh] t7-surface border rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--t7-border)' }}>
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5" style={{ color: 'var(--t7-accent)' }} />
            <div>
              <h2 className="text-base font-bold">Flutter Android 專案與 GitHub Actions APK 中心</h2>
              <p className="text-xs t7-text-subtle">含完整 Dart Material 3 原始碼、Supabase/Firebase 結構與手機免電腦上架建置教學</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadZip}
              disabled={downloading || files.length === 0}
              className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold t7-accent-btn flex items-center gap-2 hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {downloading ? '打包中...' : '下載完整專案 (.zip)'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl t7-surface-muted"
              aria-label="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b overflow-x-auto no-scrollbar shrink-0" style={{ borderColor: 'var(--t7-border)' }}>
          {[
            { id: 'all', label: '全部檔案' },
            { id: 'guide', label: '手機 GitHub 上傳 & APK 安裝教學' },
            { id: 'github', label: 'GitHub Actions APK 設定' },
            { id: 'database', label: 'Supabase / Firebase 資料庫' },
            { id: 'flutter', label: 'Flutter Dart 程式碼' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCategoryFilter(tab.id as 'all' | FlutterKitFile['category']);
                const firstMatch = tab.id === 'all' ? files[0] : files.find((f) => f.category === tab.id);
                if (firstMatch) setSelectedPath(firstMatch.path);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === tab.id ? 't7-accent-btn' : 't7-surface-muted t7-text-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            <div className="h-6 w-48 rounded t7-skeleton" />
            <div className="h-64 w-full rounded t7-skeleton" />
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
            {/* File Tree */}
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r overflow-y-auto p-3 space-y-1 max-h-48 md:max-h-none" style={{ borderColor: 'var(--t7-border)' }}>
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold t7-text-subtle">
                <FolderTree className="w-3.5 h-3.5" />
                專案目錄 ({visibleFiles.length})
              </div>
              {visibleFiles.map((f) => (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => setSelectedPath(f.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono-num flex items-center gap-2 transition-colors ${
                    activeFile?.path === f.path ? 't7-accent-soft font-semibold' : 'hover:opacity-80 t7-text-muted'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.path}</span>
                </button>
              ))}
            </div>

            {/* Code / Guide Content */}
            <div className="md:col-span-8 flex flex-col min-h-0">
              {activeFile && (
                <>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0" style={{ borderColor: 'var(--t7-border)' }}>
                    <span className="text-xs font-mono-num t7-text-muted truncate">{activeFile.path}</span>
                    <button
                      type="button"
                      onClick={copyContent}
                      className="min-h-[36px] px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
                      style={{ borderColor: 'var(--t7-border)' }}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? '已複製' : '複製內容'}
                    </button>
                  </div>
                  <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed font-mono-num whitespace-pre-wrap break-words">
                    {activeFile.content}
                  </pre>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
