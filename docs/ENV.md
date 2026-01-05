# Environment Variables

This project uses environment variables for configuration during the build process and runtime.

## 📄 Variable List

| Variable | Description | Required | Default |
|---|---|---|---|
| `VITE_BASE_URL` | The base URL for the application (useful for deployment to subdirectories). | No | `/` |
| `VITE_ANALYTICS_ID` | Cloudflare Web Analytics Token. | No | - |
| `VITE_DEBUG` | Enable debug logging in the console (`true` or `false`). | No | `false` |

## 🛠️ Usage

Variables are accessed in the code via `import.meta.env`.

Example:
```javascript
const debugMode = import.meta.env.VITE_DEBUG === 'true';
```

## 📝 Setup

1.  Copy `.env.example` to `.env`.
2.  Fill in the values.

```bash
cp .env.example .env
```

**Note:** Never commit `.env` files containing real secrets to version control.
