## ADDED Requirements

### Requirement: AI Chat service sources include OpenAI subscription
The AI page SHALL offer an `OpenAI (Subscription)` Chat service source that uses ChatGPT/Codex subscription login rather than an OpenAI API key.

#### Scenario: Display OpenAI subscription provider
- **WHEN** 使用者在 AI tab 開啟服務來源的 Chat provider settings
- **THEN** Chat provider list includes `OpenAI (Subscription)`
- **AND** the provider does not ask for an OpenAI API key

#### Scenario: Validate missing subscription login
- **WHEN** `OpenAI (Subscription)` is selected and no valid subscription token is stored
- **THEN** the provider validation reports that OpenAI subscription login is required
- **AND** Chat generation is not attempted with empty credentials

#### Scenario: Complete subscription login
- **WHEN** 使用者從 `OpenAI (Subscription)` provider 啟動登入
- **THEN** native code opens the OpenAI OAuth flow in the system browser with PKCE
- **AND** native code receives the loopback callback, exchanges the code for tokens, stores the token state locally, and reports successful validation to the AI page

#### Scenario: Use subscription provider for Chat
- **WHEN** `OpenAI (Subscription)` has valid tokens and a supported model is selected
- **THEN** Chat requests are sent through the native OpenAI subscription proxy
- **AND** streaming response chunks are delivered back to the AI page in the Chat provider's expected stream format

#### Scenario: Refresh expired subscription token
- **WHEN** a Chat request starts with an expired or near-expired OpenAI subscription access token
- **THEN** native code refreshes the token using the stored refresh token before proxying the request
- **AND** the refreshed token state is persisted for later requests

#### Scenario: Logout clears subscription state
- **WHEN** 使用者從 `OpenAI (Subscription)` provider 登出
- **THEN** native code clears stored OpenAI subscription tokens
- **AND** provider validation returns to the login-required state

### Requirement: OpenAI subscription credentials remain native-owned
The native bridge SHALL own OpenAI subscription tokens, request rewriting, token refresh, and ChatGPT/Codex backend access.

#### Scenario: WebView requests subscription proxy
- **WHEN** AIRI stage sends an OpenAI subscription proxy request
- **THEN** WebView sends only the provider request intent through the native bridge
- **AND** native code performs token refresh, target URL rewrite, backend fetch, and response normalization

#### Scenario: Do not expose refresh token to arbitrary JavaScript
- **WHEN** OpenAI subscription tokens are stored or refreshed
- **THEN** refresh token persistence remains in native/local settings
- **AND** arbitrary bundled WebView scripts cannot directly read the refresh token from exposed bridge globals

#### Scenario: Preserve existing AI native bridge behavior
- **WHEN** OpenAI subscription provider support is added
- **THEN** existing AI tab chat context, AI Brief, avatar profile loading, and TTS native bridge requests continue to work
