# AI Documentation

## Overview
This project **does not** currently utilize any Artificial Intelligence (AI) or Machine Learning (ML) models in its runtime application. All data processing is deterministic (CSV parsing) and visualizations are rendered using standard algorithms (D3.js).

## Configuration
There are no AI-related environment variables or configuration files.

## Future Integration
If AI features are added in the future (e.g., for predictive emissions modeling or natural language data querying), this document should be updated to include:

### Models & Providers
- **Model Name**: (e.g., GPT-4o-mini)
- **Provider**: (e.g., OpenAI, Anthropic)
- **Purpose**: (e.g., Summarizing country emissions reports)

### Configuration
Required environment variables would be documented in `docs/ENV.md`.
```bash
# Example
# OPENAI_API_KEY=sk-...
```

### JSON Schemas
Any AI adapter should validate outputs against strict schemas. Example:
```json
{
  "type": "object",
  "properties": {
    "summary": { "type": "string" },
    "sentiment": { "type": "string", "enum": ["positive", "neutral", "negative"] }
  }
}
```

## Cost Control & Best Practices
Although no AI models are currently used, any future integration should adhere to the following principles:
- **Caching**: Cache AI responses aggressively (e.g., in LocalStorage or a backend proxy) to minimize API calls.
- **Rate Limiting**: Implement client-side throttling (debouncing) on user inputs that trigger AI requests.
- **Budget Alerts**: Configure provider-side budget alerts (e.g., OpenAI Usage Limits) to prevent unexpected costs.
