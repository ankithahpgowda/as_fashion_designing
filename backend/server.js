const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'fashion_academy'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    console.log('Ensure MySQL is running and database "fashion_academy" exists.');
  } else {
    console.log('Connected to MySQL database.');
    
    // Create tables if they don't exist
    const createCoursesTable = `
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        duration VARCHAR(100),
        fees VARCHAR(100),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(createCoursesTable, (err) => {
        if(err) console.error("Error creating courses table:", err);
    });

    const createEnquiriesTable = `
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        course_interested VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(createEnquiriesTable, (err) => {
        if(err) console.error("Error creating enquiries table:", err);
    });
  }
});

// API Routes
app.get('/api/courses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/enquiries', (req, res) => {
    const { name, email, phone, course_interested, city, message } = req.body;
    const query = 'INSERT INTO enquiries (name, email, phone, course_interested, message) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, phone, course_interested, message], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Enquiry submitted successfully!', id: result.insertId });
    });
});

// Catch-all route to serve the frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
