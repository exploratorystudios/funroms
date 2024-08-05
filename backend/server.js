const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors({ origin: 'https://exploratorystudios.github.io' }));

// Middleware to serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to handle file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('File upload request received');
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({ message: 'File uploaded successfully!' });
});

// Endpoint to list files
app.get('/api/files', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return res.status(500).send('Unable to scan directory.');
        }
        const fileData = files.map(file => ({ name: file, url: `uploads/${file}` }));
        res.json(fileData);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
