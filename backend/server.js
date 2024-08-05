const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// GitHub repository details
const GITHUB_REPO = 'exploratorystudios/funroms';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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

// Setup multer for file uploads with a file size limit of 100 MB
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage for debugging
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

// Endpoint to handle file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log('File upload request received');

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const base64Content = req.file.buffer.toString('base64');

    try {
        const response = await axios.put(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/uploads/${req.file.originalname}`,
            {
                message: `Add ${req.file.originalname}`,
                content: base64Content
            },
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity // Ensure axios can handle large requests
            }
        );

        console.log(`File committed to GitHub: ${response.data.content.path}`);
        res.json({ message: 'File uploaded and committed to GitHub successfully!' });
    } catch (error) {
        console.error('Error committing file to GitHub:', error.message);
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});

// Endpoint to list files
app.get('/api/files', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/uploads`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`
                }
            }
        );

        const fileData = response.data.map(file => ({ name: file.name, url: file.download_url }));
        res.json(fileData);
    } catch (error) {
        console.error('Error fetching file list from GitHub:', error.message);
        res.status(500).json({ message: 'Failed to fetch file list', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
