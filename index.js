const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  fs.readFile('data.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data file');
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post('/api/order', (req, res) => {
  fs.readFile('data.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data file');
    } else {
      const jsonData = JSON.parse(data);
      jsonData.orders.push(req.body);
      fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          res.status(500).send('Error writing data file');
        } else {
          res.status(200).send('Order saved successfully');
        }
      });
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
