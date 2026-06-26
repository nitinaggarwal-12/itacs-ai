const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotDir = path.join(__dirname, 'screenshots_theater');
  
  // Clean up existing screenshots in the directory to prevent stale files
  if (fs.existsSync(screenshotDir)) {
    console.log("🧹 Purging old screenshots from directory...");
    const files = fs.readdirSync(screenshotDir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        fs.unlinkSync(path.join(screenshotDir, file));
      }
    }
  } else {
    fs.mkdirSync(screenshotDir);
  }

  console.log("🚀 Starting E2E Puppeteer Audit for the Simulation Theater...");
  
  // Launch Chrome using the verified local binary
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[Console][${msg.type()}] ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', err => {
    consoleLogs.push(`[Page Error] ${err.toString()}`);
  });

  try {
    console.log("🔗 Navigating to ITACS Production...");
    await page.goto('https://itacs-frontend-production.up.railway.app', { waitUntil: 'networkidle2' });
    
    // Wait for App sidebar navigation shell to load
    await page.waitForSelector('aside.sidebar-navigation');
    
    // Find the Simulation Theater tab button and click it
    console.log("👉 Switching to Simulation Theater tab...");
    const tabClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.sidebar-nav-btn'));
      const theaterBtn = buttons.find(el => el.innerText.includes("Simulation Theater"));
      if (theaterBtn) {
        theaterBtn.click();
        return true;
      }
      return false;
    });
    
    if (!tabClicked) {
      throw new Error("Could not find Simulation Theater button in sidebar!");
    }
    
    // Wait 1200ms for the tab transition to settle
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log("  Tab transition settled.");
    
    // Helper function to click a scene selector and execute it
    async function auditScene(sceneIndex, sceneId, sceneName) {
      console.log(`\n🎬 Auditing Scene ${sceneIndex}: ${sceneName}...`);
      
      // Click the scene selector in the left column
      await page.evaluate((idx) => {
        const selectors = document.querySelectorAll('.theater-container .glass-card:first-child > div:nth-child(2) > div');
        if (selectors[idx]) {
          selectors[idx].click();
        }
      }, sceneIndex);
      
      // Wait 800ms for transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Capture Idle State
      await page.screenshot({ path: path.join(screenshotDir, `${sceneIndex + 1}_${sceneId}_01_idle.png`) });
      console.log(`  📸 Screenshot: ${sceneIndex + 1}_${sceneId}_01_idle.png`);
      
      // Click the "Execute Showcase Simulation" button
      console.log(`  👉 Clicking Execute Showcase Simulation...`);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const execBtn = buttons.find(el => el.innerText.includes("Execute Showcase Simulation") || el.innerText.includes("Executing"));
        if (execBtn) execBtn.click();
      });
      
      // Wait 3500ms for the animation to be actively running
      await new Promise(resolve => setTimeout(resolve, 3500));
      await page.screenshot({ path: path.join(screenshotDir, `${sceneIndex + 1}_${sceneId}_02_active.png`) });
      console.log(`  📸 Screenshot: ${sceneIndex + 1}_${sceneId}_02_active.png`);
      
      // Wait another 7000ms for the animation steps to complete
      await new Promise(resolve => setTimeout(resolve, 7000));
      await page.screenshot({ path: path.join(screenshotDir, `${sceneIndex + 1}_${sceneId}_03_complete.png`) });
      console.log(`  📸 Screenshot: ${sceneIndex + 1}_${sceneId}_03_complete.png`);
    }

    // A. Audit Scene 1: PixelRAG
    await auditScene(0, 'pixelrag', 'PixelRAG X-Ray Ingestion');
    
    // B. Audit Scene 2: Compliance Guard
    await auditScene(1, 'compliance', 'Compliance Guard Intercept');
    
    // C. Audit Scene 3: Cross-Functional Collision & Voting
    console.log(`\n🎬 Auditing Scene 3: Cross-Functional Collision...`);
    await page.evaluate(() => {
      const selectors = document.querySelectorAll('.theater-container .glass-card:first-child > div:nth-child(2) > div');
      if (selectors[2]) selectors[2].click();
    });
    await new Promise(resolve => setTimeout(resolve, 800));
    await page.screenshot({ path: path.join(screenshotDir, `3_collision_01_idle.png`) });
    
    console.log(`  👉 Clicking Execute Showcase Simulation...`);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const execBtn = buttons.find(el => el.innerText.includes("Execute Showcase Simulation"));
      if (execBtn) execBtn.click();
    });
    
    // Wait 7500ms for the timeline collision warning and voting buttons to appear (allows 6-second interval to complete)
    await new Promise(resolve => setTimeout(resolve, 7500));
    await page.screenshot({ path: path.join(screenshotDir, `3_collision_02_active_voting.png`) });
    console.log(`  📸 Screenshot: 3_collision_02_active_voting.png`);
    
    // Click Option B voting button
    console.log(`  👉 Clicking GOLT Option B Vote...`);
    const voteClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const optBtn = buttons.find(el => el.innerText.includes("Option B: Accelerate Access"));
      if (optBtn) {
        optBtn.click();
        return true;
      }
      return false;
    });
    
    if (voteClicked) {
      // Wait 1500ms for vote to register and show resolution state
      await new Promise(resolve => setTimeout(resolve, 1500));
      await page.screenshot({ path: path.join(screenshotDir, `3_collision_03_resolved.png`) });
      console.log(`  📸 Screenshot: 3_collision_03_resolved.png`);
    } else {
      console.log("  ⚠️ Warning: Could not find Option B voting button on page!");
    }
    
    // D. Audit Scene 4: Deep Research
    await auditScene(3, 'research', 'Deep Research Outbreak');
    
    console.log("\n💾 Writing console log audit trail...");
    fs.writeFileSync(
      path.join(screenshotDir, 'browser_console_logs.txt'),
      consoleLogs.join('\n')
    );
    console.log("  🟢 Logs written to browser_console_logs.txt");
    
    console.log("\n🎉 AUDIT COMPLETED SUCCESSFULLY!");
    
  } catch (err) {
    console.error("❌ AUDIT FAILED:", err);
    await page.screenshot({ path: path.join(screenshotDir, 'fatal_error.png') });
    console.log("📸 Saved crash screenshot to fatal_error.png");
  } finally {
    await browser.close();
  }
})();
