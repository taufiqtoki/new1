document.addEventListener('DOMContentLoaded', () => {
  const customerSuggestions = document.getElementById('customer-suggestions');
  const refererSuggestions = document.getElementById('referer-suggestions');
  const customerList = document.getElementById('customer-list');
  const refererList = document.getElementById('referer-list');
  const salesHistory = document.getElementById('sales-history');
  const salesSummary = document.getElementById('sales-summary');
  const clearDataButton = document.getElementById('clear-data');

  const updateCustomerSuggestions = (customers) => {
    if (customerSuggestions) {
      customerSuggestions.innerHTML = '';
      customers.forEach(customer => {
        const li = document.createElement('li');
        li.textContent = `${customer.customerName} - ${customer.customerPhone}`;
        li.dataset.phone = customer.customerPhone;
        customerSuggestions.appendChild(li);
      });
    }
  };

  const updateRefererSuggestions = (referers) => {
    if (refererSuggestions) {
      refererSuggestions.innerHTML = '';
      referers.forEach(referer => {
        const li = document.createElement('li');
        li.textContent = `${referer.refererName} - ${referer.refererPhone}`;
        li.dataset.phone = referer.refererPhone;
        refererSuggestions.appendChild(li);
      });
    }
  };

  const updateCustomerList = (customers) => {
    if (customerList) {
      customerList.innerHTML = '';
      customers.forEach((customer, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="border px-4 py-2">${index + 1}</td>
          <td class="border px-4 py-2">${customer.customerName}</td>
          <td class="border px-4 py-2">${customer.customerPhone}</td>
          <td class="border px-4 py-2">${customer.totalSpent}</td>
          <td class="border px-4 py-2">${customer.totalProfitGiven}</td>
        `;
        customerList.appendChild(tr);
      });
    }
  };

  const updateRefererList = (referers) => {
    if (refererList) {
      refererList.innerHTML = '';
      referers.forEach((referer, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="border px-4 py-2">${index + 1}</td>
          <td class="border px-4 py-2">${referer.refererName}</td>
          <td class="border px-4 py-2">${referer.refererPhone}</td>
          <td class="border px-4 py-2">${referer.totalCommission}</td>
          <td class="border px-4 py-2"><button class="bg-red-500 text-white px-2 py-1 rounded">Withdraw</button></td>
        `;
        refererList.appendChild(tr);
      });
    }
  };

  const updateSalesHistory = (orders) => {
    if (salesHistory) {
      salesHistory.innerHTML = '';
      orders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="border px-4 py-2">${index + 1}</td>
          <td class="border px-4 py-2">${order.customerName}</td>
          <td class="border px-4 py-2">${order.refererName}</td>
          <td class="border px-4 py-2">${order.totalProducts}</td>
          <td class="border px-4 py-2">${order.totalPrice.toFixed(2)}</td>
          <td class="border px-4 py-2">${order.totalProfit.toFixed(2)}</td>
          <td class="border px-4 py-2">${new Date(order.date).toLocaleString()}</td>
        `;
        salesHistory.appendChild(tr);
      });
    }
  };

  const saveData = (section, data) => {
    fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ section, data })
    })
    .then(response => response.json())
    .then(result => {
      console.log('Data saved successfully:', result);
    })
    .catch(error => {
      console.error('Error saving data:', error);
    });
  };


  const updateSalesSummary = (orders) => {
    if (salesSummary) {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7);

      let dailySales = 0;
      let dailyProfit = 0;
      let monthlySales = 0;
      let monthlyProfit = 0;
      let overallSales = 0;
      let overallProfit = 0;

      orders.forEach(order => {
        const orderDate = order.date.split('T')[0];
        const orderMonth = orderDate.slice(0, 7);

        if (orderDate === today) {
          dailySales += order.totalPrice;
          dailyProfit += order.totalProfit;
        }
        if (orderMonth === currentMonth) {
          monthlySales += order.totalPrice;
          monthlyProfit += order.totalProfit;
        }

        overallSales += order.totalPrice;
        overallProfit += order.totalProfit;
      });

      salesSummary.innerHTML = `
        <div class="my-2">Total Sales Today: ${dailySales.toFixed(2)}, Total Profit Today: ${dailyProfit.toFixed(2)}</div>
        <div class="my-2">Total Sales This Month: ${monthlySales.toFixed(2)}, Total Profit This Month: ${monthlyProfit.toFixed(2)}</div>
        <div class="my-2">Overall Sales: ${overallSales.toFixed(2)}, Overall Profit: ${overallProfit.toFixed(2)}</div>
      `;
    }
  };

  const fetchAndUpdateData = () => {
    fetch('/api/data')
      .then(response => response.json())
      .then(data => {
        const { customers, referers, orders } = data;
        updateCustomerSuggestions(customers);
        updateRefererSuggestions(referers);
        updateCustomerList(customers);
        updateRefererList(referers);
        updateSalesHistory(orders);
        updateSalesSummary(orders);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const clearData = () => {
    fetch('/api/clear', {
      method: 'POST'
    })
    .then(response => response.json())
    .then(result => {
      console.log('Data cleared successfully:', result);
      // Clear the data on the frontend
      updateCustomerSuggestions([]);
      updateRefererSuggestions([]);
      updateCustomerList([]);
      updateRefererList([]);
      updateSalesHistory([]);
      updateSalesSummary([]);
    })
    .catch(error => {
      console.error('Error clearing data:', error);
    });
  };

  if (clearDataButton) {
    clearDataButton.addEventListener('click', clearData);
  }

  fetchAndUpdateData();
});
