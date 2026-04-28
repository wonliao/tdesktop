## Context

Telegram Plus currently embeds AIRI stage as bundled WebView resources under `Telegram/Resources/airi_stage/`. `Ai::Section` owns the safe data-request handler, WebView message bridge, active chat context extraction, and native provider facade. The current `Ai::ProviderFacade` is a native-local fallback and does not expose user-configurable Chat service sources.

AIRI Plus already implements OpenAI subscription as a desktop-only provider named `openai-subscription`. It is separate from the OpenAI API key provider because it uses ChatGPT/Codex OAuth tokens, rewrites requests to the ChatGPT Codex backend endpoint, and normalizes Responses API events back into Chat Completions-style chunks for existing streaming code.

## Goals / Non-Goals

**Goals:**

- Add `OpenAI (Subscription)` to the Chat service source UI.
- Reuse AIRI Plus provider semantics: OAuth login, desktop-only availability, no API key field, explicit model list, login validation.
- Keep OpenAI subscription tokens and backend calls native-owned.
- Preserve the existing AI tab bridge behavior for active chat context, AI Brief, avatar, and TTS.

**Non-Goals:**

- Merge OpenAI API key provider and OpenAI subscription into one provider.
- Expose refresh tokens or direct ChatGPT/Codex fetch ability to WebView JavaScript.
- Add Telegram cloud sync for OpenAI subscription auth state.
- Rework the full AIRI provider system beyond the minimum needed for Chat service source support.

## Decisions

- Treat Telegram Plus WebView as equivalent to AIRI desktop/tamagotchi for provider availability. The AIRI stage build should set the desktop runtime environment so `openai-subscription` is visible in Chat provider settings.
- Implement the privileged OpenAI subscription operations in C++, not in bundled JavaScript. The WebView may request login/logout/proxy operations through the existing trusted bridge; native code performs browser OAuth, token exchange, refresh, request rewrite, and stream normalization.
- Persist tokens through the generic settings pref facility instead of appending fields to `Core::Settings` binary serialization. Use the same logical key as AIRI Plus, `auth/v1/providers/openai-subscription`, to keep behavior recognizable and avoid stream-order migration risk.
- Keep the request/proxy contract aligned with AIRI Plus:
  - OAuth issuer: `https://auth.openai.com`
  - client id: `app_EMoamEEZ73f0CkXaXp7hrann`
  - callback path: `/auth/callback`
  - preferred loopback port: `1455`
  - Codex endpoint: `https://chatgpt.com/backend-api/codex/responses`
- Keep model listing static for v1 and match the AIRI Plus allowed model list unless implementation discovers that a model is no longer supported during verification.

## Bridge Shape

The WebView bridge should provide the same functional surface AIRI stage expects from Electron:

- start OpenAI subscription login and deliver either token payload or error event.
- clear OpenAI subscription tokens on logout.
- proxy a provider request with `{ url, method, headers, body, tokens }` and return `{ response, tokens }`, where `tokens` may contain refreshed values.

If a direct Eventa-compatible shim is simpler than modifying generated AIRI assets, inject it in `Ai::Section::setupWebview()` before navigating to AIRI stage resources. The shim must only expose the OpenAI subscription events required by the provider.

## Failure Handling

- If no stored token exists, provider validation reports login required.
- If token refresh fails, clear or invalidate the stored token state and return a structured auth error to the WebView.
- If the Codex backend request fails, return the backend status and response body through the provider error path; do not crash the AI tab.
- If the loopback callback cannot bind to the preferred port, fail visibly rather than silently falling back to an unregistered callback unless the implementation verifies a compatible alternate redirect URI.

## Risks / Trade-offs

- AIRI stage bundled assets are generated and may create large diffs. Mitigation: rebuild from the aligned AIRI Plus source once, then include only required resource changes and regenerated qrc entries.
- The ChatGPT/Codex backend is not the public OpenAI API. Mitigation: isolate all backend-specific normalization and SSE translation in one native service and cover it with focused tests.
- WebView/Electron compatibility shims can become brittle. Mitigation: keep the shim narrow and documented by tests or a manual bridge smoke check.
