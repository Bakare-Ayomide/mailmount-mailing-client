import express from 'express';
import cors from 'cors';
import { emailRoutes } from './routes/emailRoutes.js';
import { accountRoutes } from './routes/accountRoutes.js';
import { setupDirectories } from './utils/fileSystem.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup storage directories
await setupDirectories();

// Routes
app.use('/api/emails', emailRoutes);
app.use('/api/accounts', accountRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 MailMount backend running on http://localhost:${PORT}`);
});