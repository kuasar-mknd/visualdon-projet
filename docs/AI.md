# AI Documentation

## Overview
This project **does not** currently utilize any Artificial Intelligence (AI) or Machine Learning (ML) models in its runtime application.

## Configuration
There are no AI-related environment variables or configuration files currently in use.

## Future Integration Standards
If AI features are added in the future (e.g., for predictive emissions modeling or natural language data querying), they must adhere to the following standards.

### Expected JSON Schemas
Any AI adapter or service integration should return structured JSON to ensure type safety in the frontend.

**Example: Predictive Model Response**
```json
{
  "model": "emissions-predictor-v1",
  "prediction": {
    "year": 2030,
    "total": 38500.5,
    "confidenceInterval": [37000.0, 40000.0]
  },
  "metadata": {
    "cached": true,
    "computeTimeMs": 150
  }
}
```

### Configuration Requirements
Future integrations must document:
- Model names and versions.
- Provider details (e.g., OpenAI, Hugging Face).
- API keys (via `VITE_` env vars if client-side, or backend proxies).
- Cost control mechanisms.

## Cost Control & Best Practices
Although no AI models are currently used, any future integration should adhere to the following principles:

1.  **Caching Strategy**:
    - Cache responses aggressively (LocalStorage for user-specific, CDN/Edge for global).
    - Use `stale-while-revalidate` patterns where appropriate.

2.  **Rate Limiting**:
    - Implement client-side throttling (debouncing) on user inputs (minimum 500ms delay).
    - Enforce per-user or per-IP limits if using a proxy backend.

3.  **Token Usage Monitoring**:
    - Regularly audit token usage via provider dashboards.
    - Set hard caps on monthly budgets to prevent overrun.

4.  **Budget Alerts**:
    - Configure provider-side budget alerts (e.g., OpenAI Usage Limits) at 50%, 75%, and 90% of the budget.
