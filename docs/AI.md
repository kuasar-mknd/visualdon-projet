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
- **Caching**: Cache AI responses aggressively (e.g., in LocalStorage or a backend proxy) to minimize API calls.
- **Rate Limiting**: Implement client-side throttling (debouncing) on user inputs that trigger AI requests.
- **Token Usage Monitoring**: Regularly audit token usage via provider dashboards to ensure alignment with budget caps.
- **Budget Alerts**: Configure provider-side budget alerts (e.g., OpenAI Usage Limits) to prevent unexpected costs.
