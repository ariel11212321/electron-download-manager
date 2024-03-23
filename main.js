const { app, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

let mainWindow;
const appServer = express();

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
}


app.whenReady().then(() => {
    createWindow();

    // Start the Express server
    const server = appServer.listen(3000, () => {
        console.log('Server running on port 3000');
    });

    
    appServer.get("/delete", async (req, res) => {
        const name = req.query.name; // Assuming the query parameter contains the name of the file to delete
    
        try {
            // Perform deletion logic here
            // For example, you can use fs.unlinkSync to delete the file
            // Construct the full path to the file
            const filePath = path.join('C:\\Users\\ariel\\Downloads\\ariel', name);
    
            // Check if the file exists
            if (fs.existsSync(filePath)) {
                // Delete the file
                fs.unlinkSync(filePath);
                console.log(`File '${name}' deleted successfully.`);
                res.send({ success: true, message: `File '${name}' deleted successfully.` });
            } else {
                console.log(`File '${name}' not found.`);
                res.status(404).send({ success: false, message: `File '${name}' not found.` });
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).send({ success: false, error: 'An error occurred while deleting the file.' });
        }
    });

    appServer.get("/rename", async (req, res) => {
        const oldName = req.query.oldName; // Assuming the query parameter contains the old name of the file
        const newName = req.query.newName; // Assuming the query parameter contains the new name of the file
    
        try {
            // Perform renaming logic here
            // Construct the full paths to the old and new files
            const oldFilePath = path.join('C:\\Users\\ariel\\Downloads\\ariel', oldName);
            const newFilePath = path.join('C:\\Users\\ariel\\Downloads\\ariel', newName);
    
            // Check if the old file exists
            if (fs.existsSync(oldFilePath)) {
                // Rename the file
                fs.renameSync(oldFilePath, newFilePath);
                console.log(`File '${oldName}' renamed to '${newName}' successfully.`);
                res.send({ success: true, message: `File '${oldName}' renamed to '${newName}' successfully.` });
            } else {
                console.log(`File '${oldName}' not found.`);
                res.status(404).send({ success: false, message: `File '${oldName}' not found.` });
            }
        } catch (error) {
            console.error('Error renaming file:', error);
            res.status(500).send({ success: false, error: 'An error occurred while renaming the file.' });
        }
    });

    // Handle download requests
    appServer.get('/download', async (req, res) => {
        const { url, name } = req.query;
        const fileType = url.split('.').pop();
        

        try {
            const filePath = await downloadFile(url, fileType, name);
            res.send({ success: true, filePath });
        } catch (error) {
            res.send({ success: false, error: error.message });
        }
    });
    appServer.get('/files', async (req, res) => {
       
        try {
            const directoryPath = 'C:\\Users\\ariel\\Downloads\\ariel';
            const { documents, photos, videos } = mapDirectory(directoryPath);

            console.log('Documents:', documents);
            console.log('Photos:', photos);
            console.log('Videos:', videos);
        
            res.send({sucess: true, documents, photos, videos});
        } catch (error) {
            res.send({ success: false, error: error.message });
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

async function downloadFile(url, type, name) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    const fileName = `${name}.${type}`;
    const downloadsPath = app.getPath('downloads');
    const userDownloadsPath = path.join(downloadsPath, 'ariel');
    const filePath = path.join(userDownloadsPath, fileName);

    if (!fs.existsSync(userDownloadsPath)) {
        fs.mkdirSync(userDownloadsPath, { recursive: true });
    }

    fs.writeFileSync(filePath, response.data);

    return filePath;
}



function mapDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);

    const documents = [];
    const photos = [];
    const videos = [];

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const fileExtension = path.extname(filePath).toLowerCase();

        if (fileExtension === '.txt' || fileExtension === '.pdf' || fileExtension === '.doc' || fileExtension === '.docx') {
            documents.push(file);
        } else if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png' || fileExtension === '.gif') {
            photos.push(file);
        } else if (fileExtension === '.mp4' || fileExtension === '.avi' || fileExtension === '.mov' || fileExtension === '.wmv') {
            videos.push(file);
        }
    });

    return { documents, photos, videos };
}

// Example usage:
