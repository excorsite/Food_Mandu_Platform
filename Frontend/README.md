# DigitalMandu Frontend

React 19 and Vite client for the DigitalMandu food ordering platform.

## Run locally

```powershell
npm install --legacy-peer-deps
npm run dev
```

Create `.env.local` in this directory when the API is not running at the local default:

```text
VITE_API_BASE_URL=http://localhost:3000/api
VITE_KHALTI_PUBLIC_KEY=your_khalti_public_key
```

The backend must be running and reachable at the host in `VITE_API_BASE_URL`. Socket.IO uses the same host without the `/api` suffix for live order-status updates. Start the frontend with `npm run dev`; create a production bundle with `npm run build`.

## Available scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production bundle locally.
