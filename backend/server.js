// server.js
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import connectCloudinary from './config/cloudinary.js';
import connectDB from './config/mongodb.js';
import { startDefenseStatusJob } from './jobs/defenseJob.js';
import AdminDashboardRouter from './routes/AdminDashboardRouter.js';
import adminRouter from './routes/adminRoute.js';
import applicationRoutes from './routes/applicationRoutes.js';
import CompanydashboardRoutes from './routes/CompanydashboardRoutes.js';
import companyRouter from './routes/CompanyRoute.js';
import cvRoutes from './routes/cvRoutes.js';
import dashboardGlobalAdminRoutes from './routes/dashboardGlobalAdminRoutes.js';
import dashboardProfessorRouter from './routes/dashboardProfessorRouter.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import defenseRouter from './routes/defenseRoute.js';
import eventRoutes from './routes/eventRoutes.js';
import globaladminRouter from './routes/globaladminRoute.js';
import NotificationRoutes from './routes/notification.routes.js';
import offreRoutes from './routes/offreRoutes.js';
import partnershipsRouter from './routes/partnershipsRoutes.js';
import ProfessorRouter from './routes/ProfessorRoute.js';
import progressRoutes, { default as progressRouter } from './routes/progressRoutes.js';
import reportRouter from './routes/reportRouter.js';
import reportRoutes from './routes/reportRoutes.js';
import sessionRouter from './routes/sessionRoute.js';
import subjectRouter from './routes/subjectRoute.js';
import subjectRoutes from './routes/subjectRoutes.js';
import testRoutes from './routes/testRoutes.js';
import universityRoutes from './routes/universityRoutes.js';
import uploadRouter from './routes/uploadRoute.js';
import userRouter from './routes/userRoute.js';
import workerRouter from './routes/workerRoute.js';
// Dans votre fichier principal (app.js ou server.js)
import publicOffersRoutes from './routes/publicOffersRoutes.js';

 


// NEW IMPORTS FOR PUBLIC TESTS AND APPLICATIONS
import publicTestRoutes from './routes/publicTestRoutes.js';

// Required for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App setup
const app = express();
const port = process.env.PORT || 4000;

// Create an HTTP server for Express and WebSocket
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/notifications' });

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('Client connected to /notifications from:', req.headers.origin);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  console.log('WebSocket Token:', token ? token.substring(0, 10) + '...' : 'No token');

  if (!token) {
    console.log('No token provided, closing connection');
    ws.close(1008, 'Authentication required');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Authenticated user:', decoded.id, 'Role:', decoded.role || 'Not provided');
    ws.user = decoded;

    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to notifications' }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from /notifications');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  } catch (err) {
    console.error('Token verification failed:', err.message, 'Token:', token ? token.substring(0, 10) + '...' : 'No token');
    ws.close(1008, 'Invalid token');
  }
});

// Connect to DB & Cloudinary
connectDB();
connectCloudinary();

// CORS setup
// ✅ Ensure uploads directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const cvsDir = path.join(__dirname, 'uploads', 'cvs');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

if (!fs.existsSync(cvsDir)) {
  fs.mkdirSync(cvsDir, { recursive: true });
  console.log('📁 Created uploads/cvs directory');
}

// ✅ Corrected CORS setup
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: function (origin, callback ) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Handle preflight requests
app.options('*', cors());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
// ✅ Serve static files - IMPORTANT: Must be before API routes
console.log('📂 Serving static files from:', path.join(__dirname, 'uploads'));
 

// ✅ Specific route for CV files with better headers
app.use('/api/uploads/cvs', (req, res, next) => {
  // Set appropriate headers for PDF files
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  next();
}, express.static(path.join(__dirname, 'uploads', 'cvs')));
 
// ✅ Upload route
app.use('/api/upload', uploadRouter);
app.use('/api/company-dashboard', CompanydashboardRoutes);

// API Routes
app.use('/api', dashboardProfessorRouter); // Unprotected version
app.use('/api/university-dashboard/dashboard', AdminDashboardRouter);
app.use('/api/partnerships', partnershipsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportRouter);
app.use('/api/notifications', NotificationRoutes); // Uses requireAuth from notification.routes.js
app.use('/api/reportSubmit', reportRoutes);
app.use('/api/globaladmin', globaladminRouter);
app.use('/api/reports', reportRouter);
app.use('/api/workers', workerRouter);
app.use('/api/companies', companyRouter);
app.use('/api/progress', progressRouter);
app.use('/api/session', sessionRouter);
app.use('/api/Professor', ProfessorRouter);
app.use('/api/defense', defenseRouter);
app.use('/api/report', reportRouter);
app.use('/api/subject', subjectRouter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/user', userRouter);

// ✅ Routes pour les offres et CV - IMPORTANT: Order matters
app.use('/api/offres', offreRoutes);
 
app.use('/api/public-test', (req, res, next) => {
    console.log(`➡️ Requête reçue sur /api/public-test: ${req.method} ${req.url}`);
    next();
}, publicTestRoutes);

app.use('/api/cvs', cvRoutes); // Route pour les CV
app.use('/api/applications', applicationRoutes); // Route pour les candidatures
app.use('/api/tests', testRoutes);
app.use('/api/dashboardglobaladmin', dashboardGlobalAdminRoutes);
// Ajouter la route
app.use('/api/public-offers', publicOffersRoutes);
 

// ✅ Debug route to check if CV files exist
app.get('/api/debug/cv/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', 'cvs', filename);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({
      exists: true,
      filename: filename,
      size: stats.size,
      path: filePath,
      url: `${process.env.BASE_URL || `http://localhost:${port}`}/api/uploads/cvs/${filename}`
    });
  } else {
    res.status(404).json({
      exists: false,
      filename: filename,
      path: filePath
    });
  }
});

// ✅ List all CV files (for debugging)
app.get('/api/debug/cvs', (req, res) => {
  try {
    const cvsDir = path.join(__dirname, 'uploads', 'cvs');
    if (fs.existsSync(cvsDir)) {
      const files = fs.readdirSync(cvsDir);
      res.json({
        directory: cvsDir,
        files: files.map(file => ({
          name: file,
          url: `${process.env.BASE_URL || `http://localhost:${port}`}/api/uploads/cvs/${file}`
        }))
      });
    } else {
      res.json({
        directory: cvsDir,
        exists: false,
        files: []
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Route
app.get('/', (req, res) => {
  res.send('API working');
});

// ✅ Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
});

 // ✅ 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start cron jobs
startDefenseStatusJob();

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`📂 Base URL: ${process.env.BASE_URL || `http://localhost:${port}`}`);
  console.log(`📄 CV files accessible at: ${process.env.BASE_URL || `http://localhost:${port}`}/api/uploads/cvs/[filename]`);
  console.log('🕑 Current server time:', new Date());
  console.log('WebSocket server running on ws://localhost:4000/notifications');
  console.log('📁 Uploads directory:', path.join(__dirname, 'uploads'));
  console.log('📁 CVs directory:', path.join(__dirname, 'uploads', 'cvs'));
});


