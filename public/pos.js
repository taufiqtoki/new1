document.addEventListener('DOMContentLoaded', () => {
  let itemCount = 0;

  const addItemRow = () => {
    itemCount++;
    const posItems = document.getElementById('pos-items');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="border px-4 py-2">${itemCount}</td>
      <td class="border px-4 py-2"><input type="text" class="item-name w-full p-2 border rounded"></td>
      <td class="border px-4 py-2"><input type="number" class="item-price w-full p-2 border rounded" step="0.01"></td>
      <td class="border px-4 py-2"><input type="number" class="item-qty w-full p-2 border rounded"></td>
      <td class="border px-4 py-2"><input type="number" class="item-cpp w-full p-2 border rounded" step="0.01"></td>
      <td class="border px-4 py-2 item-total">0.00</td>
      <td class="border px-4 py-2"><button class="remove-item px-4 py-2 bg-red-500 text-white rounded">Remove</button></td>
    `;
    posItems.appendChild(row);
  };

  const calculateTotal = () => {
    let totalProducts = 0;
    let totalPrice = 0;

    document.querySelectorAll('#pos-items tr').forEach(row => {
      const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      const cpp = parseFloat(row.querySelector('.item-cpp').value) || 0;
      const total = qty * price;

      row.querySelector('.item-total').textContent = total.toFixed(2);

      totalProducts += qty;
      totalPrice += total;
    });

    document.getElementById('products-total').textContent = totalProducts;
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
  };

  document.getElementById('add-item').addEventListener('click', addItemRow);
  document.getElementById('pos-form').addEventListener('input', calculateTotal);
  document.getElementById('pos-items').addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-item')) {
      event.target.closest('tr').remove();
      calculateTotal();
    }
  });

  document.getElementById('pos-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const refererName = document.getElementById('referer-name').value;
    const refererPhone = document.getElementById('referer-phone').value;
    
    const items = Array.from(document.querySelectorAll('#pos-items tr')).map(row => ({
      name: row.querySelector('.item-name').value,
      price: parseFloat(row.querySelector('.item-price').value) || 0,
      qty: parseFloat(row.querySelector('.item-qty').value) || 0,
      cpp: parseFloat(row.querySelector('.item-cpp').value) || 0,
      total: parseFloat(row.querySelector('.item-total').textContent) || 0
    }));

    const orderData = {
      customerName,
      customerPhone,
      refererName,
      refererPhone,
      items,
      date: new Date().toISOString(),
      totalProducts: parseInt(document.getElementById('products-total').textContent),
      totalPrice: parseFloat(document.getElementById('total-price').textContent)
    };

    try {
      const response = await axios.post('/api/save', {
        section: 'orders',
        data: orderData
      });
      alert('Order saved successfully');
      document.getElementById('pos-form').reset();
      document.getElementById('pos-items').innerHTML = '';
      addItemRow();
      calculateTotal();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order');
    }
  });

  addItemRow();
});
