## ADDED Requirements

### Requirement: AI tab provides active chat brief
The AI page SHALL provide an AI Brief action that summarizes the current active chat's bounded recent text context through the native bridge.

#### Scenario: Run AI brief from AI tab
- **WHEN** 使用者從 compose AI entry point 開啟第三欄 AI tab 並啟動 AI Brief
- **THEN** WebView 送出 brief intent 給 native code，且 native code 使用 active chat 的 bounded recent text messages 產生 brief result

#### Scenario: Display AI brief result
- **WHEN** native code 回傳 successful brief result
- **THEN** AI page 在右側 AI panel 顯示 brief text，且不修改 compose input、不自動送出訊息

#### Scenario: AI brief unavailable without active chat
- **WHEN** 使用者在沒有 active chat 或沒有可分析文字訊息的狀態下啟動 AI Brief
- **THEN** AI page 顯示 failure status，且 third column 維持開啟

#### Scenario: AI brief keeps provider secrets native-only
- **WHEN** AI Brief 需要 LLM/provider analysis
- **THEN** WebView 只送出 brief intent，provider endpoint、token、credential 仍由 native code 持有且不暴露給 JavaScript
