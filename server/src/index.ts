import { config } from 'dotenv';
import { resolve } from 'path';
import express from 'express';
import subtitleRoutes from './routes/subtitles.js';

const rootDir = process.cwd();

// Load environment variables from root project
config({ path: resolve(rootDir, '../.env') });
config({ path: resolve(rootDir, '../.env.development.local') });

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/subtitles', subtitleRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Reel AI Video Processing Server is running' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
