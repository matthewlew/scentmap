const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:8000/index.html');
  // Add some test logic here or we can just verify visually using screenshot tools later
  console.log("Started test server");
  await browser.close();
})();
