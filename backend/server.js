const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: 'https://exploratorystudios.github.io',
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware to serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// GitHub repository details
const GITHUB_REPO = 'exploratorystudios/funroms';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Endpoint to handle file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log('File upload request received');
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath, 'base64');
        const fileName = req.file.originalname;

        console.log(`Uploading file: ${fileName}`);

        const response = await axios.put(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/uploads/${fileName}`,
            {
                message: `Upload file ${fileName}`,
                content: fileContent,
                branch: 'main',
            },
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`GitHub response: ${response.status} ${response.statusText}`);

        fs.unlinkSync(filePath);  // Clean up the uploaded file from the server

        res.json({ message: 'File uploaded successfully!' });
    } catch (error) {
        console.error('Error during file upload:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});

// Endpoint to list files
app.get('/api/files', (req, res) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Unable to scan directory:', err);
            return res.status(500).send('Unable to scan directory.');
        }
        const fileList = files.map(file => ({
            name: file,
            url: `uploads/${file}`
        }));
        res.json({ files: fileList });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
