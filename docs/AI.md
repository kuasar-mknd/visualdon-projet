# AI & Machine Learning Policy

## 🤖 AI Usage

**This project explicitly DOES NOT use Artificial Intelligence (AI) or Machine Learning (ML) models for its core functionality.**

All visualizations, data processing, and interactions are deterministic, based on standard algorithms and hardcoded logic (D3.js, React, standard math).

## 🛠️ Configuration

There are no AI-related environment variables or configurations.

## 💰 Cost Control

Since no AI services are used, there are no costs associated with token usage or model inference.

### Future Considerations (If AI is added)
If AI integration is planned in the future (e.g., for predictive emissions modeling or natural language data querying), the following strict guidelines must be followed:

1.  **Browser Caching**: Store results in `localStorage` or IndexedDB to prevent redundant API calls.
2.  **Rate Limiting**: Implement strict client-side rate limiting.
3.  **Cost Monitoring**: Set strict budget alerts on the provider side (e.g., OpenAI, Anthropic).
4.  **Transparency**: Explicitly label AI-generated content in the UI.

## 🔍 Verification

The codebase is free of:
- Calls to OpenAI/Anthropic/Google APIs.
- Local inference libraries (TensorFlow.js, ONNX).
- vector databases.
