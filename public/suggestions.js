document.addEventListener('DOMContentLoaded', () => {
  const customerPhoneInput = document.getElementById('customer-phone');
  const refererPhoneInput = document.getElementById('referer-phone');
  const itemNameInputs = document.querySelectorAll('.item-name');

  if (customerPhoneInput) {
    customerPhoneInput.addEventListener('input', () => showSuggestions(customerPhoneInput, 'customers'));
  }

  if (refererPhoneInput) {
    refererPhoneInput.addEventListener('input', () => showSuggestions(refererPhoneInput, 'referers'));
  }

  itemNameInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', () => showSuggestions(input, 'items'));
    }
  });

  function showSuggestions(input, type) {
    const value = input.value.toLowerCase();
    const suggestionsDropdown = createSuggestionsDropdown(input);
    suggestionsDropdown.innerHTML = '';

    let suggestions = [];
    if (type === 'customers' || type === 'referers') {
      const data = JSON.parse(localStorage.getItem(type)) || [];
      suggestions = data.filter(item => item.phone.toLowerCase().includes(value));
    } else if (type === 'items') {
      const items = JSON.parse(localStorage.getItem('items')) || [];
      suggestions = items.filter(item => item.name.toLowerCase().includes(value));
    }

    suggestions.forEach(suggestion => {
      const li = document.createElement('li');
      if (type === 'customers' || type === 'referers') {
        li.textContent = `${suggestion.phone} (${suggestion.name})`;
        li.addEventListener('click', () => {
          input.value = suggestion.phone;
          if (type === 'customers') {
            const customerNameInput = document.getElementById('customer-name');
            if (customerNameInput) {
              customerNameInput.value = suggestion.name;
            }
          } else {
            const refererNameInput = document.getElementById('referer-name');
            if (refererNameInput) {
              refererNameInput.value = suggestion.name;
            }
          }
          suggestionsDropdown.remove();
        });
      } else if (type === 'items') {
        li.textContent = `${suggestion.name} ($${suggestion.price})`;
        li.addEventListener('click', () => {
          input.value = suggestion.name;
          const row = input.closest('tr');
          const itemPriceInput = row.querySelector('.item-price');
          if (itemPriceInput) {
            itemPriceInput.value = suggestion.price;
          }
          suggestionsDropdown.remove();
        });
      }
      suggestionsDropdown.appendChild(li);
    });
  }

  function createSuggestionsDropdown(input) {
    let suggestionsDropdown = input.nextElementSibling;
    if (suggestionsDropdown && suggestionsDropdown.classList.contains('suggestions-dropdown')) {
      suggestionsDropdown.remove();
    }
    suggestionsDropdown = document.createElement('ul');
    suggestionsDropdown.className = 'suggestions-dropdown';
    input.parentNode.appendChild(suggestionsDropdown);
    return suggestionsDropdown;
  }
});
