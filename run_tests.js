const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/home/jules/.cache/puppeteer/chrome/linux-146.0.7680.66/chrome-linux64/chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => {
      console.log(msg.text());
    });

    await page.goto('http://localhost:8000/tests.html');

    // Wait for tests to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    const result = await page.evaluate(() => {
      return document.querySelector('#s-fail')?.innerText || '0';
    });

    console.log("Failed tests count:", result);

    if (parseInt(result) > 0) {
      console.error('Tests failed!');
      process.exit(1);
    } else {
      console.log('All tests passed!');
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
