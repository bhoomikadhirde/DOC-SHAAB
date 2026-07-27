const { chromium } = require('playwright');

(async () => {
  console.log('Starting playwright...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`BROWSER ERROR: ${err.message}`);
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('Page loaded successfully. Done.');
  } catch (err) {
    console.error('Failed to load page:', err.message);
  } finally {
    await browser.close();
  }
})();
