# Deployment Instructions for Netlify

## Environment Variables Setup

This application requires a Claude API key to function. The key is kept
server-side only for security.

### Setting up Environment Variables in Netlify:

1. Go to your Netlify dashboard
2. Navigate to Site Settings → Environment Variables
3. Add the following variable:
   - Key: `CLAUDE_API_KEY`
   - Value: Your Claude API key (starts with `sk-ant-api03-`)

### Important Security Notes:

- **NEVER** use `NEXT_PUBLIC_` prefix for API keys in production
- The API key is only accessible server-side through the `/api/claude` route
- The client-side code uses fetch to communicate with the API route
- Make sure to revoke and regenerate your API key if it was previously exposed

### Local Development:

For local development, create a `.env.local` file in the root directory:

```env
CLAUDE_API_KEY=your_api_key_here
# For corporate networks with proxy/firewall issues:
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Build Configuration:

The application is configured to:

- Use server-side API routes to protect the Claude API key
- Static export is configured in `next.config.mjs`
- All Claude API calls go through `/api/claude` endpoint

### Troubleshooting:

If you encounter build errors related to secrets:

1. Ensure you're not using `NEXT_PUBLIC_CLAUDE_API_KEY` anywhere
2. Check that the API key is only in server-side code
3. Verify the environment variable is named `CLAUDE_API_KEY` (without
   `NEXT_PUBLIC_` prefix)

If you encounter SSL certificate errors:

1. Add `NODE_TLS_REJECT_UNAUTHORIZED=0` to your `.env.local` file
2. This is common in corporate networks with proxies/firewalls
3. For production deployment, configure proper SSL certificates instead
