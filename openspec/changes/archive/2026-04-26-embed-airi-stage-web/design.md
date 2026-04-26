## Overview

AI companion 仍是 Telegram third-column native section。`Info` / `AI` tabs 與 active-chat lifecycle 不變；`AI` tab 內的 WebView 改為載入 AIRI `stage-web` 的 static build。

## AIRI Static Build

AIRI 來源固定為 `/Users/ben/AI_Project/airi/apps/stage-web`。Build 使用 relative asset base 與 hash routing，讓產物可從 Qt resource data URL 載入，不依賴 Vite dev server 或外部 web host。

Build command:

```bash
VITE_APP_TARGET_HUGGINGFACE_SPACE=1 pnpm -r -F @proj-airi/stage-web build -- --base ./
```

## Resource Packaging

Build output copied into `Telegram/Resources/airi_stage/` and included in a Telegram qrc prefix `/airi-stage`.

The existing `avatar_stage` resources may remain in the tree, but the AI tab no longer navigates to them. This keeps the implementation narrow and avoids deleting fallback/reference assets in the same change.

## WebView Routing

Native WebView navigation starts at `airi-stage/index.html`. The data request handler accepts only IDs beginning with `airi-stage/`, strips fragments and query strings before lookup, validates the remaining path, and reads from `:/airi-stage/<path>`.

The navigation allowlist accepts the local resource host used by `navigateToData()` and permits AIRI hash-route navigations inside the same bundled app. Requests outside the bundled resource namespace are rejected or left blocked.

## Bridge Compatibility

`TelegramAiBridge` and `TelegramWebviewProxy` remain injected before AIRI loads. AIRI does not need to consume them for v1, but preserving them keeps the existing native chat-context and provider boundary available for a follow-up change.

Secrets are not sent to the WebView. If AIRI later needs Telegram context, it should request it through the existing native bridge instead of reading Telegram state directly.

## Failure Handling

If WebView creation fails, resource loading fails, or AIRI root navigation reports failure, the AI tab shows the existing native fallback surface and Telegram remains usable.
