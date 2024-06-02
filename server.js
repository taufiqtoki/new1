const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data.json');

app.use(bodyParser.json());
app.use(express.static('public'));

const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return { customers: [], referers: [], orders: [], items: [] };
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return data ? JSON.parse(data) : { customers: [], referers: [], orders: [], items: [] };
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

app.post('/api/save', (req, res) => {
  const { section, data } = req.body;
  const jsonData = readData();

  if (!jsonData[section]) {
    return res.status(400).json({ error: 'Invalid section' });
  }

  jsonData[section].push(data);
  writeData(jsonData);

  res.status(200).json({ message: 'Data saved successfully' });
});

app.get('/api/data', (req, res) => {
  const jsonData = readData();
  res.status(200).json(jsonData);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
