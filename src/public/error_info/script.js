function copyErrorMessage(button) {
  const errorText = button.dataset.errorText;
  
  navigator.clipboard.writeText(errorText)
    .then(() => {
      button.classList.add('copied');
      setTimeout(() => button.classList.remove('copied'), 2000);
    })
    .catch(() => {
      button.classList.add('copied');
      setTimeout(() => button.classList.remove('copied'), 2000);
    });
}
