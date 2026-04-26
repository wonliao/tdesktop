# Third Column AI Companion 規格

## Purpose

定義 Telegram third column 的 Info/AI tabs、bundled WebView AI interface、native chat context bridge、native-owned LLM/TTS provider calls，以及 AIRI avatar profile 載入與 fallback 行為。
## Requirements
### Requirement: Third column exposes Info and AI tabs
The application SHALL 在 active chat 支援 third-column content 時，把第三欄呈現為含 Info 與 AI 兩個頁面的 tabbed surface。

#### Scenario: Open from info entry point
- **WHEN** 使用者從 chat info entry point 開啟第三欄
- **THEN** 第三欄顯示 Info tab 為 active，並保留 AI tab 可切換

#### Scenario: Open from AI entry point
- **WHEN** 使用者從 compose AI entry point 開啟第三欄
- **THEN** 第三欄顯示 AI tab 為 active，並保留 Info tab 可切換

#### Scenario: Switch tabs
- **WHEN** 使用者在 Info 與 AI tabs 之間切換
- **THEN** 第三欄保留 active chat context，且不關閉任一頁面

### Requirement: AI page uses bundled local WebView resources
The AI page SHALL 從 application bundled resources 載入 AIRI stage-web UI and required runtime assets.

#### Scenario: Load AIRI stage offline
- **WHEN** AI tab 被開啟，且沒有外部 AIRI dev server 或 local web server 正在執行
- **THEN** WebView 載入 bundled AIRI stage-web interface

#### Scenario: Preserve AIRI hash-route navigation
- **WHEN** AIRI stage-web 在 WebView 內進行 hash-route navigation
- **THEN** navigation stays inside the bundled AIRI WebView application and does not open an external browser

#### Scenario: Block unsafe resource paths
- **WHEN** WebView 請求 bundled AIRI resource prefix 之外的 path 或包含 unsafe traversal 的 path
- **THEN** native data request handler 拒絕該請求

#### Scenario: Missing AIRI asset
- **WHEN** bundled AIRI root document or required asset cannot be loaded
- **THEN** AI tab shows the native fallback surface and Telegram remains usable

### Requirement: Native bridge provides bounded chat context
The native bridge SHALL 在 AI page 請求時提供 sanitized active-chat context。

#### Scenario: Request chat context
- **WHEN** AI page 請求 chat context
- **THEN** native code 只回傳 active chat 或 thread 中已載入的 recent messages，且不超過 configured limit

#### Scenario: No active chat
- **WHEN** AI page 在沒有 active chat 的狀態下請求 chat context
- **THEN** native code 回傳 unavailable context 與 reason，且不 crash

### Requirement: Native bridge owns LLM provider calls
The native bridge SHALL 透過 native provider code 執行 LLM analysis，而不是從 WebView JavaScript 直接呼叫 provider。

#### Scenario: Request LLM analysis
- **WHEN** 使用者從 AI tab 啟動 LLM analysis
- **THEN** WebView 送出 intent 給 native code，且 native code 將 LLM result payload 回傳給 AI page

#### Scenario: LLM provider failure
- **WHEN** LLM provider request 失敗
- **THEN** AI page 顯示 failure status，且 third column 維持開啟

### Requirement: Native bridge owns TTS provider calls
The native bridge SHALL 透過 native provider code 執行 TTS generation，並提供 playable speech data 給 avatar runtime。

#### Scenario: Request TTS playback
- **WHEN** 使用者要求對 AI response 進行 TTS playback
- **THEN** native code 回傳 speech audio 或 local resource id，且 WebStage avatar 以 lip sync 播放

#### Scenario: TTS provider failure
- **WHEN** TTS generation 失敗
- **THEN** AI page 保留 text response，並停止 avatar speaking state

### Requirement: AIRI avatar profile loads in AI tab
The AI page SHALL 透過 bundled WebStage runtime 載入 AIRI avatar profile。

#### Scenario: Load avatar profile
- **WHEN** AI tab 進入 ready 狀態
- **THEN** native code 送出 WebStage load command 載入 configured AIRI avatar profile

#### Scenario: Avatar asset unavailable
- **WHEN** configured AIRI avatar asset 無法載入
- **THEN** AI page fallback 到 placeholder avatar，且 text results 仍可使用
