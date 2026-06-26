# 🤖 Agent Rules: ITACS Workspace

## 🚨 CRITICAL RULE: Independent Deployment Verification

### 1. The Constraint
You must **never** declare a frontend or backend deployment successful, "complete", or "live" based solely on:
* CLI pipeline exit codes (`railway up` reporting success).
* Dashboard status indicators (showing a green `Online` bubble).
* Build log compilation completions.

### 2. The Verification Protocol
Before wrapping up your turn or notifying the user that a change is live, you **MUST** perform an independent, direct verification of the served assets:
* **For Frontend SPAs**:
  1. Perform an HTTP request (e.g. via `curl` or URL fetch tools) to the public or local URL.
  2. Search the returned HTML or compiled JS asset for a **unique string literal** that only exists in the newly added code changes (a new label, a new tab name, or a new function identifier).
  3. Verify that the server is physically delivering the new content, not a cached CDN asset or a rolled-back container image.
* **For Backend APIs**:
  1. Perform an HTTP request to the target API endpoint.
  2. Verify that the response payload matches the new schema or database outputs exactly.

### 3. Rationale
This prevents false-positives caused by silent cloud rollbacks, Docker build caching anomalies, CDN edge caching, and browser bundle caching, ensuring 100% accuracy and respecting the user's time.

## 🎨 RULE: UI Robustness & Onboarding Tour Design

### 1. Viewport & Layout Integrity
* **Fixed Viewport Layout**: The main application layout (`.matrix-layout`) must always have a fixed viewport height (`height: calc(100vh - 80px)`) and `overflow: hidden`. The search toolbar and sidebar must remain fixed, and only individual panels (like `.matrix-grid` and the details drawer) are scrollable. This prevents the entire page from scrolling and causing layout clipping.
* **Drawer-Relative Tooltip Positioning**: For onboarding tours, any step targeting elements inside a slide-out drawer (like `card-details-panel`, `detail-tab-wargaming-btn`, `run-challenger-btn`, `wargame-results-hud`, `approve-to-memory-btn`) **MUST** position the popover card to the **left side of the drawer** (using `left: highlightStyle.left - 320 - 16` and a fixed offset `top: highlightStyle.top + 100`). Never position tooltips below drawer elements, as their extreme height will push the tooltip off-screen.

### 2. Immersive Onboarding & State-Aware Locks
* **State-Aware Locks on Actions**: Tour steps must require the user to perform the actual UI actions to proceed (e.g. selecting a card, running a wargame, clicking "Approve to Memory"). 
* **Clean Default Button Labels**: Do **never** hardcode lock icons (`🔒`) in the default `buttonText` array of tour steps. Instead, keep default buttons clean (e.g., `Review Consensus ➔` or `Complete Mission ➔`), and only inject the lock icon `🔒` dynamically in the button text logic when the lock is active. This ensures the button instantly updates to a clean, inviting state the second the user satisfies the condition.
* **Escape Hatches**: Every tour or modal must have two bulletproof escape hatches:
  1. A global keydown listener that closes the tour/modal instantly when the **`Escape` key** is pressed.
  2. A clickable backdrop/mask (for centered steps) that closes the tour when clicked.

## 🛡️ RULE: Validation-First & Quality Gate Protocol

### 1. The Constraint
You must **always** pause and present a comprehensive validation/review step (including E2E test script walkthroughs, visual screenshots, and database schema audits) to the user before moving on to the next mission, feature, or implementation phase. 

### 2. The Protocol
* **No Auto-Advancing**: Never automatically start writing code or executing tasks for the next phase without explicit, manual user approval of the current phase.
* **Seed Verification**: When writing E2E tests, always verify state pre-seeding (like localStorage or database values) to ensure tests can run independently and reliably in clean browser sessions.
* **Seed & Asset Integrity Auditing**: When implementing mock datasets, sample slide briefs, or onboarding templates, you **must** write a programmatic validation script (e.g. `scratch/validate_seeds.py`) to verify that the file contents match their strategic purposes and do not contain crossed or desynchronized text.
* **Visual Gallery Review**: Offer a walkthrough of captured screenshots and code changes during the validation step so the user can visually confirm design integrity before moving forward.
* **Visual Gallery Housekeeping & Stale File Prevention**: When writing or refactoring E2E screenshot automation suites, you **must** programmatically purge the target screenshot directory (e.g., `rm -f scratch/screenshots_mX/*.png` or equivalent directory cleaning) *before* executing the new test run. This guarantees that any orphaned, misaligned, or obsolete screenshots from previous failed or aborted runs are completely wiped, preventing stale files from lingering in the workspace or cluttering the visual validation gallery.

## 🧪 RULE: E2E Testing Synchronization & Animation Settling

### 1. The Constraint
When writing automated E2E test scripts (using Puppeteer, Playwright, or Selenium) inside the ITACS workspace, you **must never** execute a screenshot capture or a downstream click immediately after triggering a UI state transition (such as tab switching, next button clicks, drawer openings, or modal closures). Doing so causes visual race conditions, capturing the UI in a stale, half-rendered state due to React state scheduling and CSS transition timings.

### 2. The Protocol
* **Inject Mandatory Settling Delays**: Always inject a minimum **800ms synchronization delay** immediately after:
  1. Clicking `#tour-next-btn` or any tour navigation controllers.
  2. Switching active tabs (`setActiveTab`).
  3. Clicking elements that trigger drawer opening/closing animations.
* **Animation Cooldowns**: For heavy holographic animations (like the clinical scanner), always wait at least **4500ms** to allow the visual timeline to reach completion and display success badges before attempting to close the modal.
* **DOM-Level Clicks for Spots**: Always prefer direct DOM-level clicks (`page.$eval(selector, el => el.click())`) over physical mouse coordinate clicks for spotlighted elements and tour control buttons (like `#tour-next-btn`). Physical coordinate clicks are highly vulnerable to being intercepted by the wargaming spotlight mask overlay, causing lost inputs and desynchronized tour states.
* **Node-Level Sleep for Reloads**: When a tour action triggers a page reload (`window.location.reload()`) or navigation, never use `page.evaluate` to pause or sleep the script immediately after. The page reload will destroy the execution context, causing `page.evaluate` to crash. Instead, always use Node.js-level timeouts (`await new Promise(resolve => setTimeout(resolve, N))`) to allow the browser to reload in peace before taking screenshots or querying the DOM.

## 📐 RULE: High-Fidelity Diagram Ingestion & HTML Attribute Escaping

### 1. The Constraint
When embedding complex, nested XML strings (such as Draw.io diagram configurations) inside HTML data-attributes (such as `data-mxgraph`), you **must never** use simple string replacements or manual quote-only escapes. Doing so leaves raw XML tag brackets (`<` and `>`) inside the attribute, which tricks the browser's HTML parser into treating the XML as active DOM elements. This truncates the attribute value and results in a fatal `"Not a diagram file"` error on client-side rendering.

### 2. The Protocol
* **Strict HTML Escaping**: Always serialize the configuration dictionary containing the XML string into a JSON string first. Then, run a comprehensive HTML-escaping utility (like Python's `html.escape(json_str, quote=True)`) before writing the attribute to the template. This guarantees all brackets (`&lt;`, `&gt;`), quotes (`&quot;`), and ampersands (`&amp;`) are safely encoded.
* **Index-Based Query Selectors**: Always query diagram containers in associated Javascript controllers using index-based selectors (e.g., `document.querySelectorAll('.mxgraph')[index]`) rather than static DOM IDs. This prevents namespace conflicts and ID collisions with nested Draw.io iframe loaders.
* **Structural Diffing Verification**: Before declaring diagram modifications complete, you must run a structural XML validation script to verify that the parsed XML structure remains 100% identical to the working base template (excluding the translated cell text values).

## ☁️ RULE: Distributed Cloud Architecture & Persistent State Management (Anti-Filesystem Writes)

### 1. The Constraint
When designing features that involve saving, modifying, or persisting user-generated state (such as inline diagram edits, custom configurations, or uploaded metadata), you **must never** write to or modify files on the local container disk in production API endpoints. Doing so violates cloud-native principles because:
1. **Container Ephemerality**: Container filesystems are stateless and ephemeral; any local file writes will be permanently wiped on the next deploy, restart, or scale-down event.
2. **Container Isolation (No Shared Filesystems)**: In a multi-container architecture (e.g. separate frontend and backend services), the containers run on isolated filesystems. The backend cannot read or write to files served by the frontend container.

### 2. The Protocol (What to Do)
* **Persistent Database Storage**: Always store all user-generated, mutable state in a centralized, persistent database (like PostgreSQL) or shared object storage, rather than modifying static HTML or configuration files on disk.
* **Asynchronous Fetching & Deferred Rendering**: 
  1. The static frontend files must load first, deferring third-party widget rendering by using custom class names (e.g. `mxgraph-deferred` instead of `mxgraph`).
  2. Perform parallel asynchronous fetch requests to the backend API to retrieve the latest state from the database.
  3. Update the DOM elements dynamically with the fetched state, swap the class names to the active state, and trigger the widget's rendering script manually (e.g. `window.GraphViewer.processElements()`).
* **Container-Bundled Seeding**: For baseline data (like default diagram layouts or templates), bundle the raw assets inside the backend container's directory (e.g. `/backend`) so they are distributed. On backend startup, read these local baselines to seed the database if it is empty, providing a self-healing fallback if database rows are missing.
* **Defensive Fallbacks**: Always write defensive try-catch fallbacks in the frontend fetch lifecycle. If the database is empty or the backend is offline, the page must gracefully fall back to the hardcoded baseline template, ensuring the UI never breaks or stays blank.

---

## 🧪 RULE: E2E Testing Synchronization & Headless Puppeteer Fallbacks (Best Practices)

### 1. The Constraint
When conducting E2E interface validations, visual audits, or user journey stress-tests, you **must never** rely solely on pre-packaged sandbox visual tools. If the sandbox browser context fails to connect or launch, you **must immediately** write a custom, headless Puppeteer script and execute it locally via the command shell.

### 2. What NOT to Do (Anti-Patterns)
* **Siloed Selector Guessing**: Never guess CSS classes, IDs, or element tags when writing automation scripts (e.g. assuming a `.sidebar-menu` or `<a>` link exists). Guessing leads to immediate script timeouts.
* **Double-Render Race Conditions**: Never set screenshot or click delays that are shorter than the cumulative interval times of the React state machine (e.g. if step animations trigger every 2000ms, waiting 5500ms for step 3 is a race condition; you must wait at least 7000ms).
* **Abandoning on Tool Failures**: Never treat a sandbox tool crash as a complete task blocker. If the browser subagent fails, you have full Node/Python execution capabilities to run headless automation.

### 3. What to Do (Best Practices & Protocol)
* **Active-Code Selector Extraction**: Before writing any Puppeteer or Playwright script, **always** perform a grep search on the active codebase (e.g. `App.jsx`, `index.css`) to extract the exact DOM structure, class names (e.g. `aside.sidebar-navigation`), and element types (e.g. `button.sidebar-nav-btn`).
* **Headless Puppeteer Fallbacks**: Always write clean, self-contained Node.js scripts using `puppeteer-core` and launch them using the verified local browser binary:
  ```javascript
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  ```
* **Clean Visual Gallery Housekeeping**: Programmatically purge the target screenshot folder (`fs.unlinkSync`) *before* executing the Puppeteer run to prevent stale, misaligned, or orphaned screenshots from cluttering the workspace.
* **GOLT & Multi-State Verification**: Always simulate human-in-the-loop consensus actions (like clicking voting options or drag-and-dropping cards) and capture the resulting state transitions.



