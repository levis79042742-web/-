# 這週紅什麼 Trend7｜Flutter Android 專案、資料庫與手機雲端建置 APK 完整教學

## 一、專案目錄結構
```text
flutter_app/
├── .github/
│   └── workflows/
│       └── build-apk.yml          # GitHub Actions 自動建置 Android APK
├── database/
│   ├── supabase_schema.sql        # Supabase PostgreSQL 資料庫結構與 RLS
│   └── firestore.rules            # Firebase Firestore 安全規則
├── lib/
│   ├── main.dart                  # App 主入口與五分頁底部導覽列
│   ├── models/
│   │   └── trend_item.dart        # 趨勢資料模型（支援暫無資料 null 安全處理）
│   ├── services/
│   │   ├── trend_repository.dart  # 六大平台可替換資料介面與快取層
│   │   └── ai_service.dart        # 後端安全 AI API 代理呼叫（無暴露金鑰）
│   ├── theme/
│   │   └── app_themes.dart        # 六種 Material 3 主題設定
│   └── screens/
│       ├── home_screen.dart       # 首頁（今日焦點、本週爆紅、AI 摘要）
│       ├── ranking_screen.dart    # 排行榜（平台/時間/地區/分類/分頁）
│       ├── ai_studio_screen.dart  # AI 創作中心（腳本、標題、文案、提示詞）
│       ├── bookmarks_screen.dart  # 離線收藏中心
│       └── settings_screen.dart   # 個人設定與主題切換
└── pubspec.yaml
```

---

## 二、安全後端與官方 API 串接設定

> **安全原則**：所有 API 金鑰（`GEMINI_API_KEY`、`YOUTUBE_API_KEY`、`META_ACCESS_TOKEN`）**必須存放在後端伺服器（如 Cloud Run / Express / Supabase Edge Functions）**，絕對不要寫進 Flutter Dart 程式碼中！

1. **後端代理端點（本專案附帶 `server.ts`）**：
   - `GET /api/trends`：聚合 YouTube Data API v3 與 Google 搜尋即時趨勢，無法取得的平台欄位一律回傳 `null`（App 端顯示「暫無資料」）。
   - `POST /api/ai/analyze`：後端呼叫 Gemini API 分析爆紅原因與商機。
   - `POST /api/ai/create`：後端生成短影音腳本、標題、貼文文案與圖片/影片提示詞。
2. **替換平台官方 API 的方法**：
   - 在 `lib/services/trend_repository.dart` 實作 `TrendDataAdapter` 介面。
   - 若申請取得 **YouTube Data API v3**、**Meta Graph API (IG/FB/Threads)** 或 **TikTok Research API** 權限，於後端 `.env` 設定對應金鑰即可立即切換為 `official_api` 模式。
3. **GitHub Secrets 設定（給 APK 使用後端網址）**：
   - 進入 GitHub Repository → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`。
   - 新增名稱：`TREND7_API_BASE_URL`，填入您部署好的後端網址（例如 `https://your-trend7-server.run.app`）。

---

## 三、只用「Android 手機」操作 GitHub 上傳與安裝 APK 教學

沒有電腦也能完全用 Android 手機完成上傳、自動編譯與安裝！

### 步驟 1：從本應用下載專案壓縮檔
1. 在本 App 的「設定」→「Flutter 專案與 APK 建置中心」點擊 **「下載完整 Flutter 專案 (.zip)」**。
2. 用手機內建的「Files（檔案）」App 找到下載的 `trend7_flutter_project.zip`，點擊「解壓縮」。

### 步驟 2：在手機上建立 GitHub Repository 並上傳檔案
1. 用手機瀏覽器（Chrome）登入 [GitHub](https://github.com)，切換為「電腦版網站」或直接點擊右上角 `+` → `New repository`。
2. Repository 名稱填入 `trend7-android`，設為 Public 或 Private，點擊 `Create repository`。
3. 在新建好的 Repository 頁面，點擊 **`uploading an existing file`**（或點擊 `Add file` → `Upload files`）。
4. 將解壓縮後的 `flutter_app/` 內所有檔案與 `.github` 資料夾拖入／選取上傳（建議若手機無法一次選取隱藏資料夾 `.github`，可於 GitHub 網頁點 `Add file` → `Create new file`，檔名輸入 `.github/workflows/build-apk.yml` 並貼上工作流內容）。
5. 點擊下方的 **`Commit changes`**。

### 步驟 3：自動建置 Android APK（GitHub Actions）
1. Commit 完成後，點擊 Repository 上方的 **`Actions`** 分頁。
2. 您會看到 `Build Trend7 Android APK` 正在自動執行（約需 3～5 分鐘）。
3. 執行完成呈現綠色勾勾後，點進該次執行紀錄，滑到最下方 **`Artifacts`** 區塊。
4. 點擊 **`trend7-release-apk`** 下載壓縮包，解壓縮即可取得 **`app-release.apk`**。

### 步驟 4：在 Android 手機安裝 APK
1. 在手機檔案管理員點擊 `app-release.apk`。
2. 若系統提示「為了安全起見，您的手機目前不允許安裝來自這個來源的未知應用程式」，點擊 **「設定」** → 開啟 **「允許來自此來源的應用程式」**。
3. 返回點擊 **「安裝」**，完成後即可在手機桌面開啟「這週紅什麼 Trend7」！
