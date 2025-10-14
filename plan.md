## Skillrack Profile Scraping: Client-Side via CORS Proxy

### Problem
Skillrack blocks requests from cloud servers (like Vercel) using Cloudflare, resulting in 403 errors. Direct server-side scraping is unreliable for deployment.

### Solution: Client-Side Scraping with CORS Proxy
1. **Move scraping logic to the frontend**
	- Use JavaScript in the browser to fetch and parse Skillrack profile pages.

2. **Use a free CORS proxy**
	- Example proxies: `https://api.allorigins.win`, `https://corsproxy.io`.
	- Fetch Skillrack profile HTML via proxy:
	  `https://api.allorigins.win/raw?url=https://www.skillrack.com/profile/[id]/[hash]`

3. **Parse HTML in the browser**
	- Use `cheerio` (with browser build) or `DOMParser` to extract profile data.

4. **Advantages**
	- Bypasses Vercel's IP and Cloudflare blocks.
	- Scraping happens in the user's browser, appearing as a real user.

5. **Implementation Steps**
	- Remove scraping logic from Vercel API.
	- Update frontend to fetch via CORS proxy and parse HTML.
	- Handle errors and rate limits from proxy services.

### Example Fetch (React/JS)
```js
fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(skillrackUrl))
  .then(res => res.text())
  .then(html => {/* parse HTML here */})
```

### Notes
- Free proxies may have rate limits or downtime.
- For production, consider a paid proxy or self-hosted solution if reliability is critical.
