document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active-tab'));
      button.classList.add('active-tab');

      const tab = button.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.add('hidden');
        if (content.id === `${tab}-tab`) {
          content.classList.remove('hidden');
        }
      });
    });
  });
});
