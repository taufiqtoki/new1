const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data.json');

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/save', (req, res) => {
    const { section, data } = req.body;

    fs.readFile(dataFilePath, 'utf8', (err, fileData) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }

        let jsonData = fileData ? JSON.parse(fileData) : { customers: [], referers: [], orders: [], items: [] };
        
        if (!jsonData[section]) {
            return res.status(400).json({ error: 'Invalid section' });
        }

        jsonData[section].push(data);

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save data' });
            }

            res.status(200).json({ message: 'Data saved successfully' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
