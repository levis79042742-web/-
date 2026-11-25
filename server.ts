import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function collectFlutterFiles(dir: string, baseDir: string): Array<{
  path: string;
  title: string;
  category: 'flutter' | 'github' | 'database' | 'guide';
  content: string;
}> {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: Array<{
    path: string;
    title: string;
    category: 'flutter' | 'github' | 'database' | 'guide';
    content: string;
  }> = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFlutterFiles(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      let category: 'flutter' | 'github' | 'database' | 'guide' = 'flutter';
      if (relPath.startsWith('.github/')) category = 'github';
      else if (relPath.startsWith('database/')) category = 'database';
      else if (relPath.endsWith('README_TW.md')) category = 'guide';

      results.push({
        path: relPath,
        title: entry.name,
        category,
        content: fs.readFileSync(fullPath, 'utf-8'),
      });
    }
  }
  return results;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get('/api/adapters/status', (_req, res) => {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    const hasYoutube = Boolean(process.env.YOUTUBE_API_KEY);
    const hasMeta = Boolean(process.env.META_ACCESS_TOKEN);
    const hasTikTok = Boolean(process.env.TIKTOK_RESEARCH_TOKEN);

    res.json({
      geminiConnected: hasGemini,
      adapters: {
        youtube: {
          connected: hasYoutube,
          mode: hasYoutube ? 'official_api' : 'demo_or_search',
          label: hasYoutube ? '已串接 YouTube Data API v3' : '尚未設定 YOUTUBE_API_KEY（可透過搜尋彙整或示範資料檢視）',
        },
        instagram: {
          connected: hasMeta,
          mode: hasMeta ? 'official_api' : 'demo_or_search',
          label: hasMeta ? '已串接 Meta Graph API' : '尚未串接 Meta Graph API（支援搜尋彙整與示範資料）',
        },
        facebook: {
          connected: hasMeta,
          mode: hasMeta ? 'official_api' : 'demo_or_search',
          label: hasMeta ? '已串接 Meta Graph API' : '尚未串接 Meta Graph API（支援搜尋彙整與示範資料）',
        },
        threads: {
          connected: hasMeta,
          mode: hasMeta ? 'official_api' : 'demo_or_search',
          label: hasMeta ? '已串接 Threads API' : '尚未串接 Threads Graph API（支援搜尋彙整與示範資料）',
        },
        tiktok: {
          connected: hasTikTok,
          mode: hasTikTok ? 'official_api' : 'demo_or_search',
          label: hasTikTok ? '已串接 TikTok Research API' : '尚未串接 TikTok Research API（支援搜尋彙整與示範資料）',
        },
        xiaohongshu: {
          connected: false,
          mode: 'demo_or_search',
          label: '小紅書未提供公開官方 API（保留可替換資料介面）',
        },
      },
    });
  });

  // Official YouTube Data API v3 adapter (when YOUTUBE_API_KEY is configured)
  app.get('/api/trends/youtube-official', async (req, res) => {
    const ytKey = process.env.YOUTUBE_API_KEY;
    if (!ytKey) {
      return res.json({
        connected: false,
        items: [],
        message: '尚未設定 YOUTUBE_API_KEY，保留可替換介面。',
      });
    }

    const regionMap: Record<string, string> = {
      TW: 'TW',
      JP: 'JP',
      KR: 'KR',
      US: 'US',
      GLOBAL: 'TW',
    };
    const region = regionMap[String(req.query.region || 'TW')] || 'TW';

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&maxResults=25&key=${encodeURIComponent(ytKey)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `YouTube API 錯誤: ${errText}` });
      }
      const data = (await response.json()) as {
        items?: Array<{
          id: string;
          snippet: {
            title: string;
            description: string;
            channelTitle: string;
            publishedAt: string;
            thumbnails?: { high?: { url: string }; medium?: { url: string } };
            tags?: string[];
          };
          statistics?: {
            viewCount?: string;
            likeCount?: string;
            commentCount?: string;
          };
        }>;
      };

      const nowIso = new Date().toLocaleString('zh-TW', { hour12: false });
      const items = (data.items || []).map((v, idx) => ({
        id: `yt-official-${v.id}`,
        rank: idx + 1,
        rankDelta: 0,
        title: v.snippet.title,
        summary: v.snippet.description.slice(0, 140) || 'YouTube 官方熱門發燒影片',
        platform: 'youtube',
        category: '爆紅影片及短影音',
        region,
        timeRange: '7d',
        creatorName: v.snippet.channelTitle,
        creatorHandle: `@${v.snippet.channelTitle.replace(/\s+/g, '')}`,
        publishedAt: v.snippet.publishedAt.slice(0, 10),
        thumbnailUrl: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || null,
        views: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
        likes: v.statistics?.likeCount ? Number(v.statistics.likeCount) : null,
        comments: v.statistics?.commentCount ? Number(v.statistics.commentCount) : null,
        shares: null,
        growthRate: null,
        viralIndex: Math.max(60, 98 - idx * 2),
        keywords: (v.snippet.tags || []).slice(0, 4),
        hashtags: (v.snippet.tags || []).slice(0, 4).map((t) => `#${t}`),
        originalUrl: `https://www.youtube.com/watch?v=${v.id}`,
        dataSourceType: 'official_api',
        sourceLabel: 'YouTube Data API v3 官方即時數據',
        lastUpdatedAt: nowIso,
        sparkline: [50, 58, 65, 74, 82, 88, 92],
      }));

      return res.json({ connected: true, items, lastUpdatedAt: nowIso });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : '無法連線 YouTube API' });
    }
  });

  // Real-time Web Search Grounded Trends via Gemini Google Search
  app.post('/api/trends/live-search', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: '尚未偵測到 GEMINI_API_KEY，請確認環境設定。',
      });
    }

    const { query = '', platform = 'all', region = 'TW', timeRange = '7d' } = req.body || {};
    const regionLabel =
      region === 'TW' ? '台灣' : region === 'JP' ? '日本' : region === 'KR' ? '韓國' : region === 'US' ? '美國' : '全球';
    const timeLabel =
      timeRange === '24h' ? '最近24小時' : timeRange === '3d' ? '最近3天' : timeRange === '30d' ? '最近30天' : '最近7天';
    const platformLabel =
      platform === 'all' ? 'Instagram、Facebook、YouTube、TikTok、小紅書、Threads' : String(platform);

    const prompt = `請使用 Google 搜尋查詢「${regionLabel}」在「${timeLabel}」於「${platformLabel}」社群平台上的真實熱門爆紅話題${query ? `（關鍵字聚焦：${query}）` : ''}。
重要誠實原則：
1. 只整理真實搜尋到的近期話題與事件，絕對不要捏造觀看數、按讚數或留言數。
2. 若無法從公開網頁確認精確數字，請在數值欄位填 null（前端會顯示「暫無資料」）。
3. 請以繁體中文回覆，並嚴格輸出一個 JSON 陣列（不要包含 markdown 以外的說明文字），每個物件包含：
- title: 話題或爆紅內容標題
- summary: 60字以內的真實原因摘要
- platform: 必須為 "instagram" | "facebook" | "youtube" | "tiktok" | "xiaohongshu" | "threads" 之一
- category: 從「爆紅影片及短影音、熱門貼文、熱門新聞及時事、流行音樂及背景配樂、熱門 Hashtag、網路迷因及流行語、熱門商品、美食及旅遊、美妝及穿搭、明星及網紅、寵物及搞笑、AI 科技、生活及娛樂」選一個最貼近的
- creatorName: 相關創作者、媒體或話題來源名稱（若無特定單一創作者寫「社群公開話題」）
- publishedAt: YYYY-MM-DD（若無確切日期寫今日）
- viralIndex: 0~100 根據討論熱度的評估分數
- keywords: 3個繁體中文關鍵字陣列
- hashtags: 3個含 # 的標籤陣列
- originalUrl: 相關真實網頁或搜尋連結（若無則提供平台搜尋頁）`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = (response.text || '').trim();
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingUrls = chunks
        .map((c: { web?: { uri?: string; title?: string } }) => ({
          uri: c.web?.uri || '',
          title: c.web?.title || '搜尋來源',
        }))
        .filter((u: { uri: string }) => Boolean(u.uri));

      let parsedList: Array<Record<string, unknown>> = [];
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsedList = JSON.parse(jsonMatch[0]);
        } catch {
          parsedList = [];
        }
      }

      const nowLabel = new Date().toLocaleString('zh-TW', { hour12: false });
      const validPlatforms = new Set(['instagram', 'facebook', 'youtube', 'tiktok', 'xiaohongshu', 'threads']);

      const items = parsedList.slice(0, 12).map((entry, idx) => {
        const plat = validPlatforms.has(String(entry.platform)) ? String(entry.platform) : 'threads';
        return {
          id: `live-${Date.now()}-${idx}`,
          rank: idx + 1,
          rankDelta: 999,
          title: String(entry.title || '即時搜尋熱門話題'),
          summary: String(entry.summary || ''),
          platform: plat,
          category: String(entry.category || '熱門新聞及時事'),
          region,
          timeRange,
          creatorName: String(entry.creatorName || '社群公開彙整'),
          creatorHandle: '@live_search',
          publishedAt: String(entry.publishedAt || new Date().toISOString().slice(0, 10)),
          thumbnailUrl: null,
          views: null,
          likes: null,
          comments: null,
          shares: null,
          growthRate: null,
          viralIndex: Math.min(100, Math.max(50, Number(entry.viralIndex) || 82 - idx * 2)),
          keywords: Array.isArray(entry.keywords) ? entry.keywords.map(String).slice(0, 4) : [],
          hashtags: Array.isArray(entry.hashtags) ? entry.hashtags.map(String).slice(0, 4) : [],
          originalUrl: String(entry.originalUrl || groundingUrls[idx]?.uri || 'https://www.google.com/search?q=' + encodeURIComponent(String(entry.title || query))),
          dataSourceType: 'live_search',
          sourceLabel: 'Google 搜尋即時彙整（公開數據未列數字顯示暫無資料）',
          lastUpdatedAt: nowLabel,
          sparkline: [30, 42, 55, 68, 77, 84, 88],
        };
      });

      return res.json({
        items,
        groundingUrls,
        rawSummary: parsedList.length === 0 ? rawText : undefined,
        lastUpdatedAt: nowLabel,
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : '即時搜尋彙整失敗',
      });
    }
  });

  // AI Deep Trend Analysis
  app.post('/api/ai/analyze', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: '尚未設定 GEMINI_API_KEY，請於 AI Studio Secrets 面板確認。' });
    }

    const { title, platform, category, summary, region = 'TW' } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: '請提供欲分析的話題標題。' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `請以資深社群數據分析師與台灣電商選品顧問的角度，深度分析以下社群趨勢話題：
標題：${title}
所屬平台：${platform || '跨平台'}
內容分類：${category || '未分類'}
地區：${region}
內容摘要：${summary || '無'}

請以繁體中文提供務實、不空泛、具可執行性的分析。`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              viralReason: { type: Type.STRING, description: 'AI 分析爆紅原因（情緒價值、演算法機制與受眾痛點）' },
              nextWavePrediction: { type: Type.STRING, description: 'AI 預測下一波延伸熱門趨勢與變體題材' },
              crossPlatformComparison: { type: Type.STRING, description: 'AI 跨平台話題比對（在 IG/TikTok/Threads/YouTube/小紅書/FB 擴散差異）' },
              commerceOpportunity: { type: Type.STRING, description: 'AI 熱門商品商機與變現切入點分析' },
              recommendedAngles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 個創作者可立刻跟進的切角建議',
              },
              disclaimer: { type: Type.STRING, description: '簡短分析性質聲明，提醒以實際平台數據為準' },
            },
            required: [
              'viralReason',
              'nextWavePrediction',
              'crossPlatformComparison',
              'commerceOpportunity',
              'recommendedAngles',
              'disclaimer',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      return res.json(parsed);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'AI 分析請求失敗',
      });
    }
  });

  // AI Daily & Weekly Summary + Personalized Ideas
  app.post('/api/ai/summary', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: '尚未設定 GEMINI_API_KEY。' });
    }

    const { region = 'TW', preferredCategories = [], topTitles = [] } = req.body || {};
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `請根據以下當前平台熱門話題與使用者關注分類，產生「這週紅什麼 Trend7」每日及每週趨勢摘要與個人化創作靈感。
地區：${region}
使用者關注分類：${Array.isArray(preferredCategories) && preferredCategories.length > 0 ? preferredCategories.join('、') : '美食及旅遊、AI 科技、生活及娛樂'}
目前熱門話題參考：
${Array.isArray(topTitles) ? topTitles.slice(0, 8).map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') : '無'}

請使用繁體中文輸出結構化 JSON。`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dailySummary: { type: Type.STRING, description: '今日重點趨勢總覽（100字左右）' },
              weeklyHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3~4 點本週六大社群關鍵變化',
              },
              emergingKeywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    momentum: { type: Type.STRING },
                    platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
              },
              personalizedIdeas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    format: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                },
              },
            },
            required: ['dailySummary', 'weeklyHighlights', 'emergingKeywords', 'personalizedIdeas'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      return res.json(parsed);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'AI 摘要生成失敗',
      });
    }
  });

  // AI Creative Studio: Scripts, Titles, Captions, Hashtags, Video & Image Prompts
  app.post('/api/ai/create', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: '尚未設定 GEMINI_API_KEY。' });
    }

    const { topic, targetPlatform = 'TikTok / Reels', tone = '高互動接地氣', duration = '30 秒' } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: '請輸入創作主題或選擇熱門話題。' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `請擔任台灣頂尖短影音與社群內容總監，針對主題「${topic}」為創作者製作全套內容創作包。
目標主平台：${targetPlatform}
內容語氣：${tone}
預期影片長度：${duration}

請產出：
1. 完整短影音腳本（含前3秒黃金鉤子 hook、分鏡秒數/畫面/旁白/字幕、結尾行動呼籲 CTA）
2. 5 個高點擊率影片標題
3. 3 個不同平台的貼文文案（例如 IG/Threads/小紅書）
4. Hashtag 推薦（分高流量大眾標籤與精準長尾標籤）
5. AI 影片生成提示詞（適合 Veo / Sora / Runway 的詳細英文畫面描述 + 運鏡）
6. AI 圖片生成提示詞（適合 Gemini / Midjourney 的封面圖詳細英文視覺描述）`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              shortVideoScript: {
                type: Type.OBJECT,
                properties: {
                  hook: { type: Type.STRING },
                  scenes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeRange: { type: Type.STRING },
                        visual: { type: Type.STRING },
                        voiceover: { type: Type.STRING },
                        caption: { type: Type.STRING },
                      },
                    },
                  },
                  cta: { type: Type.STRING },
                },
              },
              videoTitles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              socialCaptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    platform: { type: Type.STRING },
                    copy: { type: Type.STRING },
                  },
                },
              },
              hashtags: {
                type: Type.OBJECT,
                properties: {
                  highTraffic: { type: Type.ARRAY, items: { type: Type.STRING } },
                  nicheTargeted: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
              videoPrompt: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
            },
            required: [
              'shortVideoScript',
              'videoTitles',
              'socialCaptions',
              'hashtags',
              'videoPrompt',
              'imagePrompt',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      return res.json(parsed);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'AI 創作包生成失敗',
      });
    }
  });

  // Return complete Flutter Android project + GitHub Actions + DB schemas
  app.get('/api/flutter-kit', (_req, res) => {
    const flutterDir = path.resolve(__dirname, 'flutter_app');
    const files = collectFlutterFiles(flutterDir, flutterDir);
    res.json({ files });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trend7 server running on http://0.0.0.0:${PORT}`);
  });
}

createServer();
