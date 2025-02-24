import { file } from "bun";
import { resolve } from "path";
const root = process.cwd();
const filePath = resolve(root, "struktur.txt");

(async () => {
  const envText = await file(filePath).text();
  const text = encodeURIComponent(envText);
  const phone = encodeURIComponent("6289697338821");
  fetch(`https://wa.wibudev.com/code?text=${text}&nom=${phone}`)
    .then((response) => response.text())
    .then((text) => console.log(text));
})();
