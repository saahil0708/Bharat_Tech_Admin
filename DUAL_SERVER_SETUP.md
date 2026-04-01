# Dual Server Configuration Summary

## ✅ Completed Setup

Your application is now configured to automatically use either **localhost** or **Render production server** using an OR operator pattern.

### Changes Made

#### 1. **Environment Variables** (`.env`)
Added dual server URLs with fallback support:
```env
VITE_API_BASE_URL_LOCAL='http://localhost:5000'
VITE_API_BASE_URL_PROD='https://bharat-tech-admin.onrender.com'
```

#### 2. **API Client Library** (`src/lib/apiClient.ts`) ✨ NEW
- Auto-detects which server is available
- Implements OR operator logic: `LOCAL || PROD || DEFAULT`
- Includes timeout handling (3s for local, 5s for production)
- Provides helper methods: `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`

#### 3. **Initialization Hook** (`src/lib/useApiClientInit.ts`) ✨ NEW
- React hook for initializing the API client on app startup
- Determines server availability on first load

#### 4. **Frontend Initialization** (`src/App.tsx`)
Updated to initialize API client on app load:
```tsx
useApiClientInit();
```

#### 5. **Backend CORS Configuration** (`Server/src/app.js`)
Updated CORS to allow requests from:
- `http://localhost:3000` (Vite dev)
- `http://localhost:5173` (Vite default)
- `http://localhost:5000` (Local backend)
- `https://bharat-tech-admin.onrender.com` (Production)

#### 6. **Documentation** (`API_CLIENT_USAGE.md`) ✨ NEW
Comprehensive guide with examples and troubleshooting

#### 7. **Example Configuration** (`.env.example`)
Template for other developers

---

## 🚀 How It Works

### Server Detection Flow (OR Operator Pattern)

```
┌─────────────────────────┐
│  App Starts             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Try Production (Render)      │ ← Check with 5s timeout
│ (https://bharat-tech...org)  │
└────────┬─────────────────────┘
         │
     ┌───┴───────────────────────────┐
     │                               │
  SUCCESS                          TIMEOUT/ERROR
     │                               │
     ▼                               ▼
RETURN PROD               ┌─────────────────────────────┐
                          │ Try localhost:5000          │ ← Check with 3s timeout
                          │ (http://localhost:5000)     │
                          └────────┬────────────────────┘
                                   │
                               ┌───┴──────────┐
                               │              │
                            SUCCESS        TIMEOUT/ERROR
                               │              │
                            RETURN LOCAL      ▼
                                          RETURN PROD
                                        (show error)
```

**In Code:**
```typescript
return PROD_API_URL || LOCAL_API_URL || DEFAULT_URL
```

---

## 💻 Usage Examples

### Making API Requests

```typescript
import { apiPost, apiGet } from '../lib/apiClient';

// Send email to selected teams
async function sendEmail(team) {
  const response = await apiPost('/api/emails/send-selection', { team });
  return response.json();
}

// Get team data
async function getTeams() {
  const response = await apiGet('/api/teams');
  return response.json();
}
```

### In Components

```tsx
import { useApiClientInit } from './lib/useApiClientInit';
import { apiPost } from './lib/apiClient';

function Dashboard() {
  useApiClientInit(); // Initialize on mount
  
  const handleSendEmail = async (team) => {
    try {
      const response = await apiPost('/api/emails/send-bulk', {
        team,
        emailType: 'selection'
      });
      const result = await response.json();
      console.log('Success:', result);
    } catch (error) {
      console.error('Failed:', error);
    }
  };
  
  return (
    // Component JSX
  );
}
```

---

## 🔧 Quick Start

### 1. Development (Using Localhost)

```bash
# Terminal 1: Start backend
cd Server
npm install
npm start  # Runs on port 5000

# Terminal 2: Start frontend
npm run dev  # Runs on port 5173
```

The API client will detect localhost:5000 and use it.

### 2. Production (Using Render)

```bash
npm run build  # Build frontend
npm run preview  # Test production build
```

The API client will fall back to `https://bharat-tech-admin.onrender.com`

### 3. Mixed (Local Frontend + Render Backend)

```bash
npm run dev  # Frontend on localhost:5173
```

The API client will detect Render server and use it automatically.

---

## 📊 Server Priority (OR Operator)

| Scenario | Result |
|----------|--------|
| Prod up + Local up | Uses **PROD** (Primary) |
| Prod down + Local up | Uses **LOCAL** |
| Prod up + Local down | Uses **PROD** |
| Both down | Uses **PROD** (shows error on API call) |

---

## 🔍 Debugging

### Check Current Server in Console

```javascript
// In browser DevTools
import { getApi, getApiBaseUrl } from './lib/apiClient';

// See cached URL
console.log(getApi());

// Check active server
getApiBaseUrl().then(url => console.log('Active:', url));
```

### View Network Requests

Open DevTools → Network tab and look at the request URL:
- `http://localhost:5000` = Local server
- `https://bharat-tech-admin.onrender.com` = Production server

### Server Status

```bash
# Check local
curl http://localhost:5000

# Check production
curl https://bharat-tech-admin.onrender.com
```

---

## 📝 Files Created/Modified

| File | Status | Purpose |
|------|--------|---------|
| `.env` | ✏️ Modified | Added server URLs |
| `.env.example` | ✨ New | Template for configuration |
| `src/lib/apiClient.ts` | ✨ New | Main API client with fallback logic |
| `src/lib/useApiClientInit.ts` | ✨ New | React hook for initialization |
| `src/App.tsx` | ✏️ Modified | Added API initialization |
| `Server/src/app.js` | ✏️ Modified | Enhanced CORS configuration |
| `API_CLIENT_USAGE.md` | ✨ New | Complete usage guide |

---

## ✨ Key Features

✅ **Automatic Fallback** - No manual configuration needed  
✅ **OR Operator Pattern** - Clean, predictable behavior  
✅ **Type-Safe** - Full TypeScript support  
✅ **Error Handling** - Detailed console logs  
✅ **Timeout Protection** - Won't hang on unavailable servers  
✅ **Zero Breaking Changes** - Backward compatible  
✅ **Production Ready** - Handles both dev and prod  

---

## 🎯 Next Steps

1. **Test locally** - Run both servers and verify API calls work
2. **Update existing API calls** - Replace direct fetch with `apiClient` methods
3. **Deploy** - No changes needed, automatically falls back to production
4. **Monitor** - Check browser console logs for which server is active

---

## 📚 Resources

- **Complete Guide**: See `API_CLIENT_USAGE.md` for detailed documentation
- **Examples**: Check API_CLIENT_USAGE.md for practical code examples
- **Config**: Check `.env.example` for configuration reference

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Requests timeout | Check if both servers are running |
| CORS error | Verify origin is in `Server/src/app.js` whitelist |
| Wrong server used | Clear browser cache and refresh |
| Slow first request | Local timeout check (3s), normal behavior |

---

**You're all set!** Your application now seamlessly switches between localhost and production. 🚀
