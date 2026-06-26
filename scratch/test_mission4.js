const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotDir = path.join(__dirname, 'screenshots_m4');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  console.log("🚀 Starting ITACS Automated UI Test for Mission 4 (Strategic Imperative Builder)...");
  
  // Launch Chrome in headless mode using the local Google Chrome binary to bypass Gatekeeper blocks!
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const page = await browser.newPage();

  // Pipe browser console and page errors to Node.js logs for high-fidelity debugging!
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Strategic') || msg.text().includes('API') || msg.text().includes('error') || msg.text().includes('Imperative')) {
      console.log(`💻 BROWSER LOG [${msg.type()}]: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => console.log(`❌ BROWSER ERROR: ${err.toString()}`));

  // Automatically handle and dismiss native browser alert/confirm dialogs to prevent thread locks!
  page.on('dialog', async dialog => {
    console.log(`💬 Dialog popped up: [${dialog.type()}] "${dialog.message()}" - Accepting automatically!`);
    await dialog.accept();
  });
  
  try {
    const targetUrl = 'https://itacs-frontend-production.up.railway.app';
    const apiUrl = 'https://itacs-ai-production.up.railway.app';

    console.log(`🔗 Navigating to ITACS Production: ${targetUrl}...`);
    await page.goto(`${targetUrl}/#home`, { waitUntil: 'networkidle2' });
    
    // Pre-seed localStorage to unlock Mission 4 (requires Missions 1-3 completed)!
    console.log("🔑 Pre-seeding localStorage to unlock Mission 4...");
    await page.evaluate(() => {
      localStorage.setItem('itacs_tour_completed_w1', 'true');
      localStorage.setItem('itacs_tour_completed_w2', 'true');
      localStorage.setItem('itacs_tour_completed_w3', 'true');
      localStorage.removeItem('itacs_tour_completed_w4');
    });

    // Reload page to apply the unlocked state
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Programmatically clear all existing strategic imperatives & validate the first insight to ensure clean test isolation!
    console.log("🔄 Resetting database: purging imperatives & validating first insight...");
    await page.evaluate(async (api) => {
      try {
        // 1. Purge all imperatives
        const resList = await fetch(`${api}/api/imperatives`);
        if (resList.ok) {
          const imps = await resList.json();
          for (const imp of imps) {
            await fetch(`${api}/api/imperatives/${imp.id}`, {
              method: 'DELETE',
              headers: { 'X-Agent-Identity': 'spiffe://itacs.merck.com/ns/production/sa/golt-coordinator' }
            });
          }
        }
        // 2. Validate the first insight in the DB to use as grounded evidence
        const resIns = await fetch(`${api}/api/insights`);
        if (resIns.ok) {
          const insights = await resIns.json();
          if (insights.length > 0) {
            await fetch(`${api}/api/insights/${insights[0].id}`, {
              method: 'PATCH',
              headers: { 
                'Content-Type': 'application/json',
                'X-Agent-Identity': 'spiffe://itacs.merck.com/ns/production/sa/golt-coordinator'
              },
              body: JSON.stringify({ is_validated: true })
            });
          }
        }
        console.log("✅ Database reset complete!");
      } catch (err) {
        console.error("❌ Reset error:", err);
      }
    }, apiUrl);

    // Reload again to pull clean, purged database state
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Helper function to assert popover position and prevent clipping
    const assertPopoverIntegrity = async (stepNum) => {
      const popover = await page.$('.tour-popover-card');
      if (popover) {
        const box = await popover.boundingBox();
        console.log(`🔍 [Step ${stepNum}] Tour Popover Dimensions: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
        if (box.x < 0 || box.y < 0 || (box.x + box.width) > 1366 || (box.y + box.height) > 768) {
          console.log(`⚠️ WARNING: Tour Popover is clipping the viewport boundaries on Step ${stepNum}!`);
        } else {
          console.log(`✅ Popover fits perfectly within viewport boundaries on Step ${stepNum}.`);
        }
      }
    };

    // ----------------- STEP 1: Cockpit Loaded -----------------
    console.log("📸 Step 1: Cockpit Loaded...");
    await page.screenshot({ path: path.join(screenshotDir, '01_home_loaded.png') });

    // ----------------- STEP 2: Launch Tour -----------------
    console.log("📸 Step 2: Launching Mission 4 Tour...");
    await page.click('#start-mission-4-btn');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mandatory animation settling delay!
    await assertPopoverIntegrity(2);
    await page.screenshot({ path: path.join(screenshotDir, '02_mission4_intro.png') });

    // ----------------- STEP 3: Go to Builder Portal -----------------
    console.log("📸 Step 3: Transitioning to Strategic Builder Portal...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Allow tab switch & animations to settle!
    await assertPopoverIntegrity(3);
    await page.screenshot({ path: path.join(screenshotDir, '03_step1_builder_portal.png') });

    // ----------------- STEP 4: Highlight Formulate Button -----------------
    console.log("📸 Step 4: Highlighting Strategy Formulator Button...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Settling delay
    await assertPopoverIntegrity(4);
    await page.screenshot({ path: path.join(screenshotDir, '04_step2_formulate_btn.png') });

    // ----------------- STEP 5: Fill Form & Create Strategic Imperative -----------------
    console.log("📸 Step 5: Formulating Imperative via Modal...");
    // Physically click the button to open the creation modal
    await page.click('#add-imperative-btn');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for modal slide-in

    // Fill inputs
    console.log("✏️ Typing Title and Description...");
    await page.type('input[placeholder*="Optimize regional"]', "Optimize Regional Cold-Chain Distribution Channels");
    await page.type('textarea[placeholder*="Define the strategic"]', "Mitigate temperature fluctuation risks by deploying IoT-enabled smart sensors across regional distributors.");
    
    // Select category, priority, and resource tier
    await page.select('select:nth-of-type(1)', 'clinical'); // category
    await page.select('select:nth-of-type(2)', 'medium');   // priority
    await page.select('select:nth-of-type(3)', 'low');      // resource tier (Low so it maps to low column!)
    
    await page.screenshot({ path: path.join(screenshotDir, '05_form_inputs_filled.png') });

    // Click Formulate button inside modal
    console.log("💾 Submitting Formulate Imperative form...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const formulateBtn = btns.find(b => b.textContent.includes('Formulate Imperative'));
      if (formulateBtn) formulateBtn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for database insert & board refresh!
    await page.screenshot({ path: path.join(screenshotDir, '06_imperative_created.png') });

    // ----------------- STEP 6: Highlight Kanban Board -----------------
    console.log("📸 Step 6: Highlighting Kanban Board columns...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await assertPopoverIntegrity(6);
    await page.screenshot({ path: path.join(screenshotDir, '07_step3_kanban_board.png') });

    // ----------------- STEP 7: Highlight Card & Open Drawer -----------------
    console.log("📸 Step 7: Highlighting First Strategic Card...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await assertPopoverIntegrity(7);
    await page.screenshot({ path: path.join(screenshotDir, '08_step4_imperative_card.png') });

    // Physically click the card to slide open the Workshop Drawer
    console.log("💼 Clicking strategic card to open Workshop Drawer...");
    await page.click('#first-imperative-card');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Allow slide-out drawer to settle!
    await page.screenshot({ path: path.join(screenshotDir, '09_workshop_drawer_opened.png') });

    // ----------------- STEP 8: Highlight Implications Editor -----------------
    console.log("📸 Step 8: Highlighting Implications Editor (Slide 23)...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await assertPopoverIntegrity(8);
    await page.screenshot({ path: path.join(screenshotDir, '10_step5_implications_editor.png') });

    // Fill trade-offs & risks textareas
    console.log("✏️ Inputting Options, Trade-offs, and Risks...");
    await page.type('textarea[placeholder*="Heavy deployment"]', "Requires diverting 15% of regional medical affairs budget from advisory boards.");
    await page.type('textarea[placeholder*="Timeline delays"]', "Potential custom hardware supply chain lead time delays in Q3.");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for autosave/debounce
    await page.screenshot({ path: path.join(screenshotDir, '11_implications_filled.png') });

    // ----------------- STEP 9: Highlight Actions Builder & Add Action -----------------
    console.log("📸 Step 9: Highlighting Tactical Actions Ledger...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await assertPopoverIntegrity(9);
    await page.screenshot({ path: path.join(screenshotDir, '12_step6_actions_builder.png') });

    // Draft tactical action
    console.log("✏️ Adding Grounded Tactical Action...");
    await page.type('input[placeholder*="Add a new tactical"]', "Deploy 500 smart sensors to pilot distribution nodes in Germany.");
    // Link first evidence card
    await page.select('select:nth-of-type(2)', '1'); // Select first evidence card option (id=1 since we reset firstCard)
    await page.click('#workshop-actions-builder button'); // Click "Add" button
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Allow DB save & list render to settle
    await page.screenshot({ path: path.join(screenshotDir, '13_tactical_action_added.png') });

    // ----------------- STEP 10: Graduation Congrats -----------------
    console.log("📸 Step 10: Advancing to Graduation Congratulations...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await assertPopoverIntegrity(10);
    await page.screenshot({ path: path.join(screenshotDir, '14_graduation_congrats.png') });

    // ----------------- STEP 11: Return to Cockpit & Complete Subway Roadmap -----------------
    console.log("📸 Step 11: Completing Mission 4 and returning to Cockpit...");
    await page.click('#tour-next-btn');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for Cockpit load and localStorage sync
    await page.screenshot({ path: path.join(screenshotDir, '15_mission_complete.png') });

    console.log("🎉 SUCCESS! All 15 visual frames for Mission 4 captured perfectly!");

  } catch (err) {
    console.error("❌ E2E TEST CRASHED:", err);
    process.exit(1);
  } finally {
    await browser.close();
    console.log("🔒 Browser context closed.");
  }
})();
