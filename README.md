# DevTinder — Web

Frontend for **DevTinder**, a Tinder-style app for developers to discover and connect with each other.

Backend repo: [NIRMALKANDEL/devTinder](https://github.com/NIRMALKANDEL/devTinder)

## Features

- **Sign up / Login / Logout** with cookie-based auth
- **Feed** — browse developer profiles one card at a time and mark them *Ignore* or *Interested*
- **Requests** — accept or reject incoming connection requests
- **Connections** — see everyone you've connected with
- **Edit Profile** — update your details with a live card preview

### UI/UX

- Consistent card-based design across all pages (based on the Login card style)
- Sticky navbar with active-page highlight and avatar fallback (initials)
- Page transitions and card entry animations (respects *reduced motion*)
- Loading skeletons, spinners on action buttons, and friendly empty states
- Back buttons on inner pages
- Responsive down to phone width; works with light and dark system themes

## Tech Stack

- [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/) for state
- [React Router 7](https://reactrouter.com/) for routing
- [Tailwind CSS 3](https://tailwindcss.com/) + [daisyUI 5](https://daisyui.com/) for styling
- [Axios](https://axios-http.com/) for API calls

## Project Structure

```
src/
├── App.jsx              # Routes
├── main.jsx             # Entry point
├── index.css            # Tailwind + global styles
├── Components/
│   ├── Body.jsx         # Layout shell (navbar, page outlet, footer)
│   ├── NavBar.jsx
│   ├── Footer.jsx
│   ├── Login.jsx        # Login + Sign up
│   ├── Feed.jsx
│   ├── UserCard.jsx     # Profile card (feed + edit-profile preview)
│   ├── Requests.jsx
│   ├── Connections.jsx
│   ├── Profile.jsx
│   ├── EditProfile.jsx
│   ├── PageHeader.jsx   # Page title + back button
│   ├── EmptyState.jsx
│   ├── Avatar.jsx
│   └── Icons.jsx        # Inline SVG icons
└── utils/
    ├── constants.js     # BASE_URL
    ├── appStore.js      # Redux store
    └── *Slice.js        # user, feed, connections, requests
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

### Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the dev server           |
| `npm run build`   | Production build into `dist/`  |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

## Deployment (AWS EC2 + nginx)

The frontend is served as static files by nginx, which also proxies `/api/` to the backend (run with pm2).

Example nginx config:

```nginx
server {
    root /var/www/html;

    location /api/ {
        proxy_pass http://localhost:7777/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Deploying an update

```bash
ssh -i <your-key>.pem ubuntu@<your-ec2-host>

cd ~/devTinder-web
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

Hard-refresh the browser (`Ctrl+Shift+R`) to load the new build.
