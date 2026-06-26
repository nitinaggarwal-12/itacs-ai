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
* **Visual Gallery Review**: Offer a walkthrough of captured screenshots and code changes during the validation step so the user can visually confirm design integrity before moving forward.

