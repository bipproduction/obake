const text = encodeURIComponent("Hello World!");
const phone = encodeURIComponent("6289697338821");
fetch(`https://wa.wibudev.com/code?text=${text}&nom=${phone}`)
  .then((response) => response.text())
  .then((text) => console.log(text));
