## Why

目前第三欄 AI 介面已證明 local WebView shell、Info/AI tabs、native chat-context bridge 可行，但 LLM、TTS、AIRI avatar 載入仍停留在 preview 層。下一步要把這個 shell 做成可用的 AI companion，同時讓密鑰、Telegram 資料擷取、provider 呼叫都留在 native C++。

## What Changes

- 新增 native-owned LLM request handling，供第三欄 AI 頁使用。
- 新增 native-owned TTS generation，並把可播放的 speech audio 傳給 bundled WebStage 做 lip sync。
- 新增 bundled AIRI avatar profile 載入，支援 VRM 或 Live2D assets。
- WebView 保持為本地 packaged UI，只送出 intent 並接收 sanitized result。
- 保留 Info/AI tabbed third column 與 active-chat context 行為。
- 增加 private chats、bot chats、groups、tab switching、app restart 的驗證覆蓋。

## Capabilities

### New Capabilities

- `third-column-ai-companion`: 第三欄 AI companion 行為，涵蓋 chat context、LLM analysis、TTS playback、AIRI avatar rendering。

### Modified Capabilities

None.

## Impact

- Affected UI: third-column Info/AI tab wrapper、AI WebView page、AI button entry points。
- Affected native code: AI section bridge、chat context extraction、provider configuration、request routing。
- Affected resources: bundled avatar WebStage resources、optional VRM/Live2D profile assets、qrc packaging。
- Security impact: provider credentials 與 raw Telegram data 維持 native-owned；WebView 只接收 sanitized context 與 result payloads。
