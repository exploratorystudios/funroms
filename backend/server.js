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
    console.log('Request headers:', req.headers);

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File details:', req.file);

    try {
        const targetPath = path.join(__dirname, 'uploads', req.file.originalname);
        fs.renameSync(req.file.path, targetPath);
        console.log(`File saved to ${targetPath}`);
        res.json({ message: 'File uploaded successfully!' });
    } catch (error) {
        console.error('Error during file processing:', error);
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
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
