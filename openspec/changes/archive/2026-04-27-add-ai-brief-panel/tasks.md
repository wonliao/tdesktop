## 1. OpenSpec

- [x] 1.1 Add proposal, design, tasks, and third-column AI companion spec delta for AI Brief.
- [x] 1.2 Validate `add-ai-brief-panel` with `openspec validate add-ai-brief-panel --strict`.

## 2. Native Bridge And Provider

- [x] 2.1 Add an `ai_brief` task branch to native analysis generation using the existing active chat context payload.
- [x] 2.2 Preserve existing `request_ai_analysis`, chat context, avatar, and TTS bridge behavior.
- [x] 2.3 Ensure unavailable or empty context returns the existing structured failure payload.

## 3. AI Panel UI

- [x] 3.1 Add a compact AI Brief trigger inside the AI tab surface without editing generated AIRI bundle assets.
- [x] 3.2 Render loading, success, and failure states in the AI panel.
- [x] 3.3 Ensure the brief result does not modify the compose field or send any Telegram message.

## 4. Verification

- [x] 4.1 Build Debug target with `cmake --build out --config Debug --target Telegram`.
- [ ] 4.2 Manually verify AI button opens the AI tab, AI Brief summarizes an active chat, and empty/no-chat states are handled.
- [ ] 4.3 Verify existing AI tab avatar load, chat context request, generic analysis request, and TTS request still work.
