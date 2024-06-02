document.addEventListener('DOMContentLoaded', () => {
  const posForm = document.getElementById('pos-form');
  const customerNameInput = document.getElementById('customer-name');
  const customerPhoneInput = document.getElementById('customer-phone');
  const refererNameInput = document.getElementById('referer-name');
  const refererPhoneInput = document.getElementById('referer-phone');
  const posItems = document.getElementById('pos-items');
  const productsTotal = document.getElementById('products-total');
  const totalPrice = document.getElementById('total-price');
  const toast = document.getElementById('toast');
  const customerSuggestions = document.getElementById('customer-suggestions');
  const refererSuggestions = document.getElementById('referer-suggestions');
  let itemCount = 0;
  let currentOrderId = 1;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  };

  const fetchAndUpdateData = async () => {
    try {
      const response = await axios.get('/api/data');
      const data = response.data;

      // Update customer suggestions
      customerSuggestions.innerHTML = '';
      data.customers.forEach((customer) => {
        const li = document.createElement('li');
        li.textContent = `${customer.customerName} (${customer.customerPhone})`;
        li.dataset.phone = customer.customerPhone;
        li.dataset.name = customer.customerName;
        li.addEventListener('click', () => {
          customerNameInput.value = customer.customerName;
          customerPhoneInput.value = customer.customerPhone;
          customerSuggestions.classList.add('hidden');
        });
        customerSuggestions.appendChild(li);
      });

      // Update referer suggestions
      refererSuggestions.innerHTML = '';
      data.referers.forEach((referer) => {
        const li = document.createElement('li');
        li.textContent = `${referer.refererName} (${referer.refererPhone})`;
        li.dataset.phone = referer.refererPhone;
        li.dataset.name = referer.refererName;
        li.addEventListener('click', () => {
          refererNameInput.value = referer.refererName;
          refererPhoneInput.value = referer.refererPhone;
          refererSuggestions.classList.add('hidden');
        });
        refererSuggestions.appendChild(li);
      });

      // Update customers tab
      const customerList = document.getElementById('customer-list');
      customerList.innerHTML = '';
      data.customers.forEach((customer, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="border px-4 py-2">${index + 1}</td>
          <td class="border px-4 py-2">${customer.customerName}</td>
          <td class="border px-4 py-2">${customer.customerPhone}</td>
          <td class="border px-4 py-2">${customer.totalSpent}</td>
          <td class="border px-4 py-2">${customer.totalProfitGiven}</td>
        `;
        customerList.appendChild(row);
      });

      // Update referers tab
      const refererList = document.getElementById('referer-list');
      refererList.innerHTML = '';
      data.referers.forEach((referer, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="border px-4 py-2">${index + 1}</td>
          <td class="border px-4 py-2">${referer.refererName}</td>
          <td class="border px-4 py-2">${referer.refererPhone}</td>
          <td class="border px-4 py-2">${referer.totalCommission}</td>
          <td class="border px-4 py-2"><button class="px-2 py-1 bg-red-500 text-white rounded">Withdraw</button></td>
        `;
        refererList.appendChild(row);
      });

      // Update sales history tab
      const salesHistoryList = document.getElementById('sales-history-list');
      salesHistoryList.innerHTML = '';
      data.orders.forEach((order, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="border px-4 py-2">${new Date(order.date).toLocaleDateString()}</td>
          <td class="border px-4 py-2">${index + 1}</td>
          <td class="border px-4 py-2">${order.customerName}</td>
          <td class="border px-4 py-2">${order.totalPrice}</td>
          <td class="border px-4 py-2">${order.totalProfit}</td>
          <td class="border px-4 py-2 text-center"><button class="px-2 py-1 bg-red-500 text-white rounded">Delete</button></td>
        `;
        salesHistoryList.appendChild(row);
      });

      updateSalesSummary(data.orders);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateSalesSummary = (orders) => {
    const salesSummary = document.getElementById('sales-summary');
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    let totalSalesToday = 0;
    let totalProfitToday = 0;
    let totalSalesMonth = 0;
    let totalProfitMonth = 0;
    let overallSales = 0;
    let overallProfit = 0;

    orders.forEach((order) => {
      const orderDate = order.date.split('T')[0];
      const orderMonth = order.date.slice(0, 7);
      overallSales += order.totalPrice;
      overallProfit += order.totalProfit;

      if (orderDate === today) {
        totalSalesToday += order.totalPrice;
        totalProfitToday += order.totalProfit;
      }

      if (orderMonth === currentMonth) {
        totalSalesMonth += order.totalPrice;
        totalProfitMonth += order.totalProfit;
      }
    });

    salesSummary.innerHTML = `
      <p>Total Sales Today: ${totalSalesToday}</p>
      <p>Total Profit Today: ${totalProfitToday}</p>
      <p>Total Sales This Month: ${totalSalesMonth}</p>
      <p>Total Profit This Month: ${totalProfitMonth}</p>
      <p>Overall Sales: ${overallSales}</p>
      <p>Overall Profit: ${overallProfit}</p>
    `;
  };

  const addItemRow = () => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="border px-4 py-2">${++itemCount}</td>
      <td class="border px-4 py-2"><input type="text" class="w-full p-2 border rounded"></td>
      <td class="border px-4 py-2"><input type="number" class="w-full p-2 border rounded" value="500"></td>
      <td class="border px-4 py-2"><input type="number" class="w-full p-2 border rounded" value="1"></td>
      <td class="border px-4 py-2"><input type="number" class="w-full p-2 border rounded" value="400"></td>
      <td class="border px-4 py-2">500</td>
      <td class="border px-4 py-2 text-center"><button class="px-2 py-1 bg-red-500 text-white rounded">Delete</button></td>
    `;
    posItems.appendChild(row);
    updateTotal();
  };

  const updateTotal = () => {
    const rows = posItems.querySelectorAll('tr');
    let totalProducts = 0;
    let grandTotal = 0;
    rows.forEach((row) => {
      const qty = row.children[3].querySelector('input').value;
      const price = row.children[2].querySelector('input').value;
      const total = qty * price;
      row.children[5].textContent = total.toFixed(2);
      totalProducts += parseInt(qty, 10);
      grandTotal += total;
    });
    productsTotal.textContent = totalProducts;
    totalPrice.textContent = grandTotal.toFixed(2);
  };

  posForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const customerName = customerNameInput.value;
    const customerPhone = customerPhoneInput.value;
    const refererName = refererNameInput.value;
    const refererPhone = refererPhoneInput.value;

    const items = [];
    const rows = posItems.querySelectorAll('tr');
    rows.forEach((row) => {
      const itemName = row.children[1].querySelector('input').value;
      const itemPrice = parseFloat(row.children[2].querySelector('input').value);
      const itemQty = parseInt(row.children[3].querySelector('input').value, 10);
      const itemCPP = parseFloat(row.children[4].querySelector('input').value);
      const itemTotal = itemPrice * itemQty;
      items.push({ name: itemName, price: itemPrice, qty: itemQty, cpp: itemCPP, total: itemTotal });
    });

    const totalProducts = items.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.total, 0);
    const totalProfit = items.reduce((acc, item) => acc + (item.price - item.cpp) * item.qty, 0);

    const order = {
      customerName,
      customerPhone,
      refererName,
      refererPhone,
      items,
      date: new Date().toISOString(),
      totalProducts,
      totalPrice,
      totalProfit,
      orderId: currentOrderId++
    };

    try {
      await axios.post('/api/order', order);
      showToast('Order saved successfully!');
      fetchAndUpdateData();
    } catch (error) {
      showToast('Error saving order!');
      console.error('Error saving order:', error);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete') {
      const focusedRow = document.activeElement.closest('tr');
      if (focusedRow) {
        focusedRow.remove();
        updateTotal();
      }
    }
  });

  fetchAndUpdateData();
  addItemRow();
});
