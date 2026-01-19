# AI Integration & Standards

This document outlines the standards, configuration, and expected behaviors for Artificial Intelligence (AI) integrations within the project. While the core visualization is deterministic (D3/React), AI is used for data processing, analysis assistance, or future features.

## 🤖 AI Models & Configuration

### Current Usage
*   **None currently active in runtime.**
*   The project relies on deterministic algorithms for data processing and visualization.

### Future Configuration
If AI features are added (e.g., natural language queries for data), they must be configured via environment variables:

```bash
# Example Configuration (Future)
AI_PROVIDER=openai
AI_MODEL_NAME=gpt-4o
AI_API_KEY=sk-... # Set in CI/CD secrets, never in code
```

## 📋 JSON Schemas

When integrating AI for data transformation or API responses, strict JSON schemas must be enforced to ensure type safety in the frontend.

### Standard Error Response
```json
{
  "type": "object",
  "properties": {
    "error": { "type": "string" },
    "code": { "type": "string" },
    "retryable": { "type": "boolean" }
  },
  "required": ["error", "code"]
}
```

### Data Query Response (Example)
```json
{
  "type": "object",
  "properties": {
    "countryCode": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "year": { "type": "integer", "minimum": 1750 },
    "value": { "type": "number" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  }
}
```

## 💰 Cost Control & Rate Limiting

To prevent runaway costs and ensure stability:

1.  **Caching**: All AI responses must be cached.
    *   **Browser**: `localStorage` or `sessionStorage` for user-specific queries.
    *   **Edge/Server**: CDN caching for generalized queries.
2.  **Rate Limiting**:
    *   Implement client-side debouncing (min 300ms) for any input driving AI calls.
    *   Limit requests to 5 per minute per user session if direct API access is enabled.
3.  **Budget Caps**:
    *   Set hard monthly budget caps on AI provider accounts (e.g., OpenAI, Anthropic).
    *   Monitor usage via provider dashboards.

## 🛡️ AI Security

*   **Prompt Injection**: Validate all user inputs against strict allowlists before passing to LLMs.
*   **Output Validation**: Never trust AI output. Run it through validation functions (like `utils/security.js`) before rendering to the DOM.
