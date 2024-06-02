document.addEventListener('DOMContentLoaded', () => {
  const posForm = document.getElementById('pos-form');
  const posItems = document.getElementById('pos-items');
  const customerNameInput = document.getElementById('customer-name');
  const customerPhoneInput = document.getElementById('customer-phone');
  const refererNameInput = document.getElementById('referer-name');
  const refererPhoneInput = document.getElementById('referer-phone');
  const productsTotal = document.getElementById('products-total');
  const totalPrice = document.getElementById('total-price');
  const totalProfit = document.getElementById('total-profit');
  const toast = document.getElementById('toast');
  let itemCount = 0;

  const showToast = (message, type = 'success') => {
    toast.textContent = message;
    toast.classList.remove('hidden', 'bg-red-500', 'bg-green-500');
    toast.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  };

  const fetchAndUpdateData = async () => {
    try {
      const response = await axios.get('/api/data');
      const data = response.data;

      updateCustomerSuggestions(data.customers);
      updateRefererSuggestions(data.referers);
      updateCustomerList(data.customers);
      updateRefererList(data.referers);
      updateSalesHistory(data.orders);
      updateSalesSummary(data.orders);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateRowTotal = (row) => {
    const itemPrice = parseFloat(row.children[2].querySelector('input').value) || 0;
    const itemQty = parseInt(row.children[3].querySelector('input').value, 10) || 0;
    const itemCPP = parseFloat(row.children[4].querySelector('input').value) || 0;
    const total = itemPrice * itemQty;
    const ppp = itemPrice - itemCPP;

    row.children[5].textContent = ppp.toFixed(2);
    row.children[6].textContent = total.toFixed(2);
  };

  const updateTotals = () => {
    let totalProducts = 0;
    let grandTotal = 0;
    let totalProfits = 0;
    posItems.querySelectorAll('tr').forEach(row => {
      const itemQty = parseInt(row.children[3].querySelector('input').value, 10) || 0;
      const total = parseFloat(row.children[6].textContent) || 0;
      const ppp = parseFloat(row.children[5].textContent) || 0;
      totalProducts += itemQty;
      grandTotal += total;
      totalProfits += ppp * itemQty;
    });
    productsTotal.textContent = `Total products: ${totalProducts}`;
    totalPrice.textContent = `Grand total: ${grandTotal.toFixed(2)}`;
    totalProfit.textContent = `Total profit: ${totalProfits.toFixed(2)}`;
  };

  const validateRow = (row) => {
    const itemName = row.children[1].querySelector('input').value.trim();
    const itemPrice = parseFloat(row.children[2].querySelector('input').value);
    const itemQty = parseInt(row.children[3].querySelector('input').value, 10);
    const itemCPP = parseFloat(row.children[4].querySelector('input').value);

    if (!itemName) {
      showToast('Item name cannot be empty.', 'error');
      return false;
    }

    if (isNaN(itemPrice) || itemPrice <= 0) {
      showToast('Item price must be a positive number.', 'error');
      return false;
    }

    if (isNaN(itemQty) || itemQty <= 0) {
      showToast('Item quantity must be a positive number.', 'error');
      return false;
    }

    if (isNaN(itemCPP) || itemCPP < 0) {
      showToast('Item cost price must be a non-negative number.', 'error');
      return false;
    }

    return true;
  };

  const resequenceSerialNumbers = () => {
    let count = 1;
    posItems.querySelectorAll('tr').forEach(row => {
      row.children[0].textContent = count++;
    });
  };

  const addItemRow = () => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="border px-4 py-2">${++itemCount}</td>
      <td class="border px-4 py-2"><input type="text" class="w-full p-2 border rounded" required></td>
      <td class="border px-4 py-2"><input type="number" class="w-full p-2 border rounded" value="" min="0.01" step="0.01" required></td>
      <td class="border px-4 py-2"><input type="number" class="w-full p-2 border rounded" value="1" min="1" step="1" required></td>
      <td class="border px-4 py-2"><input type="number" class="w-full p-2 border rounded" value="0" min="0" step="0.01" required></td>
      <td class="border px-4 py-2">0</td>
      <td class="border px-4 py-2">0</td>
      <td class="border px-4 py-2">${itemCount === 1 ? '<button class="bg-green-500 text-white px-2 py-1 rounded" onclick="addItemRow()">Add</button>' : '<button class="bg-red-500 text-white px-2 py-1 rounded" onclick="removeItemRow(this)">Remove</button>'}</td>
    `;
    posItems.appendChild(row);

    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        if (validateRow(row)) {
          updateRowTotal(row);
          updateTotals();
        }
      });
    });

    row.querySelector('input').focus();
  };

  const removeItemRow = (button) => {
    const row = button.closest('tr');
    posItems.removeChild(row);
    itemCount--;
    resequenceSerialNumbers();
    updateTotals();
  };

  posForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (posItems.children.length === 0) {
      showToast('Please add at least one item.', 'error');
      return;
    }

    const customerName = customerNameInput.value.trim();
    const customerPhone = customerPhoneInput.value.trim();
    const refererName = refererNameInput.value.trim();
    const refererPhone = refererPhoneInput.value.trim();

    if (!customerName || !customerPhone || !refererName || !refererPhone) {
      showToast('Customer and referer information cannot be empty.', 'error');
      return;
    }

    const items = Array.from(posItems.children).map(row => {
      const itemName = row.children[1].querySelector('input').value.trim();
      const itemPrice = parseFloat(row.children[2].querySelector('input').value);
      const itemQty = parseInt(row.children[3].querySelector('input').value, 10);
      const itemCPP = parseFloat(row.children[4].querySelector('input').value);
      const total = itemPrice * itemQty;
      const ppp = itemPrice - itemCPP;
      return { name: itemName, price: itemPrice, qty: itemQty, cpp: itemCPP, total, ppp };
    });

    const order = {
      customerName,
      customerPhone,
      refererName,
      refererPhone,
      items,
      date: new Date().toISOString(),
      totalProducts: items.reduce((sum, item) => sum + item.qty, 0),
      totalPrice: items.reduce((sum, item) => sum + item.total, 0),
      totalProfit: items.reduce((sum, item) => sum + (item.ppp * item.qty), 0)
    };

    try {
      await axios.post('/api/order', order);
      showToast('Order placed successfully!');
      posItems.innerHTML = '';
      customerNameInput.value = '';
      customerPhoneInput.value = '';
      refererNameInput.value = '';
      refererPhoneInput.value = '';
      updateTotals();
      fetchAndUpdateData();
      addItemRow(); // Add a new row after placing the order
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Error placing order.', 'error');
    }
  });

  // Add default row on load
  addItemRow();

  // Add new row on Enter key press
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addItemRow();
    }
  });

  // Delete focused row on Delete key press
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete') {
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement.tagName === 'INPUT') {
        const row = focusedElement.closest('tr');
        if (row) {
          posItems.removeChild(row);
          itemCount--;
          resequenceSerialNumbers();
          updateTotals();
        }
      }
    }
  });

  customerPhoneInput.addEventListener('input', () => {
    const query = customerPhoneInput.value.toLowerCase();
    customerSuggestions.classList.toggle('hidden', !query);
    Array.from(customerSuggestions.children).forEach(li => {
      const matches = li.dataset.phone.toLowerCase().includes(query);
      li.classList.toggle('hidden', !matches);
    });
  });

  refererPhoneInput.addEventListener('input', () => {
    const query = refererPhoneInput.value.toLowerCase();
    refererSuggestions.classList.toggle('hidden', !query);
    Array.from(refererSuggestions.children).forEach(li => {
      const matches = li.dataset.phone.toLowerCase().includes(query);
      li.classList.toggle('hidden', !matches);
    });
  });

  fetchAndUpdateData();
});
