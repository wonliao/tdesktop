## Why

目前 Telegram Plus 的 AI tab 已能嵌入 AIRI stage 並由 native bridge 持有 chat context、LLM/TTS 呼叫，但「服務來源 -> Chat」尚未提供 AIRI Plus 既有的 OpenAI 訂閱登入來源。使用者如果有 ChatGPT/Codex 訂閱，仍缺少不輸入 API key、直接以訂閱權益使用 Chat provider 的入口。

這個 change 要把 AIRI Plus 的 `openai-subscription` provider 對齊到 Telegram Plus，讓 Chat 服務來源可選 OpenAI 訂閱，並維持 token 與 ChatGPT/Codex backend 呼叫由 native 層代理。

## What Changes

- 在 AI tab 的「服務來源 -> Chat」新增 `OpenAI (Subscription)` provider。
- Provider 使用 ChatGPT/Codex 訂閱 OAuth + PKCE 登入，不要求 OpenAI API key。
- Native bridge 新增 OpenAI 訂閱登入、登出、token refresh、proxy fetch 能力。
- Native proxy 將 OpenAI-compatible chat requests normalize 成 ChatGPT/Codex backend 可接受的 Responses request，並把 Responses SSE 轉回 Chat Completions-style stream。
- Token 與 refresh token 只存放在 native/local settings，WebView 不直接接觸 refresh token 或 ChatGPT backend secret。
- 既有 native-local AI Brief、avatar、TTS、chat context bridge 行為保持可用。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `third-column-ai-companion`: AI tab 的 Chat 服務來源新增 OpenAI 訂閱 provider，並要求 OpenAI 訂閱 auth/proxy flows 維持 native-owned credential boundary。

## Impact

- Affected UI: AIRI stage provider catalog、Chat provider settings、model selection。
- Affected native code: `Ai::Section` WebView bridge handling、new native OpenAI subscription auth/proxy service、settings persistence。
- Affected bundled resources: `Telegram/Resources/airi_stage/` and `Telegram/Resources/qrc/telegram/airi_stage.qrc` after rebuilding/syncing AIRI stage assets。
- Affected specs: `third-column-ai-companion`。
- Security impact: adds OAuth tokens and ChatGPT/Codex proxying; tokens must stay native-owned and must not be exposed to arbitrary WebView JavaScript beyond the minimum response events required for provider state.
