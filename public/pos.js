$(document).ready(function () {
  let customers = JSON.parse(localStorage.getItem('customers')) || [];
  let referrers = JSON.parse(localStorage.getItem('referrers')) || [];
  let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
  let currentRow = 0;

  function updateLocalStorage() {
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('referrers', JSON.stringify(referrers));
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
  }

  function updateTableCounts() {
    let totalQty = 0;
    $('#pos-items tr').each(function () {
      totalQty += parseFloat($(this).find('.item-qty').val()) || 0;
    });
    $('#products-total').text(`Total Products: ${totalQty}`);
    calculateTotals();
  }

  function calculateTotals() {
    let totalProfit = 0;
    let totalPrice = 0;
    $('#pos-items tr').each(function () {
      const price = parseFloat($(this).find('.item-price').val()) || 0;
      const qty = parseFloat($(this).find('.item-qty').val()) || 1;
      const cpp = parseFloat($(this).find('.cpp-input').val()) || 0;
      const ppp = price - cpp;
      const total = price * qty;
      const profit = (price - cpp) * qty;
      totalProfit += profit;
      totalPrice += total;
      $(this).find('.ppp-input').val(ppp.toFixed(2));
      $(this).find('.total-input').val(total.toFixed(2));
    });
    $('#total-profit').text(`Total Profit: ${totalProfit.toFixed(2)}`);
    $('#total-price').text(`Total Price: ${totalPrice.toFixed(2)}`);
  }

  function fetchCustomerData(phone) {
    const customer = customers.find(c => c.phone === phone);
    if (customer) {
      $('#customer-name').val(customer.name);
    } else {
      $('#customer-name').val('');
    }
  }

  function fetchReferrerData(phone) {
    const referrer = referrers.find(r => r.phone === phone);
    if (referrer) {
      $('#referrer-name').val(referrer.name);
    } else {
      $('#referrer-name').val('');
    }
  }

  function handleCustomerPhoneInput() {
    const phone = $('#customer-phone').val().trim();
    fetchCustomerData(phone);
  }

  function handleReferrerPhoneInput() {
    const phone = $('#referrer-phone').val().trim();
    fetchReferrerData(phone);
  }

  function addItemRow(index) {
    currentRow++;
    const newRow = $(`
      <tr>
        <td class="border px-2 py-1 md:px-4 md:py-2 serial-number">${currentRow}</td>
        <td class="border px-2 py-1 md:px-4 md:py-2"><input type="text" class="w-full p-2 border rounded item-name" required></td>
        <td class="border px-2 py-1 md:px-4 md:py-2"><input type="number" class="w-full p-2 border rounded item-price" required></td>
        <td class="border px-2 py-1 md:px-4 md:py-2"><input type="number" class="w-full p-2 border rounded item-qty" value="1" required></td>
        <td class="border px-2 py-1 md:px-4 md:py-2"><input type="number" class="w-full p-2 border rounded cpp-input" required></td>
        <td class="border px-2 py-1 md:px-4 md:py-2"><input type="number" class="w-full p-2 border rounded ppp-input" readonly></td>
        <td class="border px-2 py-1 md:px-4 md:py-2"><input type="number" class="w-full p-2 border rounded total-input" readonly></td>
        <td class="border px-2 py-1 md:px-4 md:py-2 action-cell">
          <button type="button" class="add-item px-2 py-1 md:px-4 md:py-2 bg-blue-500 text-white rounded">+</button>
        </td>
      </tr>
    `);

    if (index === undefined || index === $('#pos-items tr').length - 1) {
      $('#pos-items').append(newRow);
    } else {
      $('#pos-items tr').eq(index).after(newRow);
    }
    updateTableCounts();

    // Add event listeners to new inputs
    newRow.find('.item-price, .item-qty, .cpp-input').on('input', function () {
      const row = $(this).closest('tr');
      const price = parseFloat(row.find('.item-price').val()) || 0;
      const qty = parseFloat(row.find('.item-qty').val()) || 1;
      const cpp = parseFloat(row.find('.cpp-input').val()) || 0;
      const ppp = price - cpp;
      const total = price * qty;
      row.find('.total-input').val(total.toFixed(2));
      row.find('.ppp-input').val(ppp.toFixed(2));
      calculateTotals();
    });

    newRow.find('.item-qty').on('input', updateTableCounts);

    newRow.find('.add-item').on('click', function () {
      addItemRow($(this).closest('tr').index());
      updateButtons();
    });

    newRow.find('.remove-item').on('click', function () {
      $(this).closest('tr').remove();
      updateTableCounts();
      updateSerialNumbers();
      updateButtons();
    });

    updateSerialNumbers();
    updateButtons();
  }

  function updateSerialNumbers() {
    let index = 1;
    $('#pos-items tr').each(function () {
      $(this).find('.serial-number').text(index++);
    });
  }

  function updateButtons() {
    $('#pos-items tr').each(function (index) {
      const actionCell = $(this).find('.action-cell');
      if (index === 0) {
        actionCell.html('<button type="button" class="add-item px-2 py-1 md:px-4 md:py-2 bg-blue-500 text-white rounded">+</button>');
        actionCell.find('.add-item').on('click', function () {
          addItemRow(index);
          updateButtons();
        });
      } else {
        actionCell.html('<button type="button" class="remove-item px-2 py-1 md:px-4 md:py-2 bg-red-500 text-white rounded">-</button>');
        actionCell.find('.remove-item').on('click', function () {
          $(this).closest('tr').remove();
          updateTableCounts();
          updateSerialNumbers();
          updateButtons();
        });
      }
    });
  }

  function handleSubmitSale(event) {
    event.preventDefault();

    // Validate form inputs
    if ($('#customer-phone').val().trim() === '' || $('#customer-name').val().trim() === '') {
      showToast('Customer information is required.');
      return;
    }

    if ($('#referrer-phone').val().trim() === '' || $('#referrer-name').val().trim() === '') {
      showToast('Referrer information is required.');
      return;
    }

    let valid = true;
    $('#pos-items tr').each(function () {
      if (!$(this).find('.item-name').val().trim() || !$(this).find('.item-price').val().trim() || !$(this).find('.cpp-input').val().trim()) {
        valid = false;
      }
    });

    if (!valid) {
      showToast('Please fill in all product fields.');
      return;
    }

    const customerPhone = $('#customer-phone').val().trim();
    const customerName = $('#customer-name').val().trim();
    const referrerPhone = $('#referrer-phone').val().trim();
    const referrerName = $('#referrer-name').val().trim();
    const items = [];
    $('#pos-items tr').each(function () {
      const itemName = $(this).find('.item-name').val().trim();
      const itemPrice = parseFloat($(this).find('.item-price').val()) || 0;
      const itemQty = parseFloat($(this).find('.item-qty').val()) || 1;
      const cpp = parseFloat($(this).find('.cpp-input').val()) || 0;
      const ppp = parseFloat($(this).find('.ppp-input').val()) || 0;
      const total = parseFloat($(this).find('.total-input').val()) || 0;
      items.push({ itemName, itemPrice, itemQty, cpp, ppp, total });
    });
    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
    const totalProfit = items.reduce((sum, item) => sum + (item.itemPrice - item.cpp) * item.itemQty, 0);
    const sale = { customerPhone, customerName, referrerPhone, referrerName, items, totalPrice, totalProfit, date: new Date().toISOString() };
    salesHistory.push(sale);
    updateLocalStorage();
    $('#pos-items').empty();
    updateTableCounts();
    showToast('Sale submitted successfully.');
    location.reload();
  }

  function showToast(message) {
    const toast = $('<div class="toast">' + message + '</div>');
    $('body').append(toast);
    setTimeout(() => toast.fadeOut(500, () => toast.remove()), 3000);
  }

  // Event listeners
  $('#customer-phone').on('input', handleCustomerPhoneInput);
  $('#referrer-phone').on('input', handleReferrerPhoneInput);
  $('#pos-form').on('submit', handleSubmitSale);
  $('#clear-data').on('click', () => {
    if (confirm('Are you sure you want to clear all data?')) {
      fetch('/clear-data', {
        method: 'POST'
      }).then(response => {
        if (response.ok) {
          localStorage.clear();
          location.reload();
        } else {
          alert('Failed to clear data.');
        }
      });
    }
  });

  // Add initial row when page loads
  addItemRow();

  // Key event listeners
  $(document).on('keydown', function (e) {
    const isDeleteKey = e.key === 'Delete';
    const isCtrlEnter = (e.ctrlKey || e.metaKey) && e.key === 'Enter';

    if (isDeleteKey) {
      const focusedElement = $(':focus');
      if (focusedElement.closest('tr').length) {
        focusedElement.closest('tr').remove();
        updateTableCounts();
        updateSerialNumbers();
        updateButtons();
      }
    }

    if (isCtrlEnter) {
      addItemRow();
      updateButtons();
    }
  });
});
