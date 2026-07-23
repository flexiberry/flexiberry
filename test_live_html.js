import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating...');
  try {
    const res = await page.goto('https://app.flexiberry.dev/default/petstore.berry');
    console.log(`Status: ${res?.status()}`);
    console.log(`Final URL: ${page.url()}`);
    
    const html = await page.content();
    console.log(`HTML Length: ${html.length}`);
    console.log(`HTML Content snippet:\n${html.substring(0, 1000)}`);
  } catch (err) {
    console.error(err);
  }
  await browser.close();
}

run();
