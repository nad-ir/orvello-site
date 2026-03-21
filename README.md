# Orvello

Static site built with **Vite + React + React Router**, deployed on **Cloudflare Pages**.

## Pages

| Route | Page |
|-------|------|
| `/` | Main landing page |
| `/terms` | Terms of Service |

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to Cloudflare Pages

### Option A: Connect GitHub repo (recommended)

1. Push this repo to GitHub
2. Go to **Cloudflare Dashboard → Pages → Create a project**
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `18` (set in Environment variables if needed)
5. Deploy

Cloudflare will auto-deploy on every push to `main`.

### Option B: Direct upload

```bash
npm run build
npx wrangler pages deploy dist --project-name=orvello-site
```

### Custom Domain

In your Cloudflare Pages project settings → Custom domains → Add `orvello.co.uk`.

Since your DNS is already on Cloudflare, the CNAME will be added automatically.

### SPA Routing

The `public/_redirects` file ensures all routes (like `/terms`) serve `index.html` so React Router handles them client-side. This is already included.

## Project Structure

```
├── index.html              # Entry HTML
├── public/
│   ├── favicon.svg         # Favicon
│   └── _redirects          # Cloudflare Pages SPA routing
├── src/
│   ├── main.jsx            # React Router setup
│   ├── ScrollToTop.jsx     # Scroll reset on route change
│   └── pages/
│       ├── HomePage.jsx    # Main landing page
│       └── TermsPage.jsx   # Terms of Service
├── package.json
└── vite.config.js
```
