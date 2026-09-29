import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';
import agentRouter from './routes/agent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint (Phase 1 Task 6)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Analyze Routes (Phase 2 & 3)
app.use('/api/analyze', analyzeRouter);

// Agent Autonomous Orchestration Routes (Phase 4)
app.use('/api/agent', agentRouter);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'NichePulse Backend API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`⚡ NichePulse Backend Server listening on http://localhost:${PORT}`);
});
