# API Client Usage Guide

## Overview

The application now supports automatic fallback between **localhost** (development) and **production** (Render) servers using the `apiClient` utility in `src/lib/apiClient.ts`.

## Features

✅ **Automatic Server Detection** - Tries production first, falls back to localhost  
✅ **OR Operator Logic** - Uses `||` operator for fallback support (Prod || Local)  
✅ **Timeout Handling** - Prevents hanging on unavailable servers  
✅ **Error Logging** - Detailed console logs for debugging  
✅ **Type-Safe** - Full TypeScript support  

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
VITE_API_BASE_URL_LOCAL='http://localhost:5000'
VITE_API_BASE_URL_PROD='https://bharat-tech-admin.onrender.com'
```

## Usage

### 1. Initialize API Client in App

Add the initialization hook to your main App component:

```tsx
import { useApiClientInit } from './lib/useApiClientInit';

function App() {
  useApiClientInit(); // Initialize on mount
  
  return (
    // Your app content
  );
}
```

### 2. Making API Requests

#### Using Pre-built Methods (Recommended)

```tsx
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient';

// GET request
const response = await apiGet('/api/emails/status');
const data = await response.json();

// POST request
const response = await apiPost('/api/emails/send-selection', {
  team: teamData
});

// PUT request
const response = await apiPut('/api/teams/1', {
  name: 'Updated Name'
});

// DELETE request
const response = await apiDelete('/api/teams/1');
```

#### Using Generic apiFetch Method

```tsx
import { apiFetch } from '../lib/apiClient';

const response = await apiFetch('/api/emails/send-bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ team, emailType: 'selection' }),
  timeout: 15000 // Custom timeout in ms
});
```

#### Getting Current API URL

```tsx
import { getApiBaseUrl, getApi } from '../lib/apiClient';

// Get current API URL (performs availability check)
const apiUrl = await getApiBaseUrl();

// Get cached API URL (no check)
const cachedUrl = getApi();
```

## How It Works

### Server Detection Flow

```
1. Try production (https://bharat-tech-admin.onrender.com) → 5 second timeout
   ├─ Success → Use production
   └─ Timeout/Error → Go to step 2

2. Try localhost (http://localhost:5000) → 3 second timeout
   ├─ Success → Use localhost
   └─ Timeout/Error → Go to step 3

3. Default to production (will show error when making requests)
```

### OR Operator Pattern

The API client uses the OR operator (`||`) in the fallback chain:

```typescript
// In getApiBaseUrl():
return PROD_API_URL || LOCAL_API_URL || DEFAULT_URL
```

This means:
- ✅ Use production if available (Primary)
- ✅ Use localhost if production is down (Fallback)
- ✅ Default to production if both fail (developer can see detailed error)

## Practical Examples

### Example 1: Send Email with Fallback

```tsx
async function sendSelectionEmail(teamData) {
  try {
    const response = await apiPost('/api/emails/send-selection', {
      team: teamData
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Email send failed:', error);
      return null;
    }
    
    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('API request failed:', error.message);
    // User-friendly error handling
  }
}
```

### Example 2: Dashboard Component

```tsx
import { useApiClientInit } from '../lib/useApiClientInit';
import { apiGet } from '../lib/apiClient';
import { useEffect, useState } from 'react';

function Dashboard() {
  useApiClientInit(); // Initialize on mount
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiGet('/api/teams');
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {teams.map(team => (
        <div key={team.id}>{team.name}</div>
      ))}
    </div>
  );
}
```

### Example 3: Form Submission with Error Handling

```tsx
async function handleSubmit(formData) {
  try {
    const isLocalServer = getApi().includes('localhost');
    console.log(`Using ${isLocalServer ? 'local' : 'production'} server`);

    const response = await apiPost('/api/teams', formData);
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message || 'Failed to save');
      return;
    }

    const result = await response.json();
    setSuccess('Team created successfully!');
    onSaved(result);
  } catch (error) {
    setError(`Network error: ${error.message}`);
  }
}
```

## Backend Integration

The backend (`Server/src/app.js`) is already configured to accept requests from both:

- `http://localhost:3000` (Vite dev port)
- `http://localhost:5173` (Vite default port)
- `http://localhost:5000` (Backend dev port)
- `https://bharat-tech-admin.onrender.com` (Production)

### CORS Headers Sent by Backend

```
Access-Control-Allow-Origin: [your frontend origin]
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Credentials: true
```

## Debugging Tips

### Check Current Server

```tsx
// In browser console
import { getApi, getApiBaseUrl } from './lib/apiClient';

// See cached URL
console.log('Cached API URL:', getApi());

// Check available server
getApiBaseUrl().then(url => console.log('Active API URL:', url));
```

### Network Logs

1. Open DevTools → Network tab
2. Make an API request
3. Check the request URL to verify which server is being used
4. Look for CORS errors if requests fail

### Server Status

```bash
# Check if local server is running
curl http://localhost:5000

# Check production server
curl https://bharat-tech-admin.onrender.com
```

## Troubleshooting

### Requests Timeout

- **Issue**: Both servers unavailable or very slow  
- **Solution**: Check if servers are running and accessible from your network

### CORS Errors

- **Issue**: `Access-Control-Allow-Origin` error  
- **Solution**: Ensure your frontend origin is in `Server/src/app.js` CORS whitelist

### Wrong Server Being Used

- **Issue**: Using production when you want localhost  
- **Solution**: The system prizes production first. To force localhost, ensure the local server is running on port 5000. If Render is up, it will take priority.

### Stale Cached URL

- **Issue**: API URL doesn't change after server restart  
- **Solution**: Refresh browser (clears cache) or restart dev server

## Performance Considerations

1. **First Request Delay**: Initial request may take 5 seconds if production server is down (timeout check)
2. **Caching**: API URL is cached after first check, subsequent requests won't retry
3. **Production Priority**: Render server is always tried before localhost

## Migration Guide

If you have existing API calls in your code, replace them:

### Before

```tsx
const response = await fetch('http://localhost:5000/api/emails/send-selection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ team })
});
```

### After

```tsx
import { apiPost } from '../lib/apiClient';

const response = await apiPost('/api/emails/send-selection', { team });
```

## Next Steps

1. ✅ Update `.env` with both server URLs
2. ✅ Add `useApiClientInit()` to your App.tsx
3. ✅ Replace existing fetch calls with API client methods
4. ✅ Test with both local and production servers
5. ✅ Monitor console logs for debugging
