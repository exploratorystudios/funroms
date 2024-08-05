const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created');
}

// Use CORS middleware
app.use(cors({ origin: 'https://exploratorystudios.github.io' }));

// Middleware to serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Setup multer for file uploads
const upload = multer({ dest: uploadDir });

// Endpoint to handle file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('File upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request file:', req.file);

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const targetPath = path.join(uploadDir, req.file.originalname);
        fs.rename(req.file.path, targetPath, (err) => {
            if (err) {
                console.error('Error moving file:', err);
                return res.status(500).json({ message: 'File upload failed', error: err.message });
            }
            console.log(`File saved to ${targetPath}`);
            res.json({ message: 'File uploaded successfully!' });
        });
    } catch (error) {
        console.error('Error during file processing:', error);
        res.status(500).json({ message: 'File upload failed', error: error.stack });
    }
});

// Configure Axios to handle large request bodies
axios.defaults.maxBodyLength = Infinity;
axios.defaults.maxContentLength = Infinity;

// Endpoint to list files
app.get('/api/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
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
