# NichePulse – AI Niche Intelligence Agent

NichePulse is an AI-powered intelligence agent designed to analyze niche market sentiment and trends by aggregating public discussions from Reddit and YouTube, then synthesizing deep actionable insights using Anthropic's Claude AI.

---

## 📁 Project Structure

```
nichepulse/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── reddit.js      # Reddit API Service Placeholder
│   │   │   ├── youtube.js     # YouTube Data API Service Placeholder
│   │   │   ├── dedupe.js      # Content Deduplication Service Placeholder
│   │   │   └── claude.js      # Anthropic Claude Service Placeholder
│   │   ├── routes/
│   │   │   └── analyze.js     # Analysis Route Handler
│   │   └── server.js          # Express Server & Health Endpoint
│   ├── .env.example           # Environment Configuration Template
│   ├── .env                   # Local Environment Variables (Ignored)
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ReportDashboard.jsx  # Dashboard & Health Monitoring Component
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .gitignore
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start (Phase 1)

### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.

### 2. Health Endpoint Check

Verify server health by making a GET request:
```bash
curl http://localhost:5000/api/health
```
Response:
```json
{
  "status": "ok"
}
```

### 3. Start the Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```
The frontend application will be live at `http://localhost:5173`.

---

## 🔒 Security

- API keys are managed exclusively via environment variables (`.env`).
- Never commit `.env` files or hardcode secrets into source files.
- Frontend uses Vite API proxy (`/api` -> `http://localhost:5000`) ensuring API keys remain securely on the backend server.
