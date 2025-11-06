import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import labelRoutes from './routes/labels.js';
import achievementRoutes from './routes/achievements.js';
import profileRoutes from './routes/profile.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - handle preflight requests
// Allow multiple origins for Vercel preview deployments
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://rpg-todo-fin-frontend-icbu3sido-jacks-projects-b498c98c.vercel.app',
  'https://rpg-todo-fin-frontend-742hjom2p-jacks-projects-b498c98c.vercel.app',
  /^https:\/\/rpg-todo-fin-frontend-.*\.vercel\.app$/, // Allow all preview deployments
  /^https:\/\/.*\.vercel\.app$/, // Allow any vercel.app domain (for preview deployments)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicitly handle OPTIONS requests (preflight) as fallback
app.options('*', cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/profile', profileRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RPG Todo API is running' });
});

// Export for Vercel serverless - must export a handler function
export default (req, res) => {
  return app(req, res);
};

// Start server (for local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

