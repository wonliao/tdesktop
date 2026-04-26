## 1. Native Provider Interfaces

- [x] 1.1 新增 native AI provider facade，用於 LLM analysis requests 與 structured results。
- [x] 1.2 新增 native configuration loading，支援 LLM provider endpoint、model、credentials，且不把 secrets 暴露給 WebView。
- [x] 1.3 新增 native TTS provider facade，回傳 playable audio bytes 或 WebView-served resource id。
- [x] 1.4 新增 LLM 與 TTS failure result types，讓 AI tab 可以顯示錯誤狀態。

## 2. WebView Bridge

- [x] 2.1 擴充 AI section message handler，讓 `request_ai_analysis` 走 native LLM provider facade。
- [x] 2.2 擴充 AI section message handler，讓 `request_tts` 走 native TTS provider facade。
- [x] 2.3 新增 bridge payloads，涵蓋 successful LLM text、speech text、TTS status、provider failures。
- [x] 2.4 保持 chat context extraction 只取 active chat/thread 與 recent loaded messages，且有上限。

## 3. AIRI Avatar Runtime

- [x] 3.1 新增 bundled AIRI avatar profile metadata，供 WebStage runtime 使用。
- [ ] 3.2 新增必要 VRM 或 Live2D avatar assets 的 qrc packaging。
- [x] 3.3 AI tab ready 時，送出含 configured AIRI avatar profile 的 `loadCharacter`。
- [x] 3.4 avatar assets 缺失或載入失敗時，fallback 到 placeholder avatar。

## 4. AI Tab UI

- [x] 4.1 更新 bundled AI page，顯示 chat context state、LLM response state、TTS state。
- [x] 4.2 將 LLM action button 串到 native LLM results 顯示。
- [x] 4.3 將 TTS action button 串到 native TTS audio，並透過 WebStage lip sync 播放。
- [x] 4.4 切換 Info/AI tabs 時保留 active chat context。

## 5. Verification

- [x] 5.1 執行 `openspec validate integrate-ai-avatar-providers --strict`。
- [x] 5.2 執行 `cmake --build out-fast-arm64-ninja --target Telegram`。
- [x] 5.3 對本次修改的 bundled AI/WebStage JavaScript files 執行 `node --check`。
- [ ] 5.4 手動驗證 private chat、bot chat、group chat、no-active-chat、tab switching、third-column close/reopen、app restart。
