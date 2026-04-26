## 1. OpenSpec

- [x] 1.1 Create `embed-airi-stage-web` change.
- [x] 1.2 Add proposal, design, tasks, and third-column AI companion spec delta.
- [x] 1.3 Validate change with `openspec validate embed-airi-stage-web --strict`.

## 2. AIRI Build And Packaging

- [x] 2.1 Build `/Users/ben/AI_Project/airi/apps/stage-web` with relative base and hash routing.
- [x] 2.2 Copy AIRI `dist/` into `Telegram/Resources/airi_stage/`.
- [x] 2.3 Add AIRI dist files to Telegram qrc packaging under `/airi-stage`.
- [x] 2.4 Verify `index.html` references relative assets and no Vite dev-server URL.

## 3. Telegram WebView Integration

- [x] 3.1 Update AI section navigation from `avatar-stage/index.html` to `airi-stage/index.html`.
- [x] 3.2 Update resource path validation and qrc reading for `airi-stage/*`.
- [x] 3.3 Extend MIME handling for AIRI generated assets.
- [x] 3.4 Preserve `TelegramAiBridge` and native provider bridge injection.

## 4. Verification

- [x] 4.1 Build Telegram Debug with the existing Xcode project.
- [x] 4.2 Verify no tracked `Telegram/lib_webview` submodule changes are reverted.
- [ ] 4.3 Manually verify AI tab loads AIRI, Info/AI switching stays stable, and no external AIRI server is required.
