## Overview

AI companion 維持為第三欄 native section，並提供 `Info` 與 `AI` 兩個 tabs。`AI` tab 內嵌 bundled local WebView，用來載入 avatar WebStage 與精簡控制面板。Native C++ 負責所有 Telegram data access、provider configuration、LLM requests、TTS requests。

## Architecture

WebView bridge 分成兩個訊息方向：

- WebView to native: intent messages，例如 `request_chat_context`、`request_ai_analysis`、`request_tts`。
- Native to WebView: sanitized payloads，例如 `chatContext`、`aiAnalysis`、`ttsStatus`，以及 WebStage commands，例如 `loadCharacter`、`setSpeechAudio`。

WebView 不得直接呼叫 provider APIs，也不得儲存 provider credentials。這樣可以把 API keys 與完整 Telegram session access 留在 web runtime 外面。

## Native Provider Layer

Native side 應新增一層小型 provider facade：

- LLM: 接收 sanitized chat context 與 task，回傳 structured display text，以及可選的 speech text。
- TTS: 接收 speech text，回傳 encoded audio data，或可由 local WebView data handler 讀取的 resource id 與 MIME type。
- Avatar profile: 解析 bundled profile，並傳送 `loadCharacter` 給 WebStage。

Provider settings 優先沿用現有 Telegram/AIRI settings pattern。若需要 persisted settings，簡單值優先使用 safe key-value prefs；如果必須放進 session settings，必須遵守 append-only serialization。

## WebView Runtime

Bundled WebStage 維持為 local qrc content，透過 `navigateToData()` 與 `setDataRequestHandler()` 提供。它需要：

- Render selected AIRI avatar profile。
- 顯示 chat context 與 LLM result status。
- 透過 WebStage speech APIs 播放 TTS audio 並做 lip sync。
- 當 model 或 audio assets 不可用時，降級成 placeholder avatar 與 text-only result。

## Data and Privacy

Chat context extraction 只限 active chat/thread，且只取 bounded recent loaded messages。送給 WebView 的 payload 只包含 message ids、sender display names、outgoing flags、timestamps、text。Provider calls 只能在使用者於 AI tab 明確觸發後發生。

## Failure Handling

Provider failures 必須在 AI tab 顯示清楚狀態，不應關閉第三欄。TTS failure 必須保留 LLM text，並停止 avatar speaking state。Avatar assets 缺失時必須 fallback 到 placeholder runtime。

## Verification

驗證範圍：

- 從 Info 與 AI entry points 開啟第三欄。
- 切換 `Info` 與 `AI` tabs 時不遺失 active chat。
- 在 private chat、bot chat、group、no-active-chat 狀態測試 LLM analysis。
- 測試 TTS playback 與 lip sync stop behavior。
- 重啟 app 後重新開啟 AI tab。
- 使用 `out-fast-arm64-ninja` 做 Debug build。
