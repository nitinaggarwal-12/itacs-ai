# ITACS Enterprise Insights Platform 🧬
### Oncology Commercialization Strategic Synthesis Engine • Merck ITACS & OKF v0.1 Standards

The **ITACS Enterprise Insights Platform** is a state-of-the-art, cross-functional strategic synthesis engine designed for oncology commercialization planning. Grounded in Google Cloud Vertex AI, Gemini 1.5 Pro, and Gemini 2.5 Flash, it orchestrates a multi-agent pipeline to ingest, audit, cluster, and query oncology commercialization intelligence.

---

## 🏗️ Core Architecture & Data Standards

### 1. Merck ITACS Data Hierarchy
The system strictly enforces the structural ITACS schema for every piece of intelligence. Flat summaries are rejected:
* **Opportunity Space**: A broad strategic domain where value is created (e.g., *Adjuvant Therapeutic Sequencing Optimization*).
* **Critical Success Factor (CSF)**: A focused outcome or capability that must be achieved.
* **What (Insight)**: Evidence-based observation, backed by verbatim quotes.
* **Why (Rationale)**: The business, clinical, or payer consequence of the insight.
* **Implication**: Practical, actionable consequences for planning and resource allocation.

### 2. OKF v0.1 Storage Standard
Knowledge assets are structured in the **Open Knowledge Format (OKF v0.1)**. They are stored as Markdown files with YAML frontmatter containing multi-dimensional metadata:
* **Function**: `[Market Research, Medical Affairs, Market Access, Competitive Intelligence]`
* **Asset**: `[e.g., V940, MK-1084]`
* **Tumor**: `[e.g., Lung, Melanoma]`
* **Sub-tumor / Indication**: `[e.g., Non-Small Cell, Stage III/IV]`

---

## 🤖 Multi-Agent Orchestration (Agent SKILLS Specification)

Decoupled agent behaviors are implemented in `backend/skills/` using the `agentskills.io` specification:

1. **Agent A: The Functional Extraction Copilot** (`extraction_skill.md`)
   * Uses Multimodal Vision-Language understanding (Gemini 2.5 Flash) to parse slide presentations and documents into coordinate-based tiles (PixelRAG), extracting exact quotes and spatial slide references (e.g., *slide 12, top-right callout*).
2. **Agent B: The Compliance Supervisor** (`compliance_skill.md`)
   * Acts as the "White Line" Gatekeeper. Intercepts Medical Affairs drafts to verify a strict clinical endpoint focus (e.g., DMFS/RFS) and audits against a forbidden commercial vocabulary list (e.g., *ROI, profit, revenue*) using keyword and semantic similarity checks. If the compliance score falls below 80%, the asset is quarantined.
3. **Agent C: The Cross-Functional Synthesizer** (`thematic_clustering_skill.md`)
   * Clusters localized functional insights into macro-level **Cross-Functional Strategic Themes**. Ranks themes using a quantitative scoring formula ($0.8$ to $18.5$) based on functional breadth and insight volume. Maps conflicts to a workshop debate queue.
4. **Agent D: The Automated Gap Detection Engine** (`gap_detection_skill.md`)
   * Monitors the database for stale insights (older than 90 days), running deep research via Model Context Protocol (MCP) to scrape clinical trial registries and competitor timelines, generating gap-fill hypotheses.
5. **Agent E: The Strategic Thought Partner** (`conversational_partner_skill.md`)
   * A conversational interface powered by Gemini 1.5 Pro, grounded via vector similarity search (pgvector) in validated memories, segmenting replies into Clinical, Payer, and Competitive perspectives.

---

## 📂 Project Structure

```bash
itacs-ai/
├── docker-compose.yml          # Services for PostgreSQL/pgvector, Backend, and Frontend
├── README.md                   # System documentation
├── database/
│   └── schema.sql              # Relational schemas, pgvector extensions, and HNSW indexes
├── backend/
│   ├── main.py                 # FastAPI backend & Multi-Agent routing controllers
│   ├── requirements.txt        # Python packages (google-genai, SQLAlchemy, numpy, etc.)
│   ├── Dockerfile              # Backend container configuration
│   └── skills/                 # Declarative Agent Skills (agentskills.io)
│       ├── extraction_skill.md
│       ├── compliance_skill.md
│       ├── thematic_clustering_skill.md
│       ├── gap_detection_skill.md
│       └── conversational_partner_skill.md
└── frontend/
    ├── package.json            # Node dependencies
    ├── vite.config.js          # Vite React configuration
    ├── index.html              # App HTML entry (Outfit & Inter typography)
    ├── Dockerfile              # Frontend container configuration
    └── src/
        ├── main.jsx            # React root mount
        ├── App.jsx             # Antigravity Dashboard Layout (stepper, SME workspace, split chat)
        └── index.css           # Glassmorphism theme, styling tokens, and micro-animations
```

---

## 🚀 Step-by-Step Launch Guide

### Option 1: Complete Stack via Docker Compose (Recommended)
Launch the entire system (Database with pgvector, FastAPI Backend, and React Frontend) in one command:
```bash
# Set your Gemini API Key in your shell environment
export GEMINI_API_KEY="your-api-key-here"

# Build and launch all containers
docker-compose up --build
```
* The **Frontend** will be live at: [http://localhost:5173](http://localhost:5173)
* The **FastAPI Backend** will be live at: [http://localhost:8000](http://localhost:8000)
* The **PostgreSQL Database** will be live on port `5432`

---

### Option 2: Local Development (Manual Setup)

#### 1. Database Setup
Ensure you have PostgreSQL running with the `pgvector` extension installed. Run the schema creation:
```bash
psql -U postgres -d itacs_enterprise -f database/schema.sql
```

#### 2. Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://your_user:your_pass@localhost:5432/itacs_enterprise"
export GEMINI_API_KEY="your-api-key-here"
uvicorn main:app --reload --port 8000
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to [http://localhost:5173](http://localhost:5173) to interact with the platform.

---

## 🛡️ Verifiable SME-in-the-Loop Lifecycle
1. **Ingest**: Upload a slide deck or image in the left panel. The pipeline advances from Step 1 through 5, performing PixelRAG extraction, running compliance filters, and checking for cross-functional clusters.
2. **Review**: The pipeline pauses at **Step 6 (SME Validation)**. The generated ITACS card is displayed in the central panel alongside the raw slide OCR bounding box mockup and compliance gauge.
3. **Refine**: The SME can directly edit the Opportunity Space, CSF, Insight, Rationale, and Implication in the input fields.
4. **Debate/Approve**: The SME can either click **Flag Contradiction** to route a dispute to the workshop queue, or click **Approve to Memory**, committing the record as `is_validated = true` (Step 7: Final Alignment), making it searchable in the Strategic Thought Partner chat.
