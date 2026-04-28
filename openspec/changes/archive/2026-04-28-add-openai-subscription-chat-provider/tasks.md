## 1. OpenSpec

- [x] 1.1 Create proposal, design, tasks, and `third-column-ai-companion` spec delta for OpenAI subscription Chat provider.
- [x] 1.2 Validate `add-openai-subscription-chat-provider` with `openspec validate add-openai-subscription-chat-provider --strict`.

## 2. AIRI Stage Provider Surface

- [x] 2.1 Port or rebuild AIRI stage so `openai-subscription` appears in Chat service sources for the embedded desktop runtime.
- [x] 2.2 Ensure provider UI has login/logout/validation behavior and no API key field.
- [x] 2.3 Sync updated bundled assets and qrc entries into Telegram resources.

## 3. Native OpenAI Subscription Service

- [x] 3.1 Add native OAuth PKCE login with loopback callback and system browser launch.
- [x] 3.2 Persist, read, refresh, and clear OpenAI subscription tokens through generic settings prefs.
- [x] 3.3 Add native proxy fetch that rewrites compatible OpenAI requests to the Codex endpoint.
- [x] 3.4 Normalize request bodies and translate Codex Responses SSE/JSON into the provider-compatible Chat Completions shape.

## 4. WebView Bridge Integration

- [x] 4.1 Expose the minimum OpenAI subscription auth/proxy bridge expected by AIRI stage.
- [x] 4.2 Keep refresh tokens and backend credentials out of WebView-accessible state.
- [x] 4.3 Preserve existing AI tab chat context, AI Brief, avatar, and TTS bridge flows.

## 5. Verification

- [ ] 5.1 Add focused tests or test helpers for request normalization, SSE translation, token refresh, and invalid auth handling.
- [x] 5.2 Build Debug target with `cmake --build out --config Debug --target Telegram`.
- [ ] 5.3 Manually verify Chat service source shows `OpenAI (Subscription)`, login succeeds, validation changes to valid, model selection works, and a Chat response streams.
- [ ] 5.4 Manually verify logout invalidates the provider and existing native-local AI Brief/avatar/TTS flows still work.
