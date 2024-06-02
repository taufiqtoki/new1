const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

let data = {
  customers: [],
  referers: [],
  orders: [],
  items: []
};

const loadData = () => {
  fs.readFile('data.json', (err, jsonData) => {
    if (err) {
      console.error('Error reading data:', err);
      return;
    }
    data = JSON.parse(jsonData);
  });
};

const saveData = () => {
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error saving data:', err);
    }
  });
};

loadData();

app.use(express.json());
app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  res.json(data);
});

app.post('/api/order', (req, res) => {
  const order = req.body;
  data.orders.push(order);

  let customer = data.customers.find(c => c.customerPhone === order.customerPhone);
  if (!customer) {
    customer = { customerName: order.customerName, customerPhone: order.customerPhone, totalSpent: 0, totalProfitGiven: 0 };
    data.customers.push(customer);
  }
  customer.totalSpent += order.totalPrice;
  customer.totalProfitGiven += order.totalProfit;

  let referer = data.referers.find(r => r.refererPhone === order.refererPhone);
  if (!referer && order.refererPhone) {
    referer = { refererName: order.refererName, refererPhone: order.refererPhone, totalCommission: 0 };
    data.referers.push(referer);
  }
  if (referer) {
    referer.totalCommission += order.totalProfit * 0.1; // Assuming 10% commission
  }

  order.items.forEach(item => {
    let existingItem = data.items.find(i => i.name === item.name);
    if (!existingItem) {
      existingItem = { name: item.name, price: item.price, cpp: item.cpp };
      data.items.push(existingItem);
    }
  });

  saveData();
  res.status(201).send(order);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
