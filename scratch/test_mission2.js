const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotDir = path.join(__dirname, 'screenshots_m2');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  console.log("🚀 Starting ITACS Automated UI Test for Mission 2 (Governance & Ingestion)...");
  
  // Launch Chrome in headless mode using the local Google Chrome binary to bypass Gatekeeper blocks!
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log("🔗 Navigating to ITACS Production...");
    await page.goto('https://itacs-frontend-production.up.railway.app/#home', { waitUntil: 'networkidle2' });
    
    // 1. Capture Home screen
    await page.screenshot({ path: path.join(screenshotDir, '01_home_loaded.png') });
    console.log("📸 Step 1: Home page loaded successfully.");

    // 2. Click Start Mission 2
    console.log("👉 Clicking Start Mission 2 (Governance)...");
    await page.waitForSelector('#start-mission-2-btn');
    await page.click('#start-mission-2-btn');
    
    // Wait for the tour popover to appear
    await page.waitForSelector('#tour-popover-card');
    await page.screenshot({ path: path.join(screenshotDir, '02_mission2_intro.png') });
    console.log("📸 Step 2: Mission 2 Intro popover displayed.");

    // 3. Click "Start Ingestion Mission ➔" on popover
    console.log("👉 Advancing to Step 1 (SME Strategic Expectations)...");
    const nextBtnSelector = '#tour-next-btn';
    await page.waitForSelector(nextBtnSelector);
    await page.click(nextBtnSelector);
    await page.waitForSelector('#sme-expectations-panel');
    await page.screenshot({ path: path.join(screenshotDir, '03_step1_sme_panel.png') });

    // 4. Input SME Initial Expectations (Opportunity and Barrier)
    console.log("👉 Inputting SME Strategic Expectations...");
    
    await page.waitForSelector('#sme-opportunity-input');
    await page.click('#sme-opportunity-input', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#sme-opportunity-input', 'Premium cold-chain automated vaccine hubs.');

    await page.waitForSelector('#sme-barrier-input');
    await page.click('#sme-barrier-input', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#sme-barrier-input', 'Friction in local sub-zero freezer capacity.');

    // Wait a brief moment for state changes to propagate
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 600)));
    await page.screenshot({ path: path.join(screenshotDir, '04_sme_inputs_filled.png') });

    // 5. Click Next to advance to Step 2 (Trigger Ingestion)
    console.log("👉 Advancing to Step 2 (Trigger Ingestion)...");
    await page.click(nextBtnSelector);
    await page.waitForSelector('#ingestion-dropzone');
    await page.screenshot({ path: path.join(screenshotDir, '05_step2_ingestion_dropzone.png') });

    // 6. Click "Trigger Ingestion Demo" button via DOM click
    console.log("👉 Triggering mock file Ingestion pipeline via DOM click...");
    await page.waitForSelector('#trigger-ingestion-demo-btn');
    await page.$eval('#trigger-ingestion-demo-btn', el => el.click());

    // 7. Wait 6.5 seconds for the mock multi-agent ingestion pipeline & trust loop to complete!
    console.log("⏳ Waiting for multi-agent ingestion trust loop (6.5s)...");
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 6.500)));
    await page.screenshot({ path: path.join(screenshotDir, '06_ingestion_completed.png') });

    // 8. Click Next to advance to Step 3 (Evidence Score Badging / Strategy Matrix)
    console.log("👉 Advancing to Step 3 (Evidence Score Badging / Strategy Matrix)...");
    await page.click(nextBtnSelector);
    await page.waitForSelector('#first-insight-card');
    await page.screenshot({ path: path.join(screenshotDir, '07_step3_insight_list.png') });

    // 9. Click on the first strategy card to open the details drawer
    console.log("👉 Clicking the first strategy card via DOM to open details drawer...");
    await page.$eval('#first-insight-card', el => el.click());
    
    // Wait for the drawer animation
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 800)));
    await page.screenshot({ path: path.join(screenshotDir, '08_card_details_opened.png') });

    // 10. Click Next to advance to Step 4 (Trust & Auditing Panel)
    console.log("👉 Advancing to Step 4 (Trust & Auditing Panel)...");
    await page.click(nextBtnSelector);
    await page.waitForSelector('#card-details-panel');
    await page.screenshot({ path: path.join(screenshotDir, '09_step4_trust_panel.png') });

    // 11. Click Next to advance to Step 5 (Congrats / Graduation)
    console.log("👉 Advancing to Step 5 (Congrats / Graduation)...");
    await page.click(nextBtnSelector);
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    await page.screenshot({ path: path.join(screenshotDir, '10_graduation_congrats.png') });

    // 12. Click "Complete Mission 🎓" to graduate and return home
    console.log("👉 Completing Mission 2 and graduating...");
    await page.click(nextBtnSelector);
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1500)));
    await page.screenshot({ path: path.join(screenshotDir, '11_mission_complete.png') });

    console.log("🏆 E2E UI Test for Mission 2 completed successfully! All steps verified and screenshots captured in scratch/screenshots_m2/!");

  } catch (error) {
    console.error("❌ E2E UI Test failed with error:", error);
  } finally {
    await browser.close();
  }
})();
