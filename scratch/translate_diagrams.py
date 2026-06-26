import json
import html
import re
import os

print("🚀 Compiling high-fidelity ITACS Platform User Guide with 3 interactive diagrams...")

# Load the raw XMLs
with open("scratch/raw_diagram_1.xml", "r", encoding="utf-8") as f:
    xml1 = f.read()

with open("scratch/raw_diagram_2.xml", "r", encoding="utf-8") as f:
    xml2 = f.read()

with open("scratch/raw_diagram_3.xml", "r", encoding="utf-8") as f:
    xml3 = f.read()

# Define translation dictionary for Diagram 1 (System Architecture)
trans1 = {
    "Adobe Workfront / UI Ingestion&lt;br&gt;&lt;i&gt;Origin Brief &amp;amp; Strategy Ingest&lt;/i&gt;": "Clinical Slide / PDF Ingestion&lt;br&gt;&lt;i&gt;Functional Slide Deck Upload&lt;/i&gt;",
    "Master Orchestrator Agent&lt;br&gt;&lt;i&gt;AWS AgentCore + Gemini 1.5 Pro&lt;/i&gt;": "ITACS Master Orchestrator&lt;br&gt;&lt;i&gt;Google GenAI SDK + Gemini 1.5 Pro&lt;/i&gt;",
    "Amazon RDS / PostgreSQL DB&lt;br&gt;&lt;b&gt;Veeva MCP Claims Registry&lt;/b&gt;": "PostgreSQL / pgvector DB&lt;br&gt;&lt;b&gt;Validated Enterprise Memory&lt;/b&gt;",
    "BigQuery CDP&lt;br&gt;&lt;i&gt;Audience &amp;amp; Consent Verification&lt;/i&gt;": "Indication Roadmap Registry&lt;br&gt;&lt;i&gt;Filing Timelines &amp;amp; Milestones&lt;/i&gt;",
    "Dynamic Context Layer&lt;br&gt;&lt;b&gt;Brand Guidelines &amp;amp; FDA Rules&lt;/b&gt;": "Compliance supervisor Layer&lt;br&gt;&lt;b&gt;Merck Brand Guidelines &amp;amp; FDA Rules&lt;/b&gt;",
    "1:N Tactic Fan-Out Engine&lt;br&gt;&lt;i&gt;Translates global strategy to tactics&lt;/i&gt;": "Consensus &amp;amp; Synthesis Engine&lt;br&gt;&lt;i&gt;Clusters functional insights to themes&lt;/i&gt;",
    "Email Tactic Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;": "Compliance supervisor Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;",
    "Web Landing Page Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;": "Red Team Challenger Agent&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro&lt;/i&gt;",
    "SMS / Alert Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;": "GenAI Historian Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;",
    "Imagen 3 (Visual Gen)&lt;br&gt;&lt;i&gt;SynthID Provenance Watermark&lt;/i&gt;": "Wargaming &amp;amp; Stress-Test Agent&lt;br&gt;&lt;i&gt;Consensus score &amp;amp; debate models&lt;/i&gt;",
    "Resilient Fallback&lt;br&gt;&lt;i&gt;(imagen-3.0-generate-002)&lt;/i&gt;": "Skeptical Challenger Fallback&lt;br&gt;&lt;i&gt;(gemini-1.5-flash-8b)&lt;/i&gt;",
    "Compliance Ledger Agent&lt;br&gt;&lt;b&gt;SHA-256 Digital Wax Seal&lt;/b&gt;": "Memory Audit Trail Agent&lt;br&gt;&lt;b&gt;SHA-256 Cryptographic Seal&lt;/b&gt;",
    "Integrations &amp;amp; Connector Manager&lt;br&gt;&lt;i&gt;Applies Cryptographic SHA-256 Lock&lt;/i&gt;": "Strategic Workshop Manager&lt;br&gt;&lt;i&gt;Weighs Trade-offs &amp;amp; Actions&lt;/i&gt;",
    "Veeva Vault Connector&lt;br&gt;&lt;i&gt;(PromoMats Portal)&lt;/i&gt;": "Indication Roadmap Cockpit&lt;br&gt;&lt;i&gt;(Melanoma / NSCLC Roadmaps)&lt;/i&gt;",
    "Salesforce Connector&lt;br&gt;&lt;i&gt;(Marketing Cloud)&lt;/i&gt;": "SME Validation Queue&lt;br&gt;&lt;i&gt;(Insight review panel)&lt;/i&gt;",
    "FDA ESG Portal&lt;br&gt;&lt;b&gt;Form FDA 2253 (eCTD)&lt;/b&gt;": "Strategic Imperatives Board&lt;br&gt;&lt;b&gt;Options, Trade-offs &amp;amp; Risks&lt;/b&gt;",
    "Outlook / Email Channels": "Automated Gap Engine"
}

# Define translation dictionary for Diagram 2 (Gateway Compliance)
trans2 = {
    "Single Pane of Glass UI&lt;br&gt;&lt;i&gt;Conversational Intake / Upload&lt;/i&gt;": "ITACS Strategic Dashboard UI&lt;br&gt;&lt;i&gt;Slide Ingestion / Cockpit Upload&lt;/i&gt;",
    "Kong AI Gateway &amp;amp; Ping&lt;br&gt;&lt;i&gt;JWT Scope Enforcement &amp;amp; PII Filter&lt;/i&gt;": "SPIFFE/OIDC Gateway&lt;br&gt;&lt;i&gt;Zero-Trust Identity &amp;amp; RAG filters&lt;/i&gt;",
    "Scalable Claims DB&lt;br&gt;&lt;b&gt;320+ Approved HCP Claims&lt;/b&gt;": "PostgreSQL pgvector DB&lt;br&gt;&lt;b&gt;Validated Enterprise Memory&lt;/b&gt;",
    "Dynamic Context Layer&lt;br&gt;&lt;b&gt;Brand Guidelines &amp;amp; FDA Rules&lt;/b&gt;": "Compliance supervisor Layer&lt;br&gt;&lt;b&gt;Merck Brand Guidelines &amp;amp; FDA Rules&lt;/b&gt;",
    "Master Orchestrator Agent&lt;br&gt;&lt;i&gt;AWS AgentCore + Gemini 1.5 Pro (2M Context)&lt;/i&gt;": "ITACS Master Orchestrator&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro (2M Context)&lt;/i&gt;",
    "1:N Tactic Fan-Out Engine&lt;br&gt;&lt;i&gt;Translates global strategy to tactics&lt;/i&gt;": "Consensus &amp;amp; Synthesis Engine&lt;br&gt;&lt;i&gt;Clusters functional insights to themes&lt;/i&gt;",
    "Email Tactic Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;": "Compliance supervisor Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;",
    "Web Landing Page Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;": "Red Team Challenger Agent&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro&lt;/i&gt;",
    "SMS / Alert Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;": "GenAI Historian Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash&lt;/i&gt;",
    "Risk &amp;amp; Compliance QC Agent&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro (Multimodal Audit). Triggers Dotted-Line Self-Healing.&lt;/i&gt;": "Red Team QC Challenger&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro (Red-Teaming). Triggers consensus debate loop.&lt;/i&gt;",
    "Integrations &amp;amp; Connector Manager&lt;br&gt;&lt;i&gt;Applies Cryptographic SHA-256 Lock&lt;/i&gt;": "Strategic Workshop Manager&lt;br&gt;&lt;i&gt;Weighs Trade-offs &amp;amp; Actions&lt;/i&gt;",
    "Veeva Vault Connector&lt;br&gt;&lt;i&gt;(PromoMats Portal)&lt;/i&gt;": "Indication Roadmap Cockpit&lt;br&gt;&lt;i&gt;(Melanoma / NSCLC Roadmaps)&lt;/i&gt;",
    "Salesforce Connector&lt;br&gt;&lt;i&gt;(Marketing Cloud)&lt;/i&gt;": "SME Validation Queue&lt;br&gt;&lt;i&gt;(Insight review panel)&lt;/i&gt;",
    "FDA ESG Portal&lt;br&gt;&lt;b&gt;Form FDA 2253 (eCTD)&lt;/b&gt;": "Strategic Imperatives Board&lt;br&gt;&lt;b&gt;Options, Trade-offs &amp;amp; Risks&lt;/b&gt;",
    "Outlook / Email Channels": "Automated Gap Engine",
    "Dotted-Line Self-Healing Trigger": "Dynamic Consensus Debate Trigger"
}

# Define translation dictionary for Diagram 3 (Sequence Ingest)
trans3 = {
    "&lt;b&gt;[1]&lt;/b&gt; Adobe Workfront Ingestion&lt;br&gt;&lt;i&gt;Campaign Strategy &amp;amp; Brief Ingest&lt;/i&gt;": "&lt;b&gt;[1]&lt;/b&gt; Clinical Slide Ingestion&lt;br&gt;&lt;i&gt;Oncology Slide Deck Upload&lt;/i&gt;",
    "&lt;b&gt;[2]&lt;/b&gt; Kong AI Gateway &amp;amp; Ping Identity&lt;br&gt;&lt;i&gt;OAuth JWT Scope &amp;amp; PHI/PII Filters&lt;/i&gt;": "&lt;b&gt;[2]&lt;/b&gt; SPIFFE/OIDC Gateway&lt;br&gt;&lt;i&gt;Zero-Trust Identity &amp;amp; RAG filters&lt;/i&gt;",
    "&lt;b&gt;[2a]&lt;/b&gt; AWS-Hosted MCP Servers&lt;br&gt;&lt;i&gt;AccessIQ Pricing &amp;amp; Legacy Agents&lt;/i&gt;": "&lt;b&gt;[2a]&lt;/b&gt; Registered MCP Servers&lt;br&gt;&lt;i&gt;External Medical Repositories (Veeva)&lt;/i&gt;",
    "&lt;b&gt;[3]&lt;/b&gt; AWS Enterprise Data Host&lt;br&gt;&lt;b&gt;Amazon RDS / Redshift (Claims)&lt;/b&gt;": "&lt;b&gt;[3]&lt;/b&gt; PostgreSQL pgvector Host&lt;br&gt;&lt;b&gt;Enterprise Memory DB&lt;/b&gt;",
    "&lt;b&gt;[4]&lt;/b&gt; Google Vertex AI Vector Search&lt;br&gt;&lt;b&gt;Real-time Grounding (Brand/FDA)&lt;/b&gt;": "&lt;b&gt;[4]&lt;/b&gt; Google Vertex AI RAG Search&lt;br&gt;&lt;b&gt;Real-time Grounding (Oncology Memory)&lt;/b&gt;",
    "&lt;b&gt;[5]&lt;/b&gt; Vertex AI Agent Designer&lt;br&gt;&lt;i&gt;System Instructions &amp;amp; Persona Hub&lt;/i&gt;": "&lt;b&gt;[5]&lt;/b&gt; Vertex AI Agent Designer&lt;br&gt;&lt;i&gt;Supervisor &amp;amp; Challenger Personas&lt;/i&gt;",
    "&lt;b&gt;[6]&lt;/b&gt; Google Agent Registry&lt;br&gt;&lt;i&gt;Governance &amp;amp; Security Hub&lt;/i&gt;": "&lt;b&gt;[6]&lt;/b&gt; Google Agent Registry&lt;br&gt;&lt;i&gt;OIDC Governance &amp;amp; Security Hub&lt;/i&gt;",
    "&lt;b&gt;[7]&lt;/b&gt; Master Orchestrator Agent&lt;br&gt;&lt;b&gt;Gemini 1.5 Pro (2M Context)&lt;/b&gt;": "&lt;b&gt;[7]&lt;/b&gt; ITACS Master Orchestrator&lt;br&gt;&lt;b&gt;Gemini 1.5 Pro (2M Context)&lt;/b&gt;",
    "&lt;b&gt;[8]&lt;/b&gt; Google ADK (Agent Dev Kit)&lt;br&gt;&lt;i&gt;Runtime Tool Calling &amp;amp; Grounding&lt;/i&gt;": "&lt;b&gt;[8]&lt;/b&gt; Google ADK (Agent Dev Kit)&lt;br&gt;&lt;i&gt;Task Execution &amp;amp; RAG Grounding&lt;/i&gt;",
    "&lt;b&gt;[8b]&lt;/b&gt; Vertex AI Imagen 3&lt;br&gt;&lt;i&gt;Compliant Multimodal Image Gen &amp;amp; SynthID Watermark&lt;/i&gt;": "&lt;b&gt;[8b]&lt;/b&gt; Wargaming Arena Agent&lt;br&gt;&lt;i&gt;Stress-Test Competitor Simulation Models&lt;/i&gt;",
    "&lt;b&gt;[8a]&lt;/b&gt; Google-AWS A2A Bridge&lt;br&gt;&lt;i&gt;EventBridge / PubSub Tunnel&lt;/i&gt;": "&lt;b&gt;[8a]&lt;/b&gt; Google-AWS A2A Bridge&lt;br&gt;&lt;i&gt;EventBridge / pgvector Tunnel&lt;/i&gt;",
    "&lt;b&gt;[9a]&lt;/b&gt; Email Tactic Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash via ADK&lt;/i&gt;": "&lt;b&gt;[9a]&lt;/b&gt; Compliance supervisor Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash via ADK&lt;/i&gt;",
    "&lt;b&gt;[9b]&lt;/b&gt; Web Landing Page Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash via ADK&lt;/i&gt;": "&lt;b&gt;[9b]&lt;/b&gt; Red Team Challenger Agent&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro via ADK&lt;/i&gt;",
    "&lt;b&gt;[9c]&lt;/b&gt; SMS / Alert Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash via ADK&lt;/i&gt;": "&lt;b&gt;[9c]&lt;/b&gt; GenAI Historian Agent&lt;br&gt;&lt;i&gt;Gemini 2.0 Flash via ADK&lt;/i&gt;",
    "&lt;b&gt;[10]&lt;/b&gt; Vertex AI Model Monitoring &amp;amp; Auditor&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro (Multimodal QC: Audits Copy, Layout, &amp;amp; Imagen 3 SynthID Watermarks)&lt;/i&gt;": "&lt;b&gt;[10]&lt;/b&gt; Vertex AI Model Monitoring &amp;amp; Auditor&lt;br&gt;&lt;i&gt;Gemini 1.5 Pro (Red-Teaming: Audits Bias, Skeptic, &amp;amp; pgvector Consensus scores)&lt;/i&gt;",
    "&lt;b&gt;[11]&lt;/b&gt; Secure Connector Manager&lt;br&gt;&lt;i&gt;Applies Cryptographic SHA-256 Lock&lt;/i&gt;": "&lt;b&gt;[11]&lt;/b&gt; Strategic Workshop Manager&lt;br&gt;&lt;i&gt;Applies Cryptographic SHA-256 Lock&lt;/i&gt;",
    "&lt;b&gt;[12a]&lt;/b&gt; Veeva Vault Connector&lt;br&gt;&lt;i&gt;(PromoMats Portal)&lt;/i&gt;": "&lt;b&gt;[12a]&lt;/b&gt; Indication Roadmap Cockpit&lt;br&gt;&lt;i&gt;(Melanoma / NSCLC Roadmaps)&lt;/i&gt;",
    "&lt;b&gt;[12b]&lt;/b&gt; Salesforce Connector&lt;br&gt;&lt;i&gt;(Marketing Cloud)&lt;/i&gt;": "&lt;b&gt;[12b]&lt;/b&gt; SME Validation Queue&lt;br&gt;&lt;i&gt;(Insight review panel)&lt;/i&gt;",
    "&lt;b&gt;[12c]&lt;/b&gt; FDA ESG Portal&lt;br&gt;&lt;b&gt;Form FDA 2253 (eCTD)&lt;/b&gt;": "&lt;b&gt;[12c]&lt;/b&gt; Strategic Imperatives Board&lt;br&gt;&lt;b&gt;Options, Trade-offs &amp;amp; Risks&lt;/b&gt;",
    "&lt;b&gt;[12d]&lt;/b&gt; Outlook / Email Channels": "&lt;b&gt;[12d]&lt;/b&gt; Automated Gap Engine",
    "[10a] Google-Native Self-Healing Loop": "[10a] Dynamic Consensus Debate Loop"
}

# Apply replacements to XMLs
for k, v in trans1.items():
    xml1 = xml1.replace(k, v)

for k, v in trans2.items():
    xml2 = xml2.replace(k, v)

for k, v in trans3.items():
    xml3 = xml3.replace(k, v)

# Serialize configs to JSON escaped format for raw HTML insertion
escaped1 = json.dumps({
    "highlight": "#06B6D4", "nav": True, "resize": True,
    "toolbar": "zoom layers tags edit", "edit": "_blank", "xml": xml1
}).replace('"', '&quot;')

escaped2 = json.dumps({
    "highlight": "#06B6D4", "nav": True, "resize": True,
    "toolbar": "zoom layers tags edit", "edit": "_blank", "xml": xml2
}).replace('"', '&quot;')

escaped3 = json.dumps({
    "highlight": "#06B6D4", "nav": True, "resize": True,
    "toolbar": "zoom layers tags edit", "edit": "_blank", "xml": xml3
}).replace('"', '&quot;')

# Build the complete high-fidelity HTML content!
html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ITACS Enterprise - User Guide & Workflow Verification</title>
    <!-- Google Fonts: Outfit & Inter for premium, modern typography -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-body: #080C14;         /* Premium deep dark navy */
            --bg-card: #0F1626;         /* Translucent card background */
            --bg-sub: #0B0F19;          /* Deep accent navy */
            --color-primary: #06B6D4;   /* Brand Cyan */
            --color-primary-hover: #0891B2;
            --color-primary-glow: rgba(6, 182, 212, 0.06);
            --color-text-main: #F8FAFC; /* Crisp slate white text */
            --color-text-muted: #64748B; /* Slate grey muted text */
            --border-color: rgba(255, 255, 255, 0.04); /* Thin glassmorphic borders */
            --accent-purple: #8B5CF6;
            --accent-green: #10B981;
            --accent-amber: #F59E0B;
            --accent-red: #EF4444;
            --font-outfit: 'Outfit', sans-serif;
            --font-inter: 'Inter', sans-serif;
        }

        body {
            background-color: var(--bg-body);
            color: var(--color-text-main);
            font-family: var(--font-inter);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }

        /* HEADER STYLING */
        .guide-header {
            background: linear-gradient(135deg, #0B0F19 0%, #0F1626 100%);
            border-bottom: 1px solid var(--border-color);
            padding: 1.1rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .guide-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 60%);
            pointer-events: none;
        }

        .logo-badge {
            background: var(--color-primary-glow);
            color: var(--color-primary);
            font-family: var(--font-outfit);
            font-weight: 800;
            padding: 0.25rem 0.75rem;
            border-radius: 30px;
            font-size: 0.68rem;
            display: inline-block;
            margin-bottom: 0.35rem;
            border: 1px solid var(--color-primary);
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .guide-header h1 {
            font-family: var(--font-outfit);
            font-size: 1.75rem;
            font-weight: 800;
            margin: 0 0 0.2rem 0;
            background: linear-gradient(to right, #FFFFFF, #94A3B8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .guide-header p {
            color: var(--color-text-muted);
            font-size: 0.92rem;
            max-width: 600px;
            margin: 0 auto;
        }

        /* CONTAINER & LAYOUT */
        .guide-container {
            max-width: 1600px;
            width: 94%;
            margin: 1.5rem auto;
            padding: 0 1rem;
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 2.5rem;
        }

        /* SIDEBAR NAVIGATION */
        .guide-sidebar {
            position: sticky;
            top: 2rem;
            height: fit-content;
        }

        .sidebar-title {
            font-family: var(--font-outfit);
            font-weight: 700;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--color-primary);
            margin-bottom: 1.25rem;
        }

        .sidebar-menu {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .sidebar-menu a {
            display: block;
            padding: 0.65rem 1rem;
            color: var(--color-text-muted);
            text-decoration: none;
            border-radius: 8px;
            font-size: 0.88rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .sidebar-menu a:hover {
            color: var(--color-text-main);
            background: rgba(6, 182, 212, 0.04);
        }

        .sidebar-menu a.active {
            color: white;
            background: var(--color-primary);
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
        }

        /* CONTENT AREAS */
        .guide-content {
            display: flex;
            flex-direction: column;
            gap: 4rem;
        }

        .guide-section {
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 2.5rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            scroll-margin-top: 2rem;
        }

        .guide-section h2 {
            font-family: var(--font-outfit);
            font-size: 1.6rem;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .section-icon {
            font-size: 1.5rem;
        }

        /* WORKFLOW STEPS */
        .workflow-timeline {
            margin: 2rem 0;
            position: relative;
            padding-left: 2.5rem;
        }

        .workflow-timeline::before {
            content: '';
            position: absolute;
            left: 11px;
            top: 10px;
            bottom: 10px;
            width: 2px;
            background-color: var(--border-color);
        }

        .timeline-step {
            position: relative;
            margin-bottom: 2rem;
        }

        .timeline-step:last-child {
            margin-bottom: 0;
        }

        .step-badge-num {
            position: absolute;
            left: -40px;
            top: 2px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: var(--bg-card);
            border: 2px solid var(--color-primary);
            color: var(--color-primary);
            font-weight: 800;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
        }

        .timeline-step.completed .step-badge-num {
            background-color: var(--color-primary);
            color: white;
        }

        .step-title {
            font-family: var(--font-outfit);
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            color: var(--color-text-main);
        }

        .step-desc {
            color: var(--color-text-muted);
            font-size: 0.95rem;
            margin: 0;
        }

        .step-code {
            background-color: #0B0F19; /* Deep dark code block */
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.75rem 1rem;
            font-family: monospace;
            font-size: 0.85rem;
            color: #22D3EE;
            margin-top: 0.75rem;
            display: block;
            overflow-x: auto;
        }

        /* VALIDATION CARDS */
        .validation-card {
            background: rgba(16, 185, 129, 0.02);
            border: 1px dashed var(--accent-green);
            border-radius: 8px;
            padding: 1.25rem 1.5rem;
            margin-top: 1.5rem;
        }

        .validation-card h4 {
            color: var(--accent-green);
            margin: 0 0 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: var(--font-outfit);
            font-weight: 700;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .validation-card ul {
            margin: 0;
            padding-left: 1.25rem;
            color: var(--color-text-muted);
            font-size: 0.9rem;
        }

        .validation-card li {
            margin-bottom: 0.4rem;
        }

        .validation-card li:last-child {
            margin-bottom: 0;
        }

        /* LABELS & BADGES */
        .workflow-badge {
            font-size: 0.65rem;
            font-weight: 700;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
            margin-left: 0.5rem;
            vertical-align: middle;
        }

        .badge-core {
            background-color: var(--color-primary-glow);
            color: var(--color-primary);
            border: 1px solid var(--color-primary);
        }

        .badge-advanced {
            background-color: rgba(139, 92, 246, 0.1);
            color: var(--accent-purple);
            border: 1px solid var(--accent-purple);
        }

        /* ALERT BLOCKS */
        .alert-box {
            padding: 1rem 1.25rem;
            border-radius: 8px;
            display: flex;
            gap: 0.75rem;
            font-size: 0.9rem;
            margin: 1.5rem 0;
        }

        .alert-note {
            background-color: rgba(6, 182, 212, 0.01);
            border-left: 4px solid var(--color-primary);
            color: var(--color-text-muted);
        }

        .alert-icon {
            font-size: 1.25rem;
            line-height: 1;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
            .guide-container {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            .guide-sidebar {
                display: none;
            }
        }

        /* SEAMLESS DIAGRAM EDITOR MODAL */
        .editor-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(8, 12, 20, 0.9); /* Translucent dark navy backdrop */
            backdrop-filter: blur(12px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
        }

        .editor-modal-overlay.active {
            opacity: 1;
            pointer-events: all;
        }

        .editor-modal-container {
            width: 96%;
            height: 94%;
            background: var(--bg-card);
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border-color);
            transform: scale(0.95);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .editor-modal-overlay.active .editor-modal-container {
            transform: scale(1);
        }

        .editor-modal-header {
            padding: 0.8rem 1.5rem;
            background: var(--bg-sub);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .editor-modal-header h3 {
            margin: 0;
            font-family: var(--font-outfit);
            font-weight: 700;
            color: var(--color-text-main);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.1rem;
        }

        .editor-modal-close-btn {
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            transition: all 0.2s;
        }

        .editor-modal-close-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--accent-red);
        }

        .editor-modal-body {
            flex: 1;
            position: relative;
            background: #ffffff;
        }

        .editor-modal-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        .inline-edit-btn {
            background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%) !important;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-family: var(--font-outfit);
            font-weight: 600;
            font-size: 0.88rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .inline-edit-btn:hover {
            box-shadow: 0 6px 16px rgba(6, 182, 212, 0.35);
            transform: translateY(-1px);
        }
        
        /* Premium Table Styles */
        .premium-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.9rem;
            border: 1px solid var(--border-color);
            text-align: left;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .premium-table th {
            background: var(--bg-sub);
            color: var(--color-text-main);
            padding: 1rem;
            font-family: var(--font-outfit);
            font-weight: 700;
            border-bottom: 1px solid var(--border-color);
        }
        
        .premium-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            color: var(--color-text-muted);
            background: rgba(255, 255, 255, 0.01);
        }
        
        .premium-table tr:last-child td {
            border-bottom: none;
        }
    </style>
</head>
<body>

    <!-- Header Banner -->
    <header class="guide-header">
        <a href="/#home" style="position: absolute; left: 2rem; top: 1.8rem; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; font-family: var(--font-outfit); font-weight: 700; font-size: 0.82rem; color: var(--color-primary); background: var(--color-primary-glow); border: 1px solid var(--color-primary); padding: 0.45rem 0.95rem; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='var(--color-primary)'; this.style.color='#fff'" onmouseout="this.style.background='var(--color-primary-glow)'; this.style.color='var(--color-primary)'">
            <span>🏠</span> Return to Cockpit
        </a>
        <div class="logo-badge">ITACS Enterprise</div>
        <h1>User Guide & Workflow Verification</h1>
        <p>Your step-by-step handbook to execute, test, and validate multi-agent oncology compliance pipelines.</p>
    </header>

    <div class="guide-container">
        
        <!-- Sticky Sidebar Navigation -->
        <aside class="guide-sidebar">
            <h3 class="sidebar-title">Core Sections</h3>
            <ul class="sidebar-menu">
                <li><a href="#overview" class="active" onclick="activateMenu(this)">📖 Platform Overview</a></li>
                <li><a href="#architecture" onclick="activateMenu(this)">🏗️ Multi-Agent Architecture</a></li>
                <li><a href="#gateway_architecture" onclick="activateMenu(this)">🛡️ Gateway & QC Flow</a></li>
                <li><a href="#detailed_flow" onclick="activateMenu(this)">🎛️ Detailed Sequence Flow</a></li>
                <li><a href="#ui_guide" onclick="activateMenu(this)">🖥️ Interface & UI Guide</a></li>
                <li><a href="#workflow1" onclick="activateMenu(this)">📥 Ingestion & Validation</a></li>
                <li><a href="#workflow2" onclick="activateMenu(this)">⚖️ Strategic Workshop</a></li>
                <li><a href="#workflow3" onclick="activateMenu(this)">🔍 Gap Detection Engine</a></li>
                <li><a href="#audit" onclick="activateMenu(this)">📜 Cryptographic Audit Ledger</a></li>
            </ul>
        </aside>

        <!-- Main Guide Content -->
        <main class="guide-content">
            
            <!-- SECTION 0: Overview -->
            <section id="overview" class="guide-section">
                <h2><span class="section-icon">📖</span> Platform Overview</h2>
                <p>Welcome to the <strong>ITACS Enterprise Insights Platform</strong>—the strategic multi-agent workbench built to accelerate functional oncology slide deck synthesis, cross-functional wargaming, and boardroom-certified action formulation.</p>
                <p>ITACS operates using a **decoupled, multi-agent consensus network** designed to eliminate strategic bias, evaluate evidence levels, and ground corporate decisions (for assets like <strong>V940</strong> and <strong>MK-1084</strong>) in solid, verifiable data. The platform ensures 100% compliance with FDA regulations and brand guidelines by routing extracted slide insights through automated supervisor gates, challenging assumptions via Red Team agents, and compiling a cryptographically secured corporate audit trail.</p>
                
                <div class="alert-box alert-note">
                    <span class="alert-icon">💡</span>
                    <div>
                        <strong>Did you know?</strong> ITACS leverages a hybrid routing engine built on **Google GenAI SDK**: using **Gemini 1.5 Pro** for deep strategic wargaming and RAG search, and **Gemini 2.0 Flash** for sub-second slide parsing, compliance checks, and real-time UI rendering.
                    </div>
                </div>
            </section>

            <!-- SECTION 1: System Architecture -->
            <section id="architecture" class="guide-section">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
                    <h2 style="margin: 0; border: none; padding: 0;"><span class="section-icon">🏗️</span> End-to-End System Architecture</h2>
                    <button class="inline-edit-btn" onclick="openDiagramEditor('architecture')">
                        <span>✏️</span> Edit Diagram Inline
                    </button>
                </div>
                <p>ITACS's orchestration framework is built upon a secure, multi-agent network that decouples slide ingestion from strategic planning. Below is the interactive, editable **Draw.io system architecture and dataflow diagram** representing all active agents, databases, decision nodes, technology stacks, and target connectors.</p>
                
                <!-- Draw.io Interactive Embed Container -->
                <div style="width: 100%; height: 840px; background: var(--bg-sub); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin: 1.5rem 0; position: relative;">
                    <div id="diagram-architecture" class="mxgraph" style="max-width:100%; height: 100%; border:none; box-sizing:border-box;" data-mxgraph="__XML1__"></div>
                </div>
                
                <div class="alert-box alert-note" style="margin-top: 1rem;">
                    <span class="alert-icon">💡</span>
                    <div>
                        <strong>How to Edit this Diagram:</strong> Hover over the diagram above and click the **"Edit"** button in the toolbar. It will instantly open this exact live architecture in **draw.io** (diagrams.net) for your team to modify!
                    </div>
                </div>
            </section>

            <!-- SECTION 1B: Enterprise Gateway & Self-Healing Architecture -->
            <section id="gateway_architecture" class="guide-section">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
                    <h2 style="margin: 0; border: none; padding: 0;"><span class="section-icon">🛡️</span> Enterprise Gateway & Consensus Flow</h2>
                    <button class="inline-edit-btn" onclick="openDiagramEditor('gateway')">
                        <span>✏️</span> Edit Diagram Inline
                    </button>
                </div>
                <p>For large-scale, highly regulated oncology deployments, the system architecture enforces strict identity governance, OIDC scopes, data privacy, and real-time validation layers. Below is the advanced **Enterprise OIDC Gateway and Red Team QC Challenger flow diagram**, representing active consensus-building integration points:</p>
                
                <!-- Draw.io Interactive Embed Container -->
                <div style="width: 100%; height: 840px; background: var(--bg-sub); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin: 1.5rem 0; position: relative;">
                    <div id="diagram-gateway" class="mxgraph" style="max-width:100%; height: 100%; border:none; box-sizing:border-box;" data-mxgraph="__XML2__"></div>
                </div>
            </section>

            <!-- SECTION 1C: Detailed Sequence Ingestion Flow -->
            <section id="detailed_flow" class="guide-section">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
                    <h2 style="margin: 0; border: none; padding: 0;"><span class="section-icon">🎛️</span> Detailed Ingestion Sequence Flow</h2>
                    <button class="inline-edit-btn" onclick="openDiagramEditor('sequence')">
                        <span>✏️</span> Edit Diagram Inline
                    </button>
                </div>
                <p>This sequence diagram details the step-by-step token transit, RAG grounding, vector search checks, and Red Team challenges that execute sequentially when a new clinical slide deck is ingested by the platform:</p>
                
                <!-- Draw.io Interactive Embed Container -->
                <div style="width: 100%; height: 940px; background: var(--bg-sub); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin: 1.5rem 0; position: relative;">
                    <div id="diagram-sequence" class="mxgraph" style="max-width:100%; height: 100%; border:none; box-sizing:border-box;" data-mxgraph="__XML3__"></div>
                </div>
            </section>

            <!-- SECTION 2: Compliance & QC Gating -->
            <section id="compliance" class="guide-section">
                <h2><span class="section-icon">🛡️</span> Compliance & QC Gating</h2>
                <p>To operate at enterprise scale, ITACS enforces a dual-layered compliance gate:</p>
                <ul style="color: var(--color-text-muted); font-size: 0.95rem; padding-left: 1.5rem; line-height: 1.8;">
                    <li><strong>Compliance Supervisor (White Line check)</strong>: Evaluates incoming slide text against corporate compliance lists (e.g., off-label promotions, unvalidated efficacy claims). High-confidence items proceed to validation; items with compliance scores under 85% are quarantined.</li>
                    <li><strong>Red Team Challenger</strong>: Prompts specialized personas (Skeptic, Payer, Competitor) to review the slide before validation, flagging blind spots and generating counter-factual scenarios.</li>
                </ul>
                <div class="step-code">
                    [Compliance Gate] Ingesting Slide MR-2 (Slide 14)...<br>
                    [Supervisor] Evaluating off-label claims: CLM-092 passed (Score: 0.98)<br>
                    [Historian] pgvector query: No duplicates found. Tagged: New Insight 🆕
                </div>
            </section>

            <!-- SECTION 3: Interface & UI Guide -->
            <section id="ui_guide" class="guide-section">
                <h2><span class="section-icon">🖥️</span> Interface & UI Guide</h2>
                <p>Maestro is structured as a **Single Pane of Glass** to eliminate "format fatigue" and abstract complex backend agent interactions into a clean, intuitive canvas. Below is a detailed breakdown of each tab, panel, and page in the workspace, along with the business and compliance rationale for why it exists.</p>
                
                <h3 style="font-family: var(--font-outfit); color: var(--color-primary); margin-top: 1.5rem;">1. The Four Main Workspace Tabs</h3>
                <p>The top navigation allows you to switch between different operational dimensions of the ITACS platform:</p>
                
                <table class="premium-table">
                    <thead>
                        <tr>
                            <th>Tab Page</th>
                            <th>What It Displays</th>
                            <th>Why It Exists (Business Value)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-weight: 700; color: var(--color-primary);">Indication Roadmap</td>
                            <td>The primary strategic timeline containing clinical studies, filing pipelines, and active regulatory milestones.</td>
                            <td>Provides a single visual workspace for leaders to track asset launch schedules (V940, MK-1084) without bouncing between tools.</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 700; color: var(--accent-purple);">SME Validation Queue</td>
                            <td>The active incoming queue of compliance-cleared slide insights waiting for functional expert validation.</td>
                            <td>Acts as the critical **Human-in-the-Loop gate** where clinical researchers confirm, edit, or quarantine AI-extracted findings.</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 700; color: var(--accent-green);">Strategic Builder</td>
                            <td>The cross-functional Kanban workspace where validated insights are formulated into macro-imperatives.</td>
                            <td>Guarantees that all corporate strategic initiatives are **directly grounded in source evidence cards** via the actions ledger.</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 700; color: var(--accent-amber);">Memory Audit Ledger</td>
                            <td>A chronological, cryptographic ledger recording every user edit, validation, and SHA-256 digital seal.</td>
                            <td>Provides an **immutable audit trail** for legal and regulatory compliance reviews, proving data provenance.</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3 style="font-family: var(--font-outfit); color: var(--color-primary); margin-top: 1.5rem;">2. Core Workspace Panels</h3>
                <p>The main cockpit is split into three highly focused columns to maximize strategic focus and operational visibility:</p>
                <ul style="color: var(--color-text-muted); font-size: 0.95rem; padding-left: 1.5rem; line-height: 1.8;">
                    <li><strong>Intake & Timeline (Left)</strong>: Contains slide upload dropzones, active roadmap timeline blocks, and the real-time AI execution log console.</li>
                    <li><strong>Active Workspace (Center)</strong>: Renders the interactive wargaming arena, the dual-ranking bias engine, and the visual cards grid.</li>
                    <li><strong>Interactive Drawer (Right)</strong>: Slides open to show detailed wargaming results, Red Team critiques, implications editor, and the actions ledger.</li>
                </ul>
            </section>

            <!-- SECTION 4: Ingestion Workflow -->
            <section id="workflow1" class="guide-section">
                <h2><span class="section-icon">📥</span> Workflow 1: Ingestion & Validation <span class="workflow-badge badge-core">Core</span></h2>
                <p>This workflow covers uploading raw slide decks, checking compliance, and approving insights into the active memory bank.</p>
                
                <div class="workflow-timeline">
                    <div class="timeline-step completed">
                        <div class="step-badge-num">1</div>
                        <h3 class="step-title">Upload the Slide Deck</h3>
                        <p class="step-desc">Drag and drop your functional PowerPoint/PDF file (e.g., <code>Melanoma_MR_Brief_Q2.pptx</code>) into the upload zone.</p>
                    </div>
                    <div class="timeline-step">
                        <div class="step-badge-num">2</div>
                        <h3 class="step-title">Audit Compliance & Historian Badging</h3>
                        <p class="step-desc">The system will parse the slide, run compliance audits, and flag the insight as <code>🆕 New</code> or <code>🔄 Known</code> based on vector similarity.</p>
                    </div>
                    <div class="timeline-step">
                        <div class="step-badge-num">3</div>
                        <h3 class="step-title">Approve to Enterprise Memory</h3>
                        <p class="step-desc">Open the card details, review the evidence score and RAG quotes, and click **"Approve to Memory Bank"** to write the card to the database.</p>
                    </div>
                </div>

                <div class="validation-card">
                    <h4>🔍 How to Validate the Results</h4>
                    <ul>
                        <li>Confirm the newly validated card displays a solid emerald-green checkmark and is listed under the validated ledger.</li>
                        <li>Verify the total counts in the top header update immediately.</li>
                    </ul>
                </div>
            </section>

            <!-- SECTION 5: Strategic Workshop Workflow -->
            <section id="workflow2" class="guide-section">
                <h2><span class="section-icon">⚖️</span> Workflow 2: Strategic Workshop & Actions <span class="workflow-badge badge-core">Core</span></h2>
                <p>This workflow covers formulating macro-imperatives, cataloging trade-offs/risks, and adding actionable tactics.</p>
                
                <div class="workflow-timeline">
                    <div class="timeline-step completed">
                        <div class="step-badge-num">1</div>
                        <h3 class="step-title">Formulate a Strategic Imperative</h3>
                        <p class="step-desc">Navigate to the **Strategic Builder** page. Click **"+ Formulate Imperative"**, fill the title/description, and create the card on the board.</p>
                    </div>
                    <div class="timeline-step">
                        <div class="step-badge-num">2</div>
                        <h3 class="step-title">Catalog Resource Trade-offs & Risks</h3>
                        <p class="step-desc">Click the card to slide open the Strategic Workshop Drawer. In the Implications Editor, type the trade-offs and risks. Click out of the fields to trigger automatic on-blur saving.</p>
                    </div>
                    <div class="timeline-step">
                        <div class="step-badge-num">3</div>
                        <h3 class="step-title">Add Actionable Tactics</h3>
                        <p class="step-desc">In the Actions Ledger at the bottom of the drawer, type your tactical action, select the owner, link a validated source card as evidence, and click **"Add"**.</p>
                    </div>
                </div>

                <div class="validation-card">
                    <h4>🔍 How to Validate the Results</h4>
                    <ul>
                        <li>Verify the Strategic Workshop Drawer remains open during typing (no focus loss or text wipes).</li>
                        <li>Confirm the strategic card in the background dynamically updates its count to <code>📋 1 Tactical Actions</code>.</li>
                    </ul>
                </div>
            </section>

            <!-- SECTION 6: Gap Detection Engine -->
            <section id="workflow3" class="guide-section">
                <h2><span class="section-icon">🔍</span> Workflow 3: Gap Detection & Temporal Decay <span class="workflow-badge badge-advanced">Advanced</span></h2>
                <p>To prevent strategic drift, ITACS features an active **Temporal Decay Engine** that flags cards older than 90 days as stale, automatically querying external medical databases to fill gaps.</p>
                
                <div class="workflow-timeline">
                    <div class="timeline-step completed">
                        <div class="step-badge-num">1</div>
                        <h3 class="step-title">Trigger Gap Detection</h3>
                        <p class="step-desc">Click the **"Automated Gap Engine"** button in the sidebar or run the API endpoint to scan for stale validated cards.</p>
                    </div>
                    <div class="timeline-step">
                        <div class="step-badge-num">2</div>
                        <h3 class="step-title">External Repository Search (MCP)</h3>
                        <p class="step-desc">The model utilizes the Model Context Protocol (MCP) to query registered external endpoints (such as Veeva Promomats or SharePoint) for fresh clinical findings.</p>
                    </div>
                    <div class="timeline-step">
                        <div class="step-badge-num">3</div>
                        <h3 class="step-title">Merge Gap-Fill Hypothesis</h3>
                        <p class="step-desc">Review the automatically generated gap-fill hypothesis card, and click **"Approve & Merge"** to overwrite the stale card in memory.</p>
                    </div>
                </div>
            </section>

            <!-- SECTION 7: Cryptographic Audit Ledger -->
            <section id="audit" class="guide-section">
                <h2><span class="section-icon">📜</span> Cryptographic Audit Ledger & Data Provenance</h2>
                <p>To satisfy rigorous pharmaceutical regulatory requirements, ITACS binds every approved strategic card to a secure, unique **SHA-256 verification hash**.</p>
                
                <h3 style="font-family: var(--font-outfit); color: var(--color-primary); margin-top: 1.5rem;">A. How the SHA-256 Seal Works</h3>
                <p>When the SME validates an insight, the system binds the text to its original reference code and generates a secure verification hash:</p>
                <span class="step-code">
                    {<br>
                    &nbsp;&nbsp;"card_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3d4bad",<br>
                    &nbsp;&nbsp;"evidence_source": "Melanoma Slide 14",<br>
                    &nbsp;&nbsp;"cryptographic_seal": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"<br>
                    }
                </span>
                <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-top: 0.5rem;">
                    This hash acts as a **tamper-evident digital wax seal**. If a single character is modified in the database directly, the computed hash will break instantly, flagging the card as ungrounded and alerting reviewers in the cockpit.
                </p>
            </section>

        </main>
    </div>

    <!-- SEAMLESS DIAGRAM EDITOR MODAL -->
    <div id="diagram-editor-overlay" class="editor-modal-overlay">
        <div class="editor-modal-container">
            <div class="editor-modal-header">
                <h3 id="modal-title-text"><span>🏗️</span> Edit Diagram</h3>
                <button class="editor-modal-close-btn" onclick="closeDiagramEditor()">&times;</button>
            </div>
            <div id="iframe-container" class="editor-modal-body"></div>
        </div>
    </div>

    <script type="text/javascript">
        // --- SEAMLESS EMBEDDED DIAGRAM EDITOR CONTROLLER ---
        let drawioIframe = null;
        let diagramXml = "";
        let activeDiagramType = "";

        function getCurrentXml(diagramType) {
            let containerId = "diagram-architecture";
            if (diagramType === "gateway") containerId = "diagram-gateway";
            if (diagramType === "sequence") containerId = "diagram-sequence";
            
            const container = document.getElementById(containerId);
            if (!container) return "";
            
            try {
                const configAttr = container.getAttribute('data-mxgraph');
                const config = JSON.parse(configAttr);
                return config.xml || "";
            } catch (e) {
                console.error("Error reading current XML:", e);
                return "";
            }
        }

        function openDiagramEditor(diagramType) {
            activeDiagramType = diagramType;
            diagramXml = getCurrentXml(diagramType);
            if (!diagramXml) {
                alert("Could not load the current diagram XML.");
                return;
            }

            const titleEl = document.getElementById('modal-title-text');
            if (diagramType === 'architecture') titleEl.innerHTML = "<span>🏗️</span> Edit End-to-End System Architecture";
            else if (diagramType === 'gateway') titleEl.innerHTML = "<span>🛡️</span> Edit Enterprise Gateway & Consensus Flow";
            else titleEl.innerHTML = "<span>🎛️</span> Edit Detailed Ingestion Sequence Flow";

            const overlay = document.getElementById('diagram-editor-overlay');
            const iframeContainer = document.getElementById('iframe-container');
            
            iframeContainer.innerHTML = `
                <iframe id="drawio-iframe" class="editor-modal-iframe" 
                        src="https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&proto=json">
                </iframe>
            `;
            
            drawioIframe = document.getElementById('drawio-iframe');
            overlay.classList.add('active');
            window.addEventListener('message', handleEditorMessage);
        }

        function closeDiagramEditor() {
            const overlay = document.getElementById('diagram-editor-overlay');
            const iframeContainer = document.getElementById('iframe-container');
            
            overlay.classList.remove('active');
            iframeContainer.innerHTML = '';
            drawioIframe = null;
            window.removeEventListener('message', handleEditorMessage);
        }

        function handleEditorMessage(evt) {
            if (!evt.data || evt.data.length === 0) return;
            
            let message = {};
            try {
                message = JSON.parse(evt.data);
            } catch (e) {
                return;
            }

            const source = drawioIframe ? drawioIframe.contentWindow : null;

            if (message.event === 'init') {
                if (source) {
                    source.postMessage(JSON.stringify({
                        action: 'load',
                        xml: diagramXml
                    }), '*');
                }
            }
            else if (message.event === 'save') {
                if (message.xml) {
                    saveDiagramToBackend(message.xml);
                }
            }
            else if (message.event === 'exit') {
                closeDiagramEditor();
            }
        }

        function saveDiagramToBackend(newXml) {
            const source = drawioIframe ? drawioIframe.contentWindow : null;
            if (source) {
                source.postMessage(JSON.stringify({
                    action: 'spinner',
                    message: 'Saving diagram to backend...'
                }), '*');
            }

            const apiBase = window.location.hostname.includes('railway.app') 
                ? 'https://itacs-backend-production.up.railway.app' 
                : '';

            fetch(`${apiBase}/api/save-diagram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    xml: newXml,
                    diagram_type: activeDiagramType
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save diagram.");
                return res.json();
            })
            .then(data => {
                if (source) {
                    source.postMessage(JSON.stringify({
                        action: 'spinner',
                        visible: false
                    }));
                }
                alert("✨ Diagram saved successfully! The page will now reload to reflect your changes.");
                closeDiagramEditor();
                window.location.reload();
            })
            .catch(err => {
                console.error(err);
                if (source) {
                    source.postMessage(JSON.stringify({
                        action: 'spinner',
                        visible: false
                    }));
                }
                alert("❌ Error saving diagram: " + err.message);
            });
        }
    </script>

    <script>
        // Smooth scrolling navigation activation
        function activateMenu(elem) {
            const menuItems = document.querySelectorAll('.sidebar-menu a');
            menuItems.forEach(item => item.classList.remove('active'));
            elem.classList.add('active');
        }

        // Highlight menu item on scroll
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('.guide-section');
            const menuItems = document.querySelectorAll('.sidebar-menu a');
            
            let currentSectionId = 'overview';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 150) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            menuItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#' + currentSectionId) {
                    item.classList.add('active');
                }
            });
        });
    </script>
    <script type="text/javascript" src="https://viewer.diagrams.net/js/viewer-static.min.js" async></script>
</body>
</html>
"""

# Surgical replace for the three XML placeholders!
html_template = html_template.replace("__XML1__", escaped1).replace("__XML2__", escaped2).replace("__XML3__", escaped3)

# Save compile output to frontend/public/user_guide.html
dest_path = "frontend/public/user_guide.html"
with open(dest_path, "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"🎉 Success! ITACS User Guide compiled with 3 detailed diagrams at {dest_path}!")
