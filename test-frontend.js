const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`BROWSER ERROR: ${err.message}`);
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully. Capturing screenshot...');
    await page.screenshot({ path: 'screenshot.png' });
    console.log('Done.');
  } catch (err) {
    console.error('Failed to load page:', err.message);
  } finally {
    await browser.close();
  }
})();
