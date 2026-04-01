import express from 'express';
const app = express();

app.use(express.json());

// CORS configuration for both local development and production
const allowedOrigins = [
    'http://localhost:3000',     // Vite dev server
    'http://localhost:5173',     // Vite default port
    'http://localhost:5000',     // Local backend
    'https://bharat-tech-admin.onrender.com',  // Production Render server
    'https://localhost:3000',
    'https://localhost:5173'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow requests from any listed origin
    if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    } else if (process.env.NODE_ENV === 'development') {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

import emailRoutes from './Routes/emailRoutes.js';
app.use('/api/emails', emailRoutes);

export default app;
