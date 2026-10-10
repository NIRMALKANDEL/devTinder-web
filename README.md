# DevTinder — Web

Frontend for **DevTinder**, a Tinder-style app for developers to discover and connect with each other.

Backend repo: [NIRMALKANDEL/devTinder](https://github.com/NIRMALKANDEL/devTinder)

## Features

- **Sign up / Login / Logout** with cookie-based auth
- **Retype password** field on sign up (must match)
- **Email verification** — after sign up, users get a welcome email and must click the verify link before they can log in; the link logs them in and opens their profile
- **Forgot password** — link on the Login card emails a reset link; the **Reset Password** page (`/reset-password/:token`) sets a new password
- Emails are sent by the backend through AWS SES — see the [backend README](https://github.com/NIRMALKANDEL/devTinder#email-setup--how-the-pieces-fit-together) for the SES, IAM, Cloudflare and GoDaddy DNS setup
- **Feed** — browse developer profiles one card at a time: drag the card right (*Interested*) or left (*Ignore*), use the buttons, or the ← / → keys
- **Requests** — accept or reject incoming connection requests (pending count shown in the navbar)
- **Connections** — everyone you've connected with, searchable by name or skill; click a card to open that person's **full profile** (`/connections/:userId`)
- **Edit Profile** — update your details with a live card preview, inline validation and a live **Profile strength** meter
- **Links** — optional Portfolio and **GitHub** links (GitHub must be a github.com link), shown on cards and profiles
- **Light / dark mode** switch in the navbar (remembers your choice; follows the system theme until you pick one)
- **404 page** for unknown URLs; every route works on direct load and refresh

### UI/UX

- Spatial UI: layered surfaces with tinted shadows; light mode has a colorful mesh backdrop and gradient accents, dark mode stays clean and flat
- Liquid-glass navbar, menus, toasts and auth cards; bento-grid layouts on Profile and connection profile pages
- [Motion](https://motion.dev/) animations: swipe physics, page transitions, list and tile entrances (respects *reduced motion*)
- Toast messages for success and errors; real error states with *Try again* instead of silent failures
- Loading skeletons, empty states, back buttons on inner pages
- Responsive from 360px phones to desktop; keyboard focus rings and a skip-to-content link

## Tech Stack

- [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/) for state
- [React Router 7](https://reactrouter.com/) for routing
- [Tailwind CSS 3](https://tailwindcss.com/) + [daisyUI 5](https://daisyui.com/) for styling
- [Motion](https://motion.dev/) for animations and the swipeable card
- [Geist](https://vercel.com/font) font (Google Fonts)
- [Axios](https://axios-http.com/) for API calls

## Project Structure

```
src/
├── App.jsx              # Routes
├── main.jsx             # Entry point
├── index.css            # Tailwind + global styles
├── Components/
│   ├── Body.jsx              # Layout shell, login check, page transitions
│   ├── NavBar.jsx            # Glass navbar, theme switch, user menu
│   ├── ThemeToggle.jsx       # Light / dark switch
│   ├── Footer.jsx
│   ├── Login.jsx             # Login + Sign up + Forgot password
│   ├── ResetPassword.jsx     # Reset password page (link from email)
│   ├── Feed.jsx              # Swipeable card deck
│   ├── UserCard.jsx          # Profile card (feed + edit-profile preview)
│   ├── Requests.jsx
│   ├── Connections.jsx       # Searchable connection cards
│   ├── ConnectionProfile.jsx # One connection's full profile
│   ├── Profile.jsx
│   ├── EditProfile.jsx       # Bento form + live preview
│   ├── ProfileStrength.jsx
│   ├── SkillChips.jsx
│   ├── ProfileLinks.jsx      # Portfolio + GitHub links
│   ├── Toast.jsx             # Success / error messages
│   ├── NotFound.jsx          # 404 page
│   ├── PageHeader.jsx        # Page title + back button
│   ├── EmptyState.jsx        # Empty / error state card
│   ├── Avatar.jsx
│   └── Icons.jsx             # Inline SVG icons
└── utils/
    ├── constants.js     # BASE_URL and small shared helpers
    ├── api.js           # Shared API calls + readable error messages
    ├── appStore.js      # Redux store
    └── *Slice.js        # user, feed, connections, requests, toasts
```

## Getting Started (local)

### Prerequisites

- Node.js 18+
- The [backend](https://github.com/NIRMALKANDEL/devTinder) running locally (default port `7777`)

### Install

```bash
git clone https://github.com/NIRMALKANDEL/devTinder-web.git
cd devTinder-web
npm install
```

### Connect to the backend

The app calls the API at `BASE_URL = "/api"` (`src/utils/constants.js`). In production, nginx forwards `/api/*` to the backend. Locally, add a Vite dev proxy that does the same, for example in `vite.config.js`:

```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:7777",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
},
```

### Run

```bash
npm run dev
```

Open http://localhost:5173.

> Links inside emails (verify / reset) use the backend's `FRONTEND_URL` — keep it `http://localhost:5173` locally.

### Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the dev server           |
| `npm run build`   | Production build into `dist/`  |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

## Themes

Six color skins (Aurora — the default, Ocean, Sunset, Forest, Mono, Classic), each in light and dark, picked from the palette icon in the navbar or in **Settings**. Skins are CSS variables in `src/skins.css`; the list lives in `src/utils/theme.js` (and the pre-render script in `index.html`, which applies the saved choice before the first paint). The login/signup page always uses **Classic**.

The Feed hero has a small **React Three Fiber** scene (`src/Components/three/`). It is lazy-loaded (three.js is never downloaded on the login page), renders a still frame when the OS asks for reduced motion, pauses when scrolled off screen, and falls back to a gradient without WebGL.

## Deployment (AWS EC2 + nginx, behind Cloudflare)

`www.projectdev.in` (domain registered at GoDaddy, DNS + proxy on Cloudflare) points to the EC2 instance.

The frontend is served as static files by nginx, which also proxies `/api/` to the backend (run with pm2).

Example nginx config:

```nginx
server {
    root /var/www/html;

    # Chat (Socket.IO) needs the WebSocket upgrade headers
    location /api/socket.io/ {
        proxy_pass http://localhost:7777/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }

    location /api/ {
        proxy_pass http://localhost:7777/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Deploying an update

Deploy the [backend](https://github.com/NIRMALKANDEL/devTinder#deploying-an-update--step-by-step) first, then:

```bash
# 1. Connect to the server
ssh -i <your-key>.pem ubuntu@<your-ec2-host>

# 2. Get the latest code
cd ~/devTinder-web
git pull origin main

# 3. Install dependencies and build
npm install
npm run build

# 4. Publish the build and reload nginx
sudo cp -r dist/* /var/www/html/
sudo nginx -t && sudo systemctl reload nginx
```

5. Hard-refresh the browser (`Ctrl+Shift+R`). If the old version still shows, purge the cache in Cloudflare → *Caching* → *Purge Everything*.
6. Check: the navbar has the light/dark switch, a connection card opens `/connections/<id>`, refreshing any page (e.g. `/requests`, `/reset-password/test`) still loads it (nginx's `try_files ... /index.html`), and an unknown URL shows the 404 page.

> `npm install` is required on every deploy that changes `package.json` (for example, the `motion` package, or three.js / React Three Fiber / socket.io-client in the chat + 3D release).
>
> Shortcut: the backend repo has `scripts/deploy-server.sh`, which deploys both repos in one go (with a backup of the old site).
