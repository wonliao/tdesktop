## Context

The third-column AI companion already owns the native/WebView boundary. `Ai::Section::chatContext()` collects recent loaded text messages for the active chat, `Ai::Section::handleMessage()` accepts WebView events, and `Ai::ProviderFacade::analyze()` returns an `aiAnalysis` payload without exposing provider credentials to JavaScript.

The AIRI stage resources are a bundled static WebView app, so editing the generated asset bundle directly is risky. The v1 brief UI should be injected by the native WebView bootstrap layer, keeping this change small and independent of AIRI build output.

## Goals / Non-Goals

**Goals:**

- Add an AI Brief action inside the existing AI tab.
- Summarize the current active chat's bounded recent text context.
- Render the result inside the right AI panel.
- Preserve native ownership of context extraction and provider calls.

**Non-Goals:**

- Add right-click context menu actions for selected messages.
- Insert brief text into the message compose field.
- Implement provider settings UI or expose LLM credentials to WebView.
- Rebuild or restructure the AIRI stage-web application.

## Decisions

- Use the AI tab as the only trigger for v1. This matches the requested entry point and avoids changing message context menus or selection semantics.
- Reuse `chatContext()` as the data source. It already enforces active-chat availability, loaded-message bounds, and text-only filtering.
- Represent AI Brief as `request_ai_analysis` with task `ai_brief`. This keeps the bridge protocol compatible with existing analysis events while giving native code a stable task discriminator.
- Inject a small native-controlled UI overlay or panel script from `Ai::Section::setupWebview()` instead of editing minified AIRI assets. This avoids committing generated bundle churn and keeps the feature close to the native bridge.
- Return the brief through the existing `aiAnalysis` event shape using `displayText` and failure payloads. WebView only renders the returned text/status.

## Risks / Trade-offs

- Native-injected UI may visually differ from the AIRI app style. Mitigation: keep the control compact and use neutral panel styling that does not overlap core AIRI content.
- The native fallback brief is heuristic until a real external provider is wired. Mitigation: structure the provider task so future LLM integration can replace generation without changing the UI bridge.
- `chatContext()` only includes already-loaded recent text messages. Mitigation: describe the result as a brief of current recent context and preserve the existing bounded limit.

## Migration Plan

No storage migration is required. The change can be rolled back by removing the injected AI Brief UI handling and the `ai_brief` task branch; existing AI tab context, analysis, avatar, and TTS flows remain compatible.
