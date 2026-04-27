## Why

目前 AI tab 已能開啟 AIRI WebView、取得 active chat context，並透過 native provider bridge 回傳 analysis result，但使用者仍需要手動描述任務才能得到對話摘要。

這個 change 要把「對話訊息傳給 AI 做 AI brief」變成 AI tab 內的一個明確工作流，讓使用者從現有 AI 面板入口即可對目前聊天室近期訊息產生簡短摘要。

## What Changes

- 在 AI tab 中新增 AI Brief 操作入口。
- AI Brief 使用既有 native chat context bridge 讀取 active chat 的 bounded recent text messages。
- Native provider 新增 dedicated brief task，回傳可直接顯示在 AI panel 的 structured analysis payload。
- AI Brief 結果顯示在右側 AI panel，不寫入 compose input，也不自動送出訊息。
- 保留 provider secrets native-only；WebView 只送出 intent，不直接呼叫 LLM endpoint。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `third-column-ai-companion`: AI tab 新增可由使用者觸發的 active-chat AI brief 工作流，並在 panel 內顯示結果。

## Impact

- Affected UI: third-column AI tab WebView surface。
- Affected native code: `Ai::Section` bridge event handling、`Ai::ProviderFacade::analyze` task handling。
- Affected specs: `third-column-ai-companion`。
- Security impact: no new WebView credential exposure; summary input remains bounded to already-loaded active-chat text context。
