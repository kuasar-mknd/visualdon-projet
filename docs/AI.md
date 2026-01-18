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

### Cost Control & Rate Limiting
To prevent runaway costs and ensure performance, any future AI integration must implement:

1.  **Caching Strategy**:
    - Responses must be cached (e.g., Cloudflare KV, Browser Cache, or LocalStorage) to minimize repetitive API calls.
    - Use content-addressable keys (hashes of the prompt/input).

2.  **Rate Limiting**:
    - **Client-side**: Debounce user inputs (minimum 300ms) before triggering requests.
    - **Server-side**: Implement token bucket or sliding window limits per IP.

3.  **Budget Caps**:
    - Set hard limits on provider dashboards (e.g., OpenAI Hard Limit $20/month).
    - Monitor usage via automated alerts.

### Environment Variables
Model configurations must be strictly separated from code:
- `AI_MODEL_NAME`
- `AI_API_BASE_URL`
- `AI_API_KEY` (Server-side only)
