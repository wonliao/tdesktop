## Why

目前第三欄 AI tab 已有 native WebView shell、Info/AI tabs、chat context bridge、native provider bridge 與 bundled avatar stage，但可見 UI 仍是自製 preview runtime。使用者希望 AI tab 完整嵌入 AIRI，並以 `/Users/ben/AI_Project/airi` 的 AIRI stage-web 作為實際使用介面。

這個 change 要把 AI tab 的 bundled WebView UI 換成 AIRI stage-web 靜態打包版本，同時保留 Telegram native side 對第三欄、chat context、provider secrets 與 WebView 安全邊界的控制。

## What Changes

- 新增 AIRI stage-web static build 作為 Telegram bundled resource。
- AI tab WebView 改為載入 AIRI bundled resources，而不是目前的 `avatar_stage` preview page。
- WebView data request handler 改為服務 `airi-stage/*` resource prefix，並拒絕 prefix 外或不安全 path。
- 擴充 MIME type handling，支援 AIRI build 產物常見的 CSS、font、wasm、worker、map、AVIF/WebP 等 assets。
- 保留現有 `TelegramAiBridge` 與 native provider bridge，供後續 AIRI-side integration 使用。

## Capabilities

### Modified Capabilities

- `third-column-ai-companion`: AI tab bundled WebView resource 從自製 avatar stage 轉為 AIRI stage-web static application。

### New Capabilities

None.

## Impact

- Affected UI: third-column AI tab content。
- Affected native code: AI section WebView navigation、resource path validation、data request routing、MIME detection。
- Affected resources: AIRI stage-web dist files、Qt qrc packaging。
- Security impact: WebView 仍只讀 bundled local resources；provider credentials 與 Telegram session data 仍留在 native side，不暴露給 JavaScript。
