# DevTinder — Web

Frontend for **DevTinder**, a Tinder-style app for developers to discover and connect with each other.

Backend repo: [NIRMALKANDEL/devTinder](https://github.com/NIRMALKANDEL/devTinder)

## Features

- **Sign up / Login / Logout** with cookie-based auth
- **Retype password** field on sign up (must match)
- **Email verification** — after sign up, users get a welcome email and must click the verify link before they can log in; the link logs them in and opens their profile
- **Forgot password** — link on the Login card emails a reset link; the **Reset Password** page (`/reset-password/:token`) sets a new password
- Emails are sent by the backend through AWS SES — see the [backend README](https://github.com/NIRMALKANDEL/devTinder#email-setup--how-the-pieces-fit-together) for the SES, IAM, Cloudflare and GoDaddy DNS setup
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
│   ├── Login.jsx        # Login + Sign up + Forgot password
│   ├── ResetPassword.jsx # Reset password page (link from email)
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

> Links inside emails (verify / reset) use the backend's `FRONTEND_URL` — keep it `http://localhost:5173` locally.

### Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the dev server           |
| `npm run build`   | Production build into `dist/`  |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

## Deployment (AWS EC2 + nginx, behind Cloudflare)

`www.projectdev.in` (domain registered at GoDaddy, DNS + proxy on Cloudflare) points to the EC2 instance.

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
6. Check: the Sign Up card shows **Retype Password**, the Login card shows **Forgot password?**, and `https://www.projectdev.in/reset-password/test` opens the Reset Password page (nginx's `try_files ... /index.html` serves this route).
