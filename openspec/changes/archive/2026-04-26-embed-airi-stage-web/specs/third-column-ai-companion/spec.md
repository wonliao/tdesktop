## MODIFIED Requirements

### Requirement: AI page uses bundled local WebView resources
The AI page SHALL 從 application bundled resources 載入 AIRI stage-web UI and required runtime assets.

#### Scenario: Load AIRI stage offline
- **WHEN** AI tab 被開啟，且沒有外部 AIRI dev server 或 local web server 正在執行
- **THEN** WebView 載入 bundled AIRI stage-web interface

#### Scenario: Preserve AIRI hash-route navigation
- **WHEN** AIRI stage-web 在 WebView 內進行 hash-route navigation
- **THEN** navigation stays inside the bundled AIRI WebView application and does not open an external browser

#### Scenario: Block unsafe resource paths
- **WHEN** WebView 請求 bundled AIRI resource prefix 之外的 path 或包含 unsafe traversal 的 path
- **THEN** native data request handler 拒絕該請求

#### Scenario: Missing AIRI asset
- **WHEN** bundled AIRI root document or required asset cannot be loaded
- **THEN** AI tab shows the native fallback surface and Telegram remains usable
