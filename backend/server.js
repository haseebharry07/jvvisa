const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const visaRecordRoutes = require('./routes/visaRecordRoutes');


// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// Serve frontend static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/records', visaRecordRoutes);

// Fallback: serve index.html for any non-API route (basic single-page setup)
app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Global error handler (catches anything not handled above)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 