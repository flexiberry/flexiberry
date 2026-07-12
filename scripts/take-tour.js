#!/usr/bin/env node

/**
 * FlexiBerry Tour Automation Script
 * This script automates a tour of the FlexiBerry application at app.flexiberry.dev.
 * It runs in non-headless mode with slow-motion typing and visual banners, making
 * it perfect for screen recording.
 * 
 * Usage:
 *   pnpm --filter @flexiberry/app exec node scripts/take-tour.js
 *   OR
 *   node scripts/take-tour.js (if playwright is installed globally/root)
 */

const path = require('path');

// ─── Constants ───────────────────────────────────────────────────────────
const TARGET_URL = 'https://app.flexiberry.dev';
const SLOW_MO = 80; // ms delay between actions
const STEP_PAUSE = 2500; // ms to pause after each major step
const SHOW_VISUAL_TIPS = true; // Inject a floating visual helper banner on the page

// ─── Playwright Import Resolver ──────────────────────────────────────────
let playwright;
try {
  // Resolve relative to the apps/app workspace where @playwright/test is installed
  playwright = require(path.resolve(__dirname, '../apps/app/node_modules/playwright'));
} catch (e) {
  try {
    playwright = require('playwright');
  } catch (err) {
    console.error('\x1b[31mError: Playwright dependency not found.\x1b[0m');
    console.error('Please run the script using the pnpm command to resolve monorepo packages:');
    console.error('\x1b[36mpnpm --filter @flexiberry/app exec node scripts/take-tour.js\x1b[0m\n');
    process.exit(1);
  }
}

const { chromium } = playwright;

// ─── Sample .berry DSL Workflow ─────────────────────────────────────────
const BERRY_DSL = `Api POST #addPet
Url https://petstore.swagger.io/v2/pet
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON \`
{
  "id": 105,
  "name": "doggie",
  "status": "available"
}
\`

Api GET #getPetById
Url https://petstore.swagger.io/v2/pet/{{petId}}
Header
- Accept: 'application/json'

Task petstore
Step Call Api addPet
    Capture
        - id: response.id
    Check
        - $.status == 200
        - id != null

Step Call Api getPetById
    Params
        - petId: Step.1.id
    Check
        - $.status == 200
        - $.body.id == Step.1.id`;

// ─── Main Execution ──────────────────────────────────────────────────────
(async () => {
  console.log('\n🚀 Starting FlexiBerry Tour Automation...');
  console.log(`🌍 Target App: ${TARGET_URL}`);
  console.log('🎥 Set your recorder window to capture the browser viewport (1280x720).\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: SLOW_MO,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.25 // Makes elements and text slightly larger and clearer on video
  });

  const page = await context.newPage();

  // Helper to show floating status banner on page
  async function updateBanner(message) {
    console.log(`[Tour Step] ${message}`);
    if (!SHOW_VISUAL_TIPS) return;
    await page.evaluate((text) => {
      let banner = document.getElementById('tour-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'tour-banner';
        banner.style.position = 'fixed';
        banner.style.top = '24px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%) translateY(-20px)';
        banner.style.zIndex = '999999';
        banner.style.padding = '12px 24px';
        banner.style.borderRadius = '32px';
        banner.style.background = 'rgba(15, 23, 42, 0.85)'; // Slate 900
        banner.style.backdropFilter = 'blur(16px)';
        banner.style.border = '1px solid rgba(139, 92, 246, 0.4)'; // Violet border
        banner.style.color = '#ffffff';
        banner.style.fontFamily = 'Inter, system-ui, sans-serif';
        banner.style.fontSize = '14px';
        banner.style.fontWeight = '600';
        banner.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.4), 0 0 15px rgba(139, 92, 246, 0.25)';
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.gap = '10px';
        banner.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        banner.style.opacity = '0';
        banner.style.pointerEvents = 'none';

        // Pulse dot
        const dot = document.createElement('span');
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.borderRadius = '50%';
        dot.style.background = '#8b5cf6'; // Violet 500
        dot.style.boxShadow = '0 0 8px #8b5cf6';
        dot.style.display = 'inline-block';
        dot.className = 'pulse';

        // Add CSS keyframe for pulse
        const styleSheet = document.createElement('style');
        styleSheet.innerText = `
          @keyframes tourPulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }
          .pulse { animation: tourPulse 2s infinite ease-in-out; }
        `;
        document.head.appendChild(styleSheet);

        const txt = document.createElement('span');
        txt.id = 'tour-banner-text';

        banner.appendChild(dot);
        banner.appendChild(txt);
        document.body.appendChild(banner);
      }

      const textEl = document.getElementById('tour-banner-text');
      textEl.innerText = text;
      
      // Animate entry
      banner.style.transform = 'translateX(-50%) translateY(0)';
      banner.style.opacity = '1';
    }, message);
  }

  async function removeBanner() {
    if (!SHOW_VISUAL_TIPS) return;
    await page.evaluate(() => {
      const banner = document.getElementById('tour-banner');
      if (banner) {
        banner.style.transform = 'translateX(-50%) translateY(-20px)';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 400);
      }
    });
  }

  try {
    // 1. Visit App Homepage (with dev bypass)
    await updateBanner('Welcome to FlexiBerry — The Developer-First HTTP Client');
    await page.goto(`${TARGET_URL}?bypass=true`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Bypassing AuthOverlay by continuing as Guest if prompt is present
    const guestBtn = page.locator('button:has-text("Continue as Guest")');
    if (await guestBtn.count() > 0) {
      await updateBanner('Signing in as a guest user...');
      await guestBtn.click();
      await page.waitForTimeout(STEP_PAUSE);
    }

    // 2. Click Create New File
    await updateBanner('Step 1: Create a new .berry sequence file');
    const newFileBtn = page.locator('button:has-text("New File")');
    await newFileBtn.scrollIntoViewIfNeeded();
    await newFileBtn.click();
    await page.waitForTimeout(800);

    // 3. Rename File
    await updateBanner('Naming our workspace file: petstore.berry');
    const renameInput = page.locator('input.h-6');
    await renameInput.waitFor({ state: 'visible' });
    await renameInput.focus();
    
    // Select default text and replace it
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('petstore.berry', { delay: 60 });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(STEP_PAUSE);

    // 4. Open File
    await updateBanner('Step 2: Open our file to edit');
    const fileRow = page.locator('span:has-text("petstore.berry")').first();
    await fileRow.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 5. Toggle to Raw View
    await updateBanner('Toggle to Raw Text view to write the API chain');
    const rawBtn = page.locator('button[title="Raw Text View"]');
    await rawBtn.waitFor({ state: 'visible' });
    await rawBtn.click();
    await page.waitForTimeout(1000);

    // 6. Enter .berry DSL Code
    await updateBanner('Writing declarative DSL to link POST & GET requests');
    const editor = page.locator('.cm-content');
    await editor.waitFor({ state: 'visible' });
    await editor.focus();
    
    // Clear and enter comment slowly
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('# Creating a sequential Petstore API flow...', { delay: 60 });
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    
    // Paste the full code
    await page.keyboard.insertText(BERRY_DSL);
    await page.waitForTimeout(STEP_PAUSE);

    // 7. Toggle back to Notebook Blocks View
    await updateBanner('Toggle back to Blocks to view our visual notebook');
    const blocksBtn = page.locator('button[title="Notebook View"]');
    await blocksBtn.click();
    await page.waitForTimeout(STEP_PAUSE);

    // 8. Save File
    await updateBanner('Save the changes to persist our sequence');
    const saveBtn = page.locator('button[title="Save (⌘S)"]');
    await saveBtn.click();
    await page.waitForTimeout(1500);

    // 9. Run File (Triggers countdown)
    await updateBanner('Step 3: Execute the API workflow in real-time!');
    const runBtn = page.locator('button[title="Run Notebook File"]');
    await runBtn.click();
    
    // Wait for the 3-second countdown + run time
    await page.waitForTimeout(4000);

    // 10. Wait for Execution to complete
    await updateBanner('Piping outputs and asserting conditions live...');
    const completedBadge = page.locator('text=completed').first();
    await completedBadge.waitFor({ state: 'visible', timeout: 12000 });
    await page.waitForTimeout(STEP_PAUSE);

    // 11. Toggle AI Copilot Panel
    await updateBanner('Step 4: Prompt the built-in AI Copilot');
    const sparklesBtn = page.locator('button[title="Toggle AI Copilot"]');
    await sparklesBtn.click();
    await page.waitForTimeout(1000);

    // 12. Interact with AI Chat Input
    await updateBanner('Instructing assistant to generate new templates...');
    const chatInput = page.locator('input[placeholder="Describe changes or paste cURL..."]');
    await chatInput.waitFor({ state: 'visible' });
    await chatInput.focus();
    await chatInput.type('Add API block', { delay: 60 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Wait to view final state
    await updateBanner('FlexiBerry: declarative, chainable API testing.');
    await page.waitForTimeout(5000);

    await removeBanner();
    console.log('\n🎉 Tour automation completed successfully!');

  } catch (error) {
    console.error('\n❌ An error occurred during the tour:');
    console.error(error);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
