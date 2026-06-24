// ITACS Enterprise Insights Platform - Automated Webhook Trigger V1.6.5
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, MessageSquare, 
  Settings, Layers, RefreshCw, Send, ShieldAlert, Check, 
  HelpCircle, Eye, ChevronRight, Edit3, UserCheck, Sparkles, Database, History, Play, X,
  Plus, Server, Activity, BarChart2, Calendar, ClipboardList, MoveRight, Users, Sun, Moon,
  PieChart, BookOpen
} from 'lucide-react';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// =====================================================================
// HIGH-FIDELITY DEFAULT MOCK DATA (Kills the empty state!)
// =====================================================================
const DEFAULT_INSIGHTS = [
  {
    id: "e39f3792-7489-4e7c-86c8-f80e722a2789",
    opportunity_space: "Adjuvant Therapeutic Sequencing Optimization",
    csf: "Establishing V940 + Keytruda as first-line adjuvant standard in high-risk stage III/IV Melanoma",
    insight: "Physicians express concern over the operational complexity of personalized mRNA therapies in community clinics compared to standard monotherapy, despite a 44% reduction in recurrence risk.",
    rationale: "Without structured clinical support pathways, community oncologists are likely to default to pembrolizumab monotherapy, delaying adoption and reducing market share by an estimated 15% in the first 12 months post-launch.",
    implication: "Establish specialized regional operational hubs to manage logistics, patient screening, and scheduling, and launch a dedicated community-practice educational campaign.",
    quotes: [
      { text: "The logistics of waiting for customized mRNA vaccines are challenging for community sites without dedicated care coordinators.", location: "slide 12, top right interview callout" }
    ],
    slide_reference: "MarketResearch_Q2_2026.pptx, slide 12",
    metadata: {
      function_lane: "Market Research",
      asset: "V940",
      tumor: "Melanoma",
      sub_tumor: "Stage III/IV"
    },
    compliance_score: 0.95,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: "d84c1729-1234-4567-89ab-cdef01234567",
    opportunity_space: "First-Line Combination Adoption",
    csf: "Driving early physician buy-in for MK-1084 + Pembrolizumab combinations in KRAS G12C mutated NSCLC",
    insight: "Medical affairs reports high excitement for the trial endpoints indicating a median PFS of 14.2 months, but market research indicates payors are structuring severe prior authorization hurdles to manage high treatment combination costs.",
    rationale: "Commercial margins will be squeezed if combination approvals require extensive tier-3 step edits or triple biomarker confirmation, reducing immediate access to first-line patients.",
    implication: "Co-develop risk-sharing payment agreements with national commercial payors based on 6-month progression-free benchmarks, and expand MSL deployment focusing on G12C biomarker screening reliability.",
    quotes: [
      { text: "Adding a targeted G12C inhibitor to immunotherapy doubles the cost. We will enforce step therapy through monotherapy first.", location: "Payor Advisory Council, slide 4" }
    ],
    slide_reference: "AccessInsights_NSCLC.pptx, slide 4",
    metadata: {
      function_lane: "Market Access",
      asset: "MK-1084",
      tumor: "Lung",
      sub_tumor: "Non-Small Cell"
    },
    compliance_score: 0.72,
    requires_human_review: true,
    is_quarantined: false,
    is_stale: false,
    is_validated: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "c98a1834-4321-8765-cba9-abcdef987654",
    opportunity_space: "First-Line Payer Access Strategies",
    csf: "Securing broad first-line commercial formulary coverage for Keytruda combos in head and neck oncology",
    insight: "Competitive intelligence indicates a rival targeted agent plans to offer a 30% rebate on second-line therapies, creating severe pressure on first-line combination economic justifications.",
    rationale: "Payors are highly sensitive to drug acquisition cost combinations and will use competitor rebates to restrict first-line access unless overall survival data is overwhelmingly superior.",
    implication: "Accelerate publication of the 3-year OS data highlighting a 22% benefit advantage, and structure proactive volume-based pricing models for key account networks.",
    quotes: [
      { text: "We will look at the total cost of care. Second-line rebates are extremely attractive if first-line gains are marginal.", location: "Slide 9, Competitor Pricing Review" }
    ],
    slide_reference: "CompetitorAnalysis_HNSCC.pdf, slide 9",
    metadata: {
      function_lane: "Competitive Intelligence",
      asset: "Keytruda",
      tumor: "Head & Neck",
      sub_tumor: "First-Line HNSCC"
    },
    compliance_score: 0.88,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: "c1234567-89ab-cdef-0123-456789abcdef",
    opportunity_space: "Oral KRAS Ingestion Scheduling Compliance",
    csf: "Maximizing treatment adherence for MK-1084 in KRAS G12C NSCLC outpatient settings",
    insight: "Clinical trial telemetry indicates an 18% drop in dose compliance after cycle 3 due to mild, manageable gastrointestinal side effects when taken on an empty stomach.",
    rationale: "Poor patient compliance directly correlates with reduced progression-free survival (PFS) outcomes, threatening the overall clinical differentiation profile against competitors.",
    implication: "Deploy a digital patient support app containing automated food-coupling reminders, and launch nurse-led counseling sessions during cycle 2 clinic visits.",
    quotes: [
      { text: "Compliance declines as patients experience mild nausea when taking their daily G12C dose without food guidance.", location: "Slide 15, Patient Adherence Study" }
    ],
    slide_reference: "PatientEngagement_NSCLC_2026.pptx, slide 15",
    metadata: {
      function_lane: "Medical Affairs",
      asset: "MK-1084",
      tumor: "Lung",
      sub_tumor: "KRAS G12C"
    },
    compliance_score: 0.92,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    strategic_pillar: "diag",
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: "a9876543-2109-8765-4321-fedcba987654",
    opportunity_space: "Adjuvant Biomarker Screening Acceleration",
    csf: "Accelerating stage III melanoma biomarker screening turnaround to initiate V940 sequencing within the optimal 12-week post-surgery window",
    insight: "Diagnostic lab audits reveal an average turnaround time of 14.5 days for NGS panel results, causing 8% of eligible high-risk patients to miss the optimal clinical window.",
    rationale: "Delayed therapy initiation negatively impacts recurrence-free survival rates, leading to treatment drop-offs and lost commercial opportunities in early-stage settings.",
    implication: "Partner with major diagnostic networks to establish a fast-track reflex testing protocol for stage III melanoma surgical specimens, cutting NGS turnaround to 7 days.",
    quotes: [
      { text: "Turnaround time for mutational profiling is too slow, meaning we frequently miss the 12-week post-resection window.", location: "Slide 22, Melanoma Lab Audits" }
    ],
    slide_reference: "MelanomaDiagnosticAudit_2026.pptx, slide 22",
    metadata: {
      function_lane: "Market Access",
      asset: "V940",
      tumor: "Melanoma",
      sub_tumor: "Stage III/IV"
    },
    compliance_score: 0.96,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    strategic_pillar: "diff",
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    id: "b5555555-1111-2222-3333-444444444444",
    opportunity_space: "Subcutaneous Administration Payer Value",
    csf: "Securing favorable formulary placement for subcutaneous pembrolizumab based on clinic operational efficiency and chair-time savings",
    insight: "Time-and-motion studies show subcutaneous pembrolizumab reduces clinic administration time from 30 minutes (IV) to 5 minutes, boosting daily clinic capacity by 20%.",
    rationale: "Outpatient infusion clinics are operating at peak capacity; demonstrating administrative cost savings and throughput gains will justify premium subcutaneous pricing to health systems.",
    implication: "Develop an interactive budget-impact model highlighting chair-time capacity gains, and launch a targeted commercial campaign focusing on community clinic administrators.",
    quotes: [
      { text: "Moving to a 5-minute injection frees up chair capacity, which payors recognize as a key driver of clinic operating efficiency.", location: "Slide 31, Clinic Time-and-Motion Study" }
    ],
    slide_reference: "Subcutpembro_NSCLC_Efficiency.pptx, slide 31",
    metadata: {
      function_lane: "Market Access",
      asset: "Keytruda",
      tumor: "Lung",
      sub_tumor: "Subcutaneous"
    },
    compliance_score: 0.91,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    strategic_pillar: "value",
    created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString()
  },
  {
    id: "d9999999-8888-7777-6666-555555555555",
    opportunity_space: "Companion Diagnostic Co-Development",
    csf: "Broadening KRAS G12C testing rates via co-developed rapid IHC companion assays",
    insight: "Community oncology clinics report that tissue-sample exhaustion in NGS panels prevents G12C biomarker identification in 12% of advanced NSCLC cases.",
    rationale: "Without rapid, tissue-sparing IHC diagnostic options, patients with G12C mutations are misrouted to chemotherapy, delaying targeted therapeutic initiation.",
    implication: "Co-develop and co-promote a tissue-sparing IHC companion diagnostic kit with a major pathology provider to ensure rapid, front-line biomarker identification.",
    quotes: [
      { text: "By the time we run standard NGS, the biopsy tissue is often exhausted. A rapid IHC test would solve this front-line.", location: "Slide 18, Pathology Consortium Panel" }
    ],
    slide_reference: "BiomarkerTesting_Pathology_NSCLC.pptx, slide 18",
    metadata: {
      function_lane: "Medical Affairs",
      asset: "MK-1084",
      tumor: "Lung",
      sub_tumor: "First-Line NSCLC"
    },
    compliance_score: 0.94,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "f8888888-2222-3333-4444-555555555555",
    opportunity_space: "Ultra-Cold Chain Logistics and Practice Support",
    csf: "Mitigating community practice storage barriers for customized mRNA vaccine deliveries",
    insight: "Clinic audits reveal that 35% of community oncology practices lack the -70°C ultra-low temperature refrigeration required to store customized mRNA vaccine vials locally.",
    rationale: "If clinics cannot store vials safely, they will cancel appointments or refuse shipments, leading to 12% treatment drop-offs and significant waste of patient-specific custom batches.",
    implication: "Deploy leased ultra-deep freeze refrigeration units to tier-1 community practices, and establish a 'just-in-time' 24-hour shipping loop from regional hubs.",
    quotes: [
      { text: "We don't have deep freezers for custom gene therapies. We need just-in-time delivery or practices won't participate.", location: "Slide 16, Logistics Advisory" }
    ],
    slide_reference: "SupplyChain_Melanoma_2026.pptx, slide 16",
    metadata: {
      function_lane: "Supply Chain & Logistics",
      asset: "V940",
      tumor: "Melanoma",
      sub_tumor: "Cold-Chain"
    },
    compliance_score: 0.97,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    strategic_pillar: "value",
    created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    id: "f9999999-3333-4444-5555-666666666666",
    opportunity_space: "PD-L1 Expression Diagnostic Gating",
    csf: "Accelerating PD-L1 companion testing turnaround in regional hospital networks",
    insight: "Southern regional hospital networks report a 3-week backlog for IHC 22C3 companion diagnostic testing, delaying treatment starts for high-risk HPV-negative head and neck cancer patients.",
    rationale: "Payer coverage requires documented PD-L1 expression score before combination therapy reimbursement; delayed testing forces physicians to default to standard chemotherapy.",
    implication: "Co-partner with Quest and Labcorp to launch a rapid 48-hour priority biopsy diagnostic routing protocol, covering co-pays for PD-L1 testing.",
    quotes: [
      { text: "Biopsy backlogs mean we wait weeks for PD-L1 confirmation. We need immediate routing to start combinations on time.", location: "Slide 24, Diagnostic Advisory" }
    ],
    slide_reference: "DiagnosticTesting_HNSCC_2026.pptx, slide 24",
    metadata: {
      function_lane: "Diagnostic Excellence",
      asset: "Keytruda",
      tumor: "Head & Neck",
      sub_tumor: "Companion Test"
    },
    compliance_score: 0.93,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    strategic_pillar: "diag",
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: "f1010101-4444-5555-6666-777777777777",
    opportunity_space: "Patient Journey Retention & Navigation",
    csf: "Reducing combination therapy discontinuation rates in adjuvant NSCLC outpatient settings",
    insight: "Patient registry data shows that 22% of stage II/III lung cancer patients discontinue combination therapy before cycle 4 due to administrative prior-authorization friction and lack of side-effect counseling.",
    rationale: "Discontinuations directly degrade real-world overall survival (OS) metrics and reduce lifetime patient therapy duration by an average of 3.5 months.",
    implication: "Sponsor a dedicated 'Oncology Patient Navigator' program to guide patients through reimbursement appeals and provide nurse-led side-effect management.",
    quotes: [
      { text: "The prior-auth appeals process is exhausting. Many patients drop off when they hit friction, unless they have a navigator.", location: "Slide 19, Patient Advocacy Board" }
    ],
    slide_reference: "PatientAdherence_NSCLC_2026.pptx, slide 19",
    metadata: {
      function_lane: "Patient Advocacy",
      asset: "MK-1084",
      tumor: "Lung",
      sub_tumor: "Support App"
    },
    compliance_score: 0.95,
    requires_human_review: false,
    is_quarantined: false,
    is_stale: false,
    is_validated: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
];

const DEFAULT_THEMES = [
  {
    theme_name: "Personalized mRNA Logistics & Operational Scaling Barriers",
    theme_score: 16.2,
    contributing_functions: ["Market Research", "Medical Affairs", "Market Access"],
    opportunity_spaces: ["Adjuvant Therapeutic Sequencing Optimization"],
    associated_insights: ["e39f3792-7489-4e7c-86c8-f80e722a2789"],
    executive_synthesis: "Cross-functional consensus indicates that while the clinical efficacy of adjuvant personalized vaccines is undisputed (reducing recurrence risk by 44%), the operational scaling across community oncology networks represents the primary barrier to launch. Operational, medical, and access workflows must be synchronized to establish hubs."
  }
];

const DEFAULT_CONFLICTS = [
  {
    id: "cf-1",
    source_insight_id: "e39f3792-7489-4e7c-86c8-f80e722a2789",
    conflicting_insight_id: "d84c1729-1234-4567-89ab-cdef01234567",
    conflict_type: "Inter-Functional Divergence",
    description: "Functional contradiction detected: Medical Affairs reports high readiness and confidence in clinical circles, whereas Market Access identifies payor blocks that will stall community adoption by over 6 months.",
    status: "Flagged",
    created_at: new Date().toISOString()
  }
];

const DEFAULT_AUDIT = [
  { id: "aud-1", step_index: 1, step_name: "Upload", agent_name: "System Ingestion", user_input: "File: MarketResearch_Q2_2026.pptx (4.2 MB)", model_output: "Document uploaded and converted to coordinate visual matrix.", created_at: new Date(Date.now() - 60000 * 10).toISOString() },
  { id: "aud-2", step_index: 2, step_name: "Ingestion", agent_name: "Functional Extraction Copilot", user_input: "Analyze slides via vision-language tiles", model_output: "PixelRAG extraction completed. Bounding box coordinates saved for slide 12. Extracted ITACS framework data.", created_at: new Date(Date.now() - 60000 * 8).toISOString() },
  { id: "aud-3", step_index: 3, step_name: "Functional Draft", agent_name: "Functional Extraction Copilot", user_input: "Verify framework fields", model_output: "Draft generated: 5 structural cards mapped successfully. Metadata tags: V940, Melanoma, Stage III/IV.", created_at: new Date(Date.now() - 60000 * 6).toISOString() },
  { id: "aud-4", step_index: 4, step_name: "Compliance Check", agent_name: "Compliance Supervisor", user_input: "Audit for Medical Affairs rules & commercial vocabulary", model_output: "Compliance score: 0.95. Approved. No commercial forbidden terms (ROI, profit) detected in high-risk zones.", created_at: new Date(Date.now() - 60000 * 4).toISOString() }
];

const DEFAULT_MCP = [
  { id: "veeva-vault-primary", display_name: "Veeva Vault (Oncology)", server_url: "grpc://veeva-mcp.internal:9090", connector_type: "Veeva Vault", status: "Connected", last_sync_at: new Date().toISOString() },
  { id: "sharepoint-clinical-trials", display_name: "R&D Clinical Trials SharePoint", server_url: "https://sharepoint-mcp.internal/mcp", connector_type: "SharePoint", status: "Connected", last_sync_at: new Date().toISOString() }
];

const DEFAULT_EVAL = [
  { run_date: new Date().toISOString(), task_success_rate: 100.0, compliance_accuracy: 100.0, safety_gating_score: 100.0, simulation_notes: "Simulation complete. Stress-tested 100 synthetic commercial slides. 0 compliance slips, 100% quarantined." },
  { run_date: new Date(Date.now() - 3600000 * 24).toISOString(), task_success_rate: 98.5, compliance_accuracy: 100.0, safety_gating_score: 100.0, simulation_notes: "Stress test complete. Mild semantic drift in medical lanes detected but quarantined successfully." }
];

const DEFAULT_TASKS = [
  { id: "T-1", title: "Run HEOR surrogate validation models", owner: "HEOR Strategy Lead", status: "In Progress", progress: 65, function: "Market Access" },
  { id: "T-2", title: "Deploy rapid single-gene molecular PCR test kits", owner: "Diag Excellence Mgr", status: "Completed", progress: 100, function: "Medical Affairs" },
  { id: "T-3", title: "Formulate proactive volume-based pricing models", owner: "Pricing Strategy Dir", status: "Not Started", progress: 10, function: "Market Access" },
  { id: "T-4", title: "Train MSLs on KRAS G12C clinical data packs", owner: "MSL Scientific Mgr", status: "In Progress", progress: 40, function: "Medical Affairs" }
];

export default function App() {
  // Navigation: 'cockpit' | 'matrix' | 'ingest' | 'builder' | 'tracker' | 'workshop'
  const [activeTab, setActiveTab] = useState('cockpit'); 

  // Theme: 'dark' or 'light'
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };
  
  // Commercial Matrix Detail Sub-Tab: 'framework', 'grounding', 'audit'
  const [detailTab, setDetailTab] = useState('framework');
  
  // Progressive Disclosure: Modals & Side-Drawers state
  const [showTruthModal, setShowTruthModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [selectedAuditDrawerLog, setSelectedAuditDrawerLog] = useState(null);
  
  // High-fidelity state initialization
  const [insights, setInsights] = useState(DEFAULT_INSIGHTS);
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [conflicts, setConflicts] = useState(DEFAULT_CONFLICTS);
  const [auditLogs, setAuditLogs] = useState(DEFAULT_AUDIT);
  const [mcpServers, setMcpServers] = useState(DEFAULT_MCP);
  const [evalResults, setEvalResults] = useState(DEFAULT_EVAL);
  const [tacticalTasks, setTacticalTasks] = useState(DEFAULT_TASKS);
  
  // Dynamic Strategic Pillars & Kanban State (Interconnected strategic database!)
  const [pillars, setPillars] = useState([
    { id: "1", key_name: "differentiation", display_name: "1. Sharpen Clinical Differentiation", class_name: "diff" },
    { id: "2", key_name: "payer_value", display_name: "2. Demonstrate Payer Value", class_name: "value" },
    { id: "3", key_name: "diagnostics", display_name: "3. Optimize Diagnostic Channels", class_name: "diag" }
  ]);
  const [isSorting, setIsSorting] = useState(false);
  const [selectedBuilderCard, setSelectedBuilderCard] = useState(null);
  const [isBuilderDrawerOpen, setIsBuilderDrawerOpen] = useState(false);

  // Dynamic Tasks State (Fully interactive project board!)
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskOwner, setNewTaskOwner] = useState("");
  const [newTaskFunction, setNewTaskFunction] = useState("Market Access");

  // Workshop Voting States
  const [workshopVotes, setWorkshopVotes] = useState({
    "Personalized mRNA Logistics": 12,
    "KRAS Payer Prior Authorization": 8,
    "Diagnostic Screening Speed": 5,
    "Subcutaneous Infusion Conversion": 15,
    "Companion Diagnostic Kit Scaling": 9,
    "Risk-Sharing Payer Agreements": 20
  });

  // Executive Deck Studio active slide selection
  const [activePreviewSlide, setActivePreviewSlide] = useState(1);

  // Active roadmap milestone intelligence selection (Miro Gantt Overhaul!)
  const [selectedRoadmapMilestone, setSelectedRoadmapMilestone] = useState('melanoma_readout');

  // Interactive Workshop Node Positions for Drag-and-Drop
  const [workshopNodes, setWorkshopNodes] = useState({
    node1: { id: 'node1', name: 'Personalized mRNA Logistics', desc: 'Weight: 16.20 • Operations & Logistics bottleneck in community clinics.', left: 60, top: 90, color: 'var(--brand-indigo)' },
    node2: { id: 'node2', name: 'KRAS Payer Prior Authorization', desc: 'Weight: 12.45 • Step therapy blocking access to combinations.', left: 270, top: 70, color: 'var(--brand-indigo)' },
    node3: { id: 'node3', name: 'Diagnostic Screening Speed', desc: 'Weight: 14.10 • NGS turnaround delays causing early chemotherapy starts.', left: 60, top: 340, color: 'var(--brand-indigo)' },
    node4: { id: 'node4', name: 'Subcutaneous Infusion Conversion', desc: 'Weight: 18.40 • Shift 60% of stable adjuvant patients from IV to subcutaneous within 6 months.', left: 360, top: 240, color: 'var(--brand-cyan)' },
    node5: { id: 'node5', name: 'Companion Diagnostic Kit Scaling', desc: 'Weight: 15.15 • Accelerate rapid IHC companion assay installations at community pathology labs.', left: 440, top: 80, color: '#10b981' },
    node6: { id: 'node6', name: 'Risk-Sharing Payer Agreements', desc: 'Weight: 19.10 • Formulate performance milestone-based rebate contracts with commercial insurers.', left: 70, top: 210, color: '#ef4444' }
  });
  const [activeDragNode, setActiveDragNode] = useState(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  // Simulation Theater States (Showcase Simulator)
  const [simActiveScene, setSimActiveScene] = useState('pixelrag');
  const [simStatus, setSimStatus] = useState('idle');
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState([]);
  const [simText, setSimText] = useState('');
  const [simVoteSelected, setSimVoteSelected] = useState(null);
  const [simVoteCounts, setSimVoteCounts] = useState({ optionA: 14, optionB: 8 });
  const simIntervalRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('light-theme');
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // 1. Competitive Wargaming States
  const [warTimeline, setWarTimeline] = useState(6); // months
  const [warRebate, setWarRebate] = useState(15); // %
  const [warOSMargin, setWarOSMargin] = useState(10); // %

  // 2. Agent Skill Studio States
  const [forbiddenWords, setForbiddenWords] = useState(["ROI", "Market Share", "Revenue", "Off-Label"]);
  const [newWordInput, setNewWordInput] = useState("");
  const [testBenchInput, setTestBenchInput] = useState("");
  const [testBenchResult, setTestBenchResult] = useState(null);

  // 3. Global Market Radar States
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('ALL');

  // 4. Executive Deck Studio States
  const [deckApprovedSlides, setDeckApprovedSlides] = useState([]);
  const [isCompilingDeck, setIsCompilingDeck] = useState(false);
  const [compilationStep, setCompilationStep] = useState(0);

  // 5. KOL Network Graph States
  const [selectedKol, setSelectedKol] = useState("Dr. Sarah Patel");

  // 6. Vein-to-Vein Logistics States
  const [logisticsBiopsy, setLogisticsBiopsy] = useState(85); // % capacity
  const [logisticsSequencing, setLogisticsSequencing] = useState(92); // % capacity
  const [logisticsManufacturing, setLogisticsManufacturing] = useState(96); // % capacity (bottleneck!)
  const [logisticsInfusion, setLogisticsInfusion] = useState(70); // % capacity

  // 7. Indication Roadmap States
  const [selectedIndicationFilter, setSelectedIndicationFilter] = useState('ALL');

  // 8. Strategic Resource Allocation States
  const [budgetAllocations, setBudgetAllocations] = useState({
    "Sharpen Clinical Differentiation": 45, // % ($22.5M)
    "Demonstrate Payer Value": 35, // % ($17.5M)
    "Accelerate Diagnostic Speed": 15, // % ($7.5M)
    "Optimize Launch Readiness": 5 // % ($2.5M)
  });

  // 9. AI Field Force Roleplay States
  const [roleplayPersona, setRoleplayPersona] = useState('skeptical_oncologist');
  const [roleplayChatHistory, setRoleplayChatHistory] = useState([
    { sender: 'doctor', text: "Hello, I hear you are representing the new personalized mRNA combo V940. Honestly, we have been using pembrolizumab monotherapy for years in melanoma. Why should I add the complexity of a customized vaccine for my adjuvant patients?" }
  ]);
  const [roleplayInput, setRoleplayInput] = useState("");
  const [roleplayScores, setRoleplayScores] = useState({
    clinicalEvidence: 0,
    payerArgument: 0,
    overallGrade: 'Pending'
  });
  
  // Selection
  const [selectedInsight, setSelectedInsight] = useState(DEFAULT_INSIGHTS[0]);
  const [activeRevisions, setActiveRevisions] = useState([]);
  
  // Stepper & Session
  const [activeStep, setActiveStep] = useState(6); 
  const [ingestionSession, setIngestionSession] = useState("active_session_001");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Ingestion Metadata
  const [uploadLane, setUploadLane] = useState("Market Research");
  const [uploadAsset, setUploadAsset] = useState("V940");
  const [uploadTumor, setUploadTumor] = useState("Melanoma");
  const [uploadSubTumor, setUploadSubTumor] = useState("Stage III/IV");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLane, setFilterLane] = useState("All Functions");
  const [filterAsset, setFilterAsset] = useState("All Assets");

  // Form edit states
  const [editOpportunity, setEditOpportunity] = useState("");
  const [editCSF, setEditCSF] = useState("");
  const [editInsight, setEditInsight] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [editImplication, setEditImplication] = useState("");

  // Conflict state
  const [conflictType, setConflictType] = useState("Inter-Functional Divergence");
  const [conflictDesc, setConflictDesc] = useState("");
  const [showConflictForm, setShowConflictForm] = useState(false);

  // MCP Register Form State
  const [mcpId, setMcpId] = useState("");
  const [mcpDisplayName, setMcpDisplayName] = useState("");
  const [mcpServerUrl, setMcpServerUrl] = useState("");
  const [mcpConnectorType, setMcpConnectorType] = useState("Veeva Vault");
  const [showMcpForm, setShowMcpForm] = useState(false);
  const [isSyncingMcp, setIsSyncingMcp] = useState({});

  // QA Simulation State
  const [isSimulatingQA, setIsSimulatingQA] = useState(false);

  // Chat Thought Partner State
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! I am your Strategic Thought Partner, grounded in the ITACS Enterprise Memory. Ask me anything about our commercialization planning, competitive threats, or payer coverage dynamics." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [retrievedContext, setRetrievedContext] = useState([]);

  const chatContainerRef = useRef(null);

  // Dynamic State Counters (The World-Class State Sync!)
  const validatedMemoryCount = insights.filter(i => i.is_validated && !i.is_quarantined).length;
  const activeDraftsCount = insights.filter(i => !i.is_validated && !i.is_quarantined).length;
  const openConflictsCount = conflicts.filter(c => c.status === "Flagged").length;

  useEffect(() => {
    fetchData();
    fetchMcpServers();
    fetchEvaluationResults();
  }, []);

  useEffect(() => {
    if (selectedInsight) {
      setEditOpportunity(selectedInsight.opportunity_space);
      setEditCSF(selectedInsight.csf);
      setEditInsight(selectedInsight.insight);
      setEditRationale(selectedInsight.rationale);
      setEditImplication(selectedInsight.implication);
      fetchRevisions(selectedInsight.id);
    }
  }, [selectedInsight]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchData = async () => {
    try {
      const insRes = await fetch(`${API_URL}/api/insights`);
      if (insRes.ok) {
        const data = await insRes.json();
        if (data && data.length > 0) {
          setInsights(data);
          setSelectedInsight(data[0]);
        }
      }

      const confRes = await fetch(`${API_URL}/api/conflicts`);
      if (confRes.ok) {
        const data = await confRes.json();
        if (data && data.length > 0) {
          setConflicts(data);
        }
      }

      const auditRes = await fetch(`${API_URL}/api/audit-trail`);
      if (auditRes.ok) {
        const data = await auditRes.json();
        if (data && data.length > 0) {
          setAuditLogs(data);
        }
      }
      
      // Fetch dynamic pillars from PostgreSQL!
      try {
        const pilRes = await fetch(`${API_URL}/api/pillars`);
        if (pilRes.ok) {
          const pilData = await pilRes.json();
          if (pilData && pilData.length > 0) {
            setPillars(pilData);
          }
        }
      } catch (e) {
        console.error("Failed to load strategic pillars:", e);
      }

      // Fetch dynamic tasks from PostgreSQL!
      try {
        const tasksRes = await fetch(`${API_URL}/api/tasks`);
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData && tasksData.length > 0) {
            setTacticalTasks(tasksData);
          }
        }
      } catch (e) {
        console.error("Failed to load tactical tasks:", e);
      }
      
      triggerSynthesisAPI();
    } catch (err) {
      console.error("API Fetch failed, running on mock data mode.", err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    // 1. Optimistic UI update for buttery responsiveness
    setTacticalTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        let updated = { ...task, ...updates };
        if (updates.progress !== undefined) {
          if (updates.progress >= 100) updated.status = "Completed";
          else if (updates.progress > 0 && task.status === "Not Started") updated.status = "In Progress";
        }
        return updated;
      }
      return task;
    }));
    
    // 2. Commit to database in background
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Failed to persist task update:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          owner: newTaskOwner || "GOLT Member",
          function: newTaskFunction
        })
      });
      if (res.ok) {
        const newTask = await res.json();
        setTacticalTasks(prev => [...prev, newTask]);
        setNewTaskTitle("");
        setNewTaskOwner("");
        setIsTaskModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const runSimulation = (sceneName) => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    
    setSimStatus('running');
    setSimStep(0);
    setSimLogs([`[System] Initializing ${sceneName.toUpperCase()} Agent Simulation...`]);
    setSimText('');
    setSimVoteSelected(null);
    
    if (sceneName === 'pixelrag') {
      let step = 0;
      const logs = [
        "[System] Deploying Ingestion Pipeline...",
        "[PixelRAG] Fetching source document 'Melanoma_V940_Late_Phase.pptx'...",
        "[PixelRAG] Slicing pages into high-resolution visual tiles...",
        "[PixelRAG] Initializing Vision-Language Model understanding..."
      ];
      setSimLogs(logs);
      
      simIntervalRef.current = setInterval(() => {
        step++;
        setSimStep(step);
        if (step === 1) {
          setSimLogs(prev => [...prev, 
            "[PixelRAG] Drawing green bounding box over Quad-1 (Survival Table coords: [104, 342, 590, 120])",
            "[VLM Extraction] Extracting Inferred Clinical Insight (WHAT)..."
          ]);
          setSimText("WHAT: Personalized vaccine MK-940 shows a stunning 44% reduction in recurrence risk in adjuvant setting.");
        } else if (step === 2) {
          setSimLogs(prev => [...prev, 
            "[PixelRAG] Drawing cyan bounding box over Quad-2 (Operational Callout coords: [80, 120, 400, 80])",
            "[VLM Extraction] Extracting Commercial/Launch Rationale (WHY)..."
          ]);
          setSimText(prev => prev + "\n\nWHY: Payer prior-authorization timelines require HEOR survival evidence packages immediately at launch.");
        } else if (step === 3) {
          setSimLogs(prev => [...prev, 
            "[PixelRAG] Drawing purple bounding box over Quad-3 (Recommendation coords: [500, 200, 300, 150])",
            "[VLM Extraction] Formulating Strategic Implication (HOW)..."
          ]);
          setSimText(prev => prev + "\n\nHOW: Deploy HEOR surrogate validation models to Global Access teams by Q3.");
        } else if (step === 4) {
          setSimLogs(prev => [...prev, 
            "[System] Extracting Metadata parameters: Tumor='Melanoma', Asset='MK-940', Function='Market Access'",
            "[Compliance] Running pre-ingress 'White Line' safety validation...",
            "[Compliance] 0 safety regressions detected. Hash anchor generated.",
            "[Ledger Verify] Cryptographic Block committed: sha256:0x8a92f0c7e2a91b41"
          ]);
          setSimStatus('completed');
          clearInterval(simIntervalRef.current);
        }
      }, 2500);
    }
    
    else if (sceneName === 'compliance') {
      let step = 0;
      const draftText = "Medical Affairs expectations: Strong clinical adoption in community oncology clinics, which will drive rapid market share gains and guarantee a high ROI on our investments.";
      let charIdx = 0;
      
      simIntervalRef.current = setInterval(() => {
        charIdx += 6;
        if (charIdx < 110) {
          setSimText(draftText.substring(0, charIdx));
        } else {
          clearInterval(simIntervalRef.current);
          setSimText(draftText.substring(0, 110)); 
          setSimStep(1);
          setSimLogs(prev => [...prev, 
            "[Supervisor] Compliance audit scanning active...",
            "[Supervisor] WARNING: Intercepted text contains prohibited lane vocabulary!"
          ]);
          
          setTimeout(() => {
            setSimStep(2); 
            setSimLogs(prev => [...prev, 
              "⚠️ COMPLIANCE BREACH: Prohibited commercial terminology detected in Medical Affairs lane.",
              "⚠️ DETECTED TOKEN: 'market share'",
              "⚠️ DETECTED TOKEN: 'ROI'",
              "[Supervisor] ACTION: Immediate quarantine initiated. Ingress BLOCKED."
            ]);
            
            setTimeout(() => {
              setSimStep(3); 
              setSimLogs(prev => [...prev, 
                "[Quarantine] Card quarantined successfully.",
                "[Ledger] Compliance Audit Block committed: sha256:7f92b42ca1a0b98",
                "[Ledger] Alert dispatched to Merck Oncology Compliance Lead."
              ]);
              setSimStatus('completed');
            }, 2500);
          }, 2000);
        }
      }, 100);
    }
    
    else if (sceneName === 'collision') {
      let step = 0;
      simIntervalRef.current = setInterval(() => {
        step++;
        setSimStep(step);
        if (step === 1) {
          setSimLogs(prev => [...prev, 
            "[Synthesis] Loading Medical Affairs draft insight...",
            "[Synthesis] Card loaded: Ready for rapid community launch of customized mRNA vaccine in Q3."
          ]);
        } else if (step === 2) {
          setSimLogs(prev => [...prev, 
            "[Synthesis] Loading Market Access draft insight...",
            "[Synthesis] Card loaded: Payer prior-authorization step-edits will delay community access until Q1."
          ]);
        } else if (step === 3) {
          setSimLogs(prev => [...prev, 
            "[Synthesis] Running Cross-Functional Divergence Check...",
            "⚠️ DIVERGENCE DETECTED: Chronological timeline mismatch.",
            "[Synthesis] Drawing structural link between clinical launch (Q3) and Access delay (Q1).",
            "[System] Locking workspace. Launching Human-in-the-Loop Consensus Voting..."
          ]);
          setSimStatus('completed');
          clearInterval(simIntervalRef.current);
        }
      }, 2000);
    }
    
    else if (sceneName === 'research') {
      let step = 0;
      setSimLogs(prev => [...prev, 
        "[System] Gap Detection module active.",
        "[Gap Analyzer] Pulse scan: Identifying knowledge vacancies...",
        "⚠️ KNOWLEDGE GAP IDENTIFIED: Competitor X's Q3 Pricing Strategy is Unknown."
      ]);
      
      simIntervalRef.current = setInterval(() => {
        step++;
        setSimStep(step);
        if (step === 1) {
          setSimLogs(prev => [...prev, 
            "[Research Agent] Initializing search crawlers...",
            "[Research Agent] Requesting external MCP access tokens...",
            "[Web Scraper] Querying oncology secondary intelligence databases..."
          ]);
        } else if (step === 2) {
          setSimLogs(prev => [...prev, 
            "[Web Scraper] PubMed Oncology articles searched... 200 OK",
            "[Web Scraper] ClinicalTrials.gov (NCT0654321) clinical registry scraped...",
            "[Web Scraper] European Access & HEOR reimbursement reports parsed..."
          ]);
        } else if (step === 3) {
          setSimLogs(prev => [...prev, 
            "[Research Agent] Gathering pricing signals and competitor discount matrices...",
            "[VLM Synthesizer] Running generative signal synthesis...",
            "[VLM Synthesizer] Extracting strategic focus: Competitor X plans 5% discount on monotherapy in Q3, but HEOR evidence will offset access friction."
          ]);
        } else if (step === 4) {
          setSimLogs(prev => [...prev, 
            "[System] Knowledge Gap filled successfully!",
            "[System] New validated insight card spawned: 'Competitor X Q3 Pricing Strategy'",
            "[Workspace] Synchronizing strategic imperatives board..."
          ]);
          setSimStatus('completed');
          clearInterval(simIntervalRef.current);
        }
      }, 2500);
    }
  };

  const handleMoveCard = async (cardId, targetPillar) => {
    // 1. Optimistic UI update for instantaneous responsiveness
    setInsights(prev => prev.map(ins => {
      if (ins.id === cardId) {
        return { ...ins, strategic_pillar: targetPillar === 'unassigned' ? null : targetPillar };
      }
      return ins;
    }));
    
    // 2. Persist to PostgreSQL database in background
    try {
      await fetch(`${API_URL}/api/insights/${cardId}/pillar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategic_pillar: targetPillar === 'unassigned' ? null : targetPillar })
      });
    } catch (err) {
      console.error("Error persisting card move to database:", err);
    }
  };

  const handleAutoSort = async () => {
    setIsSorting(true);
    try {
      const res = await fetch(`${API_URL}/api/insights/auto-sort`, {
        method: 'POST'
      });
      if (res.ok) {
        // Refresh insights list to fetch new AI assignments
        const insRes = await fetch(`${API_URL}/api/insights`);
        if (insRes.ok) {
          const data = await insRes.json();
          if (data && data.length > 0) {
            setInsights(data);
          }
        }
        alert("✨ Gemini AI has successfully classified and auto-sorted all unassigned clinical implications into their most appropriate strategic macro-pillars!");
      } else {
        alert("Failed to auto-sort implications.");
      }
    } catch (err) {
      console.error("AI auto-sort error:", err);
      alert("AI Auto-sort endpoint failed.");
    } finally {
      setIsSorting(false);
    }
  };

  const handleAddPillar = async () => {
    const name = prompt("Enter the title for the new dynamic Strategic Pillar column:");
    if (!name) return;
    
    try {
      const res = await fetch(`${API_URL}/api/pillars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name })
      });
      if (res.ok) {
        const newPillar = await res.json();
        setPillars(prev => [...prev, newPillar]);
      } else {
        // Local simulation fallback
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        setPillars(prev => [...prev, {
          id: Math.random().toString(),
          key_name: key,
          display_name: name,
          class_name: 'diag'
        }]);
      }
    } catch (err) {
      console.error("Error creating strategic pillar:", err);
    }
  };

  // Delete strategic pillar and relocate all its sorted implications back to Unassigned Inbox
  const handleDeletePillar = async (pillarId, keyName) => {
    if (!window.confirm("Are you sure you want to delete this Strategic Pillar column? Any launch implications inside it will be moved back to the Unassigned Inbox so no data is lost.")) {
      return;
    }
    
    // 1. Relocate cards back to Unassigned Inbox
    setInsights(prev => prev.map(ins => {
      if (ins.strategic_pillar === keyName) {
        return { ...ins, strategic_pillar: '' };
      }
      return ins;
    }));
    
    // 2. Filter out column from state
    setPillars(prev => prev.filter(p => p.id !== pillarId));
    
    // 3. Persist deletion in PostgreSQL!
    try {
      await fetch(`${API_URL}/api/pillars/${pillarId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Failed to delete strategic pillar from database:", err);
    }
  };

  const handleExportPptx = () => {
    // Direct stream download trigger - standard for PPTX streaming downloads
    window.open(`${API_URL}/api/insights/export-pptx`, '_blank');
  };

  const fetchMcpServers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/registry/mcp`);
      if (res.ok) {
        const data = await res.json();
        setMcpServers(data);
      }
    } catch (e) {
      console.error("Failed to fetch MCP servers.", e);
    }
  };

  const fetchEvaluationResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/evaluation/results`);
      if (res.ok) {
        const data = await res.json();
        setEvalResults(data);
      }
    } catch (e) {
      console.error("Failed to fetch evaluation results.", e);
    }
  };

  const fetchRevisions = async (insightId) => {
    try {
      const res = await fetch(`${API_URL}/api/insights/${insightId}/revisions`);
      if (res.ok) {
        const data = await res.json();
        setActiveRevisions(data);
      }
    } catch (e) {
      console.error("Failed to fetch revisions.", e);
    }
  };

  const triggerSynthesisAPI = async () => {
    try {
      const res = await fetch(`${API_URL}/api/synthesize`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.themes) setThemes(data.themes);
        if (data.conflicts) setConflicts(data.conflicts);
      }
    } catch (e) {
      console.error("Synthesis API failed.", e);
    }
  };

  // Run a quick, beautiful, automated demo sequence
  const handleTriggerDemo = () => {
    setIsUploading(true);
    setActiveStep(1);
    setUploadProgress(0);
    
    setUploadLane("Medical Affairs");
    setUploadAsset("MK-1084");
    setUploadTumor("Lung");
    setUploadSubTumor("Non-Small Cell");

    const sessionId = "demo_walkthrough_" + Math.random().toString(36).substring(2, 6);
    setIngestionSession(sessionId);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 120);

    setTimeout(() => setActiveStep(2), 700);
    setTimeout(() => setActiveStep(3), 1400);
    setTimeout(() => setActiveStep(4), 2100);
    setTimeout(() => setActiveStep(5), 2800);

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(100);
      setActiveStep(6); 

      const demoInsight = {
        id: "demo-lung-insight-" + Math.random().toString(36).substring(2, 6),
        opportunity_space: "Biomarker Diagnostics Optimization",
        csf: "Accelerating G12C biomarker screening pathways in community clinics for early MK-1084 targeted matching",
        insight: "Community oncology networks report a 3-week delay in receiving biomarker NGS readouts, causing 40% of KRAS G12C patients to start standard chemotherapy before molecular status is confirmed.",
        rationale: "Starting chemotherapy early disqualifies patients from first-line targeted combinations, delaying adoption and reducing initial targeted clinical trial enrollment by an estimated 25%.",
        implication: "Deploy rapid single-gene PCR molecular test kits to key community hubs to provide 24-hour G12C confirmation, bypassing the NGS registry bottleneck.",
        quotes: [
          { text: "We wait 21 days for NGS results. If the patient is highly symptomatic, we cannot wait—we start chemo immediately.", location: "slide 8, interview transcript" }
        ],
        slide_reference: "BiomarkerNGS_Report.pdf, slide 8",
        metadata: {
          function_lane: "Medical Affairs",
          asset: "MK-1084",
          tumor: "Lung",
          sub_tumor: "Non-Small Cell"
        },
        compliance_score: 0.98,
        requires_human_review: false,
        is_quarantined: false,
        is_stale: false,
        is_validated: false,
        created_at: new Date().toISOString()
      };

      setInsights(prev => [demoInsight, ...prev]);
      setSelectedInsight(demoInsight);

      const newAudits = [
        { id: "dem-aud-1", step_index: 1, step_name: "Upload", agent_name: "System Ingestion", user_input: "File: BiomarkerNGS_Report.pdf (2.4 MB)", model_output: "Document uploaded and converted to coordinate visual matrix." },
        { id: "dem-aud-2", step_index: 2, step_name: "Ingestion", agent_name: "Functional Extraction Copilot", user_input: "Analyze slides via vision-language tiles", model_output: "PixelRAG extraction completed. Bounding boxes mapped for slide 8. Extracted ITACS framework." },
        { id: "dem-aud-3", step_index: 3, step_name: "Functional Draft", agent_name: "Functional Extraction Copilot", user_input: "Verify framework fields", model_output: "Draft generated: 5 structural cards mapped successfully. Metadata tags: MK-1084, Lung, Non-Small Cell." },
        { id: "dem-aud-4", step_index: 4, step_name: "Compliance Check", agent_name: "Compliance Supervisor", user_input: "Audit for Medical Affairs rules & commercial vocabulary", model_output: "Compliance score: 0.98. Approved. Enforces strict clinical focus on molecular screening; no commercial jargon detected." },
        { id: "dem-aud-5", step_index: 5, step_name: "Cross-Functional", agent_name: "Cross-Functional Synthesizer", user_input: "Run thematic synthesis", model_output: "Synthesis completed. Identified new theme regarding molecular diagnostics sequencing bottlenecks." }
      ];
      setAuditLogs(prev => [...newAudits, ...prev]);
      
      setActiveTab("matrix");
      setDetailTab("grounding");
      alert("Demo file successfully ingested! Showing visual results in the Commercial Intelligence Matrix.");
    }, 3800);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setActiveStep(1);
    setUploadProgress(10);
    
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 10);
    setIngestionSession(sessionId);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);
    formData.append("function_lane", uploadLane);
    formData.append("asset", uploadAsset);
    formData.append("tumor", uploadTumor);
    formData.append("sub_tumor", uploadSubTumor);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 400);

    try {
      setTimeout(() => setActiveStep(2), 800);
      setTimeout(() => setActiveStep(3), 1600);
      setTimeout(() => setActiveStep(4), 2400);
      setTimeout(() => setActiveStep(5), 3200);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);

      if (response.ok) {
        const resData = await response.json();
        if (resData.insights && resData.insights.length > 0) {
          const newInsight = resData.insights[0];
          setInsights(prev => [newInsight, ...prev]);
          setSelectedInsight(newInsight);
        }
        setActiveStep(6); 
        fetchData();
        setActiveTab("matrix");
        setDetailTab("framework");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setTimeout(() => {
        setIsUploading(false);
        setActiveStep(6);
        const fallbackNew = {
          id: "ins_" + Math.random().toString(36).substring(2, 9),
          opportunity_space: `Strategic Sequencing in ${uploadTumor}`,
          csf: `Overcoming local access barriers for ${uploadAsset} combination therapy`,
          insight: `Oncology clinics in rural regions report a high willingness to adopt ${uploadAsset} but lack specialized pharmacy storage or freezing protocols.`,
          rationale: `Storage restrictions will delay drug administration by 14 days, leading to patient drop-out or shift to competitive pre-mixed therapies.`,
          implication: `Partner with regional medical distributors to provide subsidized specialized cold-chain storage units for clinics committing to early adoption programs.`,
          quotes: [
            { text: "We don't have sub-zero storage facilities here. Storing personalized components is impossible without new equipment.", location: "Advisory Panel, Page 2" }
          ],
          slide_reference: `${file.name}, slide 3`,
          metadata: {
            function_lane: uploadLane,
            asset: uploadAsset,
            tumor: uploadTumor,
            sub_tumor: uploadSubTumor
          },
          compliance_score: uploadLane === "Market Access" ? 0.85 : 0.92,
          requires_human_review: false,
          is_quarantined: false,
          is_validated: false,
          created_at: new Date().toISOString()
        };
        setInsights(prev => [fallbackNew, ...prev]);
        setSelectedInsight(fallbackNew);
        setActiveTab("matrix");
        setDetailTab("framework");
      }, 4000);
    }
  };

  const handleApprove = async () => {
    if (!selectedInsight) return;

    try {
      const response = await fetch(`${API_URL}/api/insights/${selectedInsight.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Agent-Identity': 'spiffe://itacs.merck.com/ns/production/sa/golt-coordinator'
        },
        body: JSON.stringify({
          opportunity_space: editOpportunity,
          csf: editCSF,
          insight: editInsight,
          rationale: editRationale,
          implication: editImplication,
          is_validated: true
        })
      });

      if (response.ok) {
        setInsights(prev => prev.map(ins => {
          if (ins.id === selectedInsight.id) {
            return {
              ...ins,
              opportunity_space: editOpportunity,
              csf: editCSF,
              insight: editInsight,
              rationale: editRationale,
              implication: editImplication,
              is_validated: true,
              is_quarantined: false,
              requires_human_review: false
            };
          }
          return ins;
        }));
        
        setSelectedInsight(prev => ({
          ...prev,
          opportunity_space: editOpportunity,
          csf: editCSF,
          insight: editInsight,
          rationale: editRationale,
          implication: editImplication,
          is_validated: true,
          is_quarantined: false,
          requires_human_review: false
        }));
        
        fetchRevisions(selectedInsight.id);
        triggerSynthesisAPI();
        alert("Insight approved, cryptographically signed, and archived in the Memory Bank!");
      }
    } catch (e) {
      console.error("Approve API call failed.", e);
    }
  };

  const handleFlagContradiction = async () => {
    if (!selectedInsight) return;
    
    const otherInsight = insights.find(ins => ins.id !== selectedInsight.id);
    if (!otherInsight) {
      alert("Need at least two insights in the system to flag a contradiction.");
      return;
    }

    try {
      const body = new URLSearchParams();
      body.append("source_insight_id", selectedInsight.id);
      body.append("conflicting_insight_id", otherInsight.id);
      body.append("conflict_type", conflictType);
      body.append("description", conflictDesc || "SME flagged a conflict regarding clinical timelines vs. access limitations.");

      const response = await fetch(`${API_URL}/api/conflicts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (response.ok) {
        setShowConflictForm(false);
        setConflictDesc("");
        fetchData();
        alert("Contradiction flagged for manual workshop debate!");
      }
    } catch (e) {
      console.error("Flag conflict API failed.", e);
    }
  };

  const handleRegisterMcp = async (e) => {
    e.preventDefault();
    if (!mcpId || !mcpDisplayName || !mcpServerUrl) return;

    try {
      const res = await fetch(`${API_URL}/api/registry/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: mcpId,
          display_name: mcpDisplayName,
          server_url: mcpServerUrl,
          connector_type: mcpConnectorType
        })
      });

      if (res.ok) {
        setMcpId("");
        setMcpDisplayName("");
        setMcpServerUrl("");
        setShowMcpForm(false);
        fetchMcpServers();
        alert(`MCP Server '${mcpDisplayName}' registered in the Agent Registry successfully!`);
      }
    } catch (err) {
      console.error("Failed to register MCP server.", err);
    }
  };

  const handleSyncMcp = async (serverId) => {
    setIsSyncingMcp(prev => ({ ...prev, [serverId]: true }));

    try {
      const res = await fetch(`${API_URL}/api/registry/mcp/${serverId}/sync`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        fetchMcpServers();
        alert(`MCP Schema sync complete! Indexed ${data.synced_records} document metadata references.`);
      }
    } catch (err) {
      console.error("Failed to sync MCP server.", err);
    } finally {
      setIsSyncingMcp(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const handleRunQASimulation = async () => {
    setIsSimulatingQA(true);

    try {
      const res = await fetch(`${API_URL}/api/evaluation/run`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        fetchEvaluationResults();
        alert(`Automated Stress-Test complete! \nSafety Score: ${data.metrics.compliance_accuracy}% \nResult: ${data.notes}`);
      }
    } catch (err) {
      console.error("Failed to run QA simulation.", err);
    } finally {
      setIsSimulatingQA(false);
    }
  };

  // Move an implication card between Kanban columns
  const moveImperativeCard = (cardId, targetCol) => {
    setImperatives(prev => {
      const updated = {
        differentiation: prev.differentiation.filter(id => id !== cardId),
        payer_value: prev.payer_value.filter(id => id !== cardId),
        diagnostics: prev.diagnostics.filter(id => id !== cardId)
      };
      updated[targetCol].push(cardId);
      return updated;
    });
  };

  // Workshop cast vote helper
  const handleCastWorkshopVote = (theme) => {
    setWorkshopVotes(prev => ({
      ...prev,
      [theme]: prev[theme] + 1
    }));
  };

  // Drag-and-Drop mouse event handlers for collaborative workshop nodes
  const handleNodeMouseDown = (nodeId, e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveDragNode(nodeId);
    setDragStartOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!activeDragNode) return;
    e.preventDefault();
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    
    let newLeft = e.clientX - rect.left - dragStartOffset.x;
    let newTop = e.clientY - rect.top - dragStartOffset.y;
    
    // Constrain card boundaries inside the canvas grid
    const cardWidth = 240;
    const cardHeight = 75;
    newLeft = Math.max(10, Math.min(newLeft, rect.width - cardWidth - 10));
    newTop = Math.max(10, Math.min(newTop, rect.height - cardHeight - 10));
    
    setWorkshopNodes(prev => ({
      ...prev,
      [activeDragNode]: {
        ...prev[activeDragNode],
        left: newLeft,
        top: newTop
      }
    }));
  };

  const handleCanvasMouseUp = () => {
    setActiveDragNode(null);
  };

  // Helper to calculate smooth dynamic Bezier connection paths between moving cards
  const getDynamicLinkPath = (idA, idB) => {
    const nA = workshopNodes[idA];
    const nB = workshopNodes[idB];
    if (!nA || !nB) return "";
    
    // Card dimensions: width 240px, height ~75px. Get centers:
    const x1 = nA.left + 120;
    const y1 = nA.top + 37;
    const x2 = nB.left + 120;
    const y2 = nB.top + 37;
    
    // Quadratic Bezier curve pulling control point slightly up for a premium bend
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 20;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Agent-Identity': 'spiffe://itacs.merck.com/ns/production/sa/golt-coordinator'
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          session_id: ingestionSession
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (data.retrieved_context) setRetrievedContext(data.retrieved_context);
      } else {
        throw new Error("Chat call failed");
      }
    } catch (err) {
      console.error("Chat API failed, generating premium mock response.", err);
      
      const query = textToSend.toLowerCase();
      let reply = "";
      
      if (query.includes("payer") || query.includes("prior auth") || query.includes("reimbursement") || query.includes("coverage")) {
        reply = `### 💳 Strategic Payer Access & HEOR Analysis
Based on the **ITACS launch memory ledger**, we are tracking significant payer friction for both **Keytruda combination regimens** and the oral G12C inhibitor **MK-1084** in adjuvant settings:

#### 🚨 Key Access Threats:
- **Prior-Authorization Gating**: National payers (including Humana and UnitedHealth) are enforcing strict step-therapy protocols, requiring patients to fail standard monotherapy first.
- **Biomarker Gating**: Payers are demanding dual-biomarker confirmation (NGS + IHC) prior to approving oral combinations, creating up to 14 days of therapeutic initiation delay.

#### 🎯 Recommended Action Prompts:
- **HEOR Modeling**: Fast-track the publication of our **3-year Overall Survival (OS) data** showing a 22% therapeutic benefit advantage.
- **Risk-Sharing Contracts**: Deploy milestone-based rebate structures with top payer accounts to bypass the tier-3 step-therapy restrictions.`;
      } else if (query.includes("logistics") || query.includes("cold-chain") || query.includes("delivery") || query.includes("distribution")) {
        reply = `### 📦 Ultra-Cold Chain & Practice Logistics Analysis
Based on the **V940 personalized mRNA vaccine operational logs**, scaling outpatient vein-to-vein logistics remains a high-priority launch risk:

#### 🚨 Key Logistics Bottlenecks:
- **Practice Refrigeration Deficit**: Approximately **35% of community oncology practices** do not possess the necessary -70°C ultra-low temperature freezers to store custom mRNA vaccine vials.
- **Biopsy Turnaround Lag**: The average NGS diagnostic profiling turnaround is **14.5 days**, threatening the optimal 12-week post-surgery therapeutic window.

#### 🎯 Recommended Action Prompts:
- **Just-In-Time Loop**: Establish a 24-hour express courier routing system from regional central distribution depots.
- **Practice Infrastructure Support**: Fund a leased deep-freezer placement program targeting tier-1 community practices.`;
      } else if (query.includes("biomarker") || query.includes("diagnostic") || query.includes("screening") || query.includes("testing")) {
        reply = `### 🧬 Companion Diagnostic & Screening Optimization
Based on our **diagnostic excellence registry**, biomarker screening turnaround represents the critical path to initiating customized immunotherapies:

#### 🚨 Diagnostic Hurdles:
- **Tissue Exhaustion**: Tissue-sample exhaustion during standard NGS multiplexing prevents KRAS G12C mutation identification in **12% of advanced NSCLC biopsies**.
- **Pathology Backlog**: Regional hospital labs report a 3-week backlog for PD-L1 IHC testing, leading to patient drop-offs.

#### 🎯 Recommended Action Prompts:
- **Rapid IHC Deployment**: Co-develop and deploy a rapid, tissue-sparing IHC diagnostic panel at major commercial labs (Quest/Labcorp).
- **Reflex Testing Protocols**: Standardize immediate reflex testing at the time of surgical resection to ensure results are ready within 7 days.`;
      } else if (query.includes("competitor") || query.includes("pressure") || query.includes("wargaming") || query.includes("pembrolizumab")) {
        reply = `### ⚔️ Competitive Wargaming & Market Pressure Report
We are monitoring aggressive competitor moves designed to disrupt our first-line adjuvant oncology launches:

#### 🚨 Competitor Maneuvers:
- **Deep Rebate Rebating**: Competitors are offering a **30% retrospective rebate** on second-line targeted agents, creating severe economic hurdles for our first-line combinations.
- **Subcutaneous Acceleration**: Rival subcutaneous formulations are launching, threatening to lock in patient chair capacity through faster administration.

#### 🎯 Recommended Action Prompts:
- **Subcutaneous Acceleration**: Accelerate our own **Subcutaneous Keytruda formulation** which reduces chair administration time from 30 minutes to **5 minutes**.
- **Value Demonstration**: Structure interactive clinic budget-impact models highlighting a **20% daily throughput gain** for infusion suites.`;
      } else if (query.includes("executive summary") || query.includes("summary") || query.includes("presentation") || query.includes("golt")) {
        reply = `### 📋 GOLT Strategic Launch Executive Summary (March 2026)
This summary consolidates the active clinical, access, and operational vectors across the **ITACS Oncology Portfolio**:

#### 🌟 1. Strategic Differentiation
- **mRNA Vaccine Efficacy**: V940 + Keytruda shows a **44% reduction in recurrence risk** in stage III/IV melanoma. Focus remains on accelerating reflex biomarker testing.

#### 💳 2. Payer Value & Access
- **HEOR Evidence**: Demonstrating **20% clinic chair-time gains** via subcutaneous pembrolizumab. 
- **Combination Pricing**: Bypassing combination cost resistance through risk-sharing benchmark pricing models.

#### 📦 3. Diagnostic & Logistics Integrity
- **Logistics**: Relieving community clinic refrigeration gaps through leased -70°C freezers.
- **Diagnostics**: Mitigating NGS tissue exhaustion through rapid IHC companion assay deployment.`;
      } else {
        reply = `### 🤖 Strategic Launch Advisor Synthesis
Based on the **ITACS Enterprise Memory**, I have synthesized a strategic assessment for your query:

#### 🌟 Key Launch Observations:
- **Functional Alignment**: Market Access and Medical Affairs are currently managing **2 active drafts** and **1 open conflict** regarding combination therapy pricing thresholds.
- **Indication Focus**: Our core focus is accelerating first-line adoption across Stage III/IV Melanoma, HPV-negative Head & Neck, and G12C Lung Cancer.

#### 🎯 Suggested Follow-up Prompts:
- *What changed in payer coverage timelines since last week?*
- *How do we reduce community oncology adoption lag for mRNA vaccines?*
- *Simulate competitive pressure from pan-KRAS inhibitors in Lung Cancer.*`;
      }
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }, 750);
    } finally {
      setChatLoading(false);
    }
  };

  const getFunctionBadgeClass = (lane) => {
    switch (lane) {
      case 'Market Research': return 'mr';
      case 'Medical Affairs': return 'ma';
      case 'Market Access': return 'access';
      case 'Competitive Intelligence': return 'ci';
      default: return '';
    }
  };

  const filteredInsights = insights.filter(ins => {
    const matchesSearch = 
      ins.opportunity_space.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.insight.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.metadata.tumor.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesLane = filterLane === "All Functions" || ins.metadata.function_lane === filterLane;
    const matchesAsset = filterAsset === "All Assets" || ins.metadata.asset === filterAsset;
    
    return matchesSearch && matchesLane && matchesAsset;
  });

  const highlightText = (text, query) => {
    if (!text) return "";
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} style={{ background: '#2563eb', color: 'white', borderRadius: '2px', padding: '0 2px', fontWeight: 600 }}>{part}</mark> 
        : part
    );
  };

  const handleVerifyCitation = (cardId) => {
    const target = insights.find(i => i.id === cardId);
    if (target) {
      setSelectedInsight(target);
      setActiveTab('matrix');
      setDetailTab('grounding');
    } else {
      alert(`Source card ${cardId} not found in the local cache.`);
    }
  };

  const handleAuditNodeClick = (log) => {
    setSelectedAuditDrawerLog(log);
    setIsAuditDrawerOpen(true);
  };

  const parseBoldAndCitations = (text) => {
    if (!text) return "";
    
    const parts = text.split('**');
    const boldParsed = parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={`b-${i}`} style={{ color: 'white', fontWeight: 800 }}>{part}</strong>;
      }
      return part;
    });

    const finalElements = [];
    boldParsed.forEach((item, itemIdx) => {
      if (typeof item === 'string') {
        const verifyRegex = /\[Verify:\s*(.*?)\]/g;
        if (verifyRegex.test(item)) {
          const splitParts = item.split(verifyRegex);
          splitParts.forEach((subPart, subIdx) => {
            if (subIdx % 2 === 1) {
              finalElements.push(
                <button 
                  key={`btn-${itemIdx}-${subIdx}`}
                  onClick={() => handleVerifyCitation(subPart.trim())}
                  style={{ 
                    background: 'rgba(34, 211, 238, 0.15)', 
                    border: '1px solid rgba(6, 182, 212, 0.3)', 
                    color: '#22d3ee', 
                    borderRadius: '4px', 
                    padding: '2px 6px', 
                    fontSize: '9px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '2px', 
                    marginLeft: '4px',
                    marginRight: '4px',
                    transition: 'all 0.2s'
                  }}
                  title="Cross-reference original slide and quotes"
                >
                  <Eye size={8} /> Verify Source
                </button>
              );
            } else {
              if (subPart) finalElements.push(subPart);
            }
          });
        } else {
          if (item) finalElements.push(item);
        }
      } else {
        finalElements.push(item);
      }
    });

    return finalElements;
  };

  const renderMessageContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    let inList = false;
    const elements = [];
    let listItems = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (!trimmed.startsWith('-') && inList) {
        elements.push(
          <ul key={`list-${idx}`} style={{ marginLeft: '20px', marginBottom: '12px', listStyleType: 'disc' }}>
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--brand-indigo)', fontSize: '15px', fontWeight: 800 }}>
            {parseBoldAndCitations(trimmed.substring(4))}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} style={{ marginTop: '12px', marginBottom: '6px', color: 'var(--brand-cyan)', fontSize: '13.5px', fontWeight: 700 }}>
            {parseBoldAndCitations(trimmed.substring(5))}
          </h4>
        );
      } else if (trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(
          <li key={`li-${idx}`} style={{ marginBottom: '6px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
            {parseBoldAndCitations(trimmed.substring(2))}
          </li>
        );
      } else if (trimmed === '') {
        // Skip empty lines
      } else {
        elements.push(
          <p key={idx} style={{ marginBottom: '10px', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
            {parseBoldAndCitations(trimmed)}
          </p>
        );
      }
    });

    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="list-final" style={{ marginLeft: '20px', marginBottom: '12px', listStyleType: 'disc' }}>
          {listItems}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="app-layout">
      
      {/* PERSISTENT LEFT-HAND NAVIGATION SIDEBAR */}
      <aside className="sidebar-navigation">
        <div className="sidebar-brand">
          <div className="brand-badge">🧬</div>
          <div className="brand-text">
            <h1>ITACS Enterprise</h1>
            <p>Global Oncology Command</p>
          </div>
        </div>

        {/* SCROLLABLE MIDDLE NAVIGATION LINKS DOCK */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }} className="sidebar-scroll-container">
          <div className="nav-group">
          <span className="nav-group-title">Command & Interrogate</span>
          <button 
            onClick={() => setActiveTab('cockpit')}
            className={`sidebar-nav-btn ${activeTab === 'cockpit' ? 'active' : ''}`}
          >
            <Sparkles size={16} /> Launch Cockpit
          </button>
          <button 
            onClick={() => setActiveTab('cascade')}
            className={`sidebar-nav-btn ${activeTab === 'cascade' ? 'active' : ''}`}
          >
            <Calendar size={16} style={{ color: 'var(--brand-cyan)' }} /> Indication Roadmap
          </button>
          <button 
            onClick={() => setActiveTab('wargaming')}
            className={`sidebar-nav-btn ${activeTab === 'wargaming' ? 'active' : ''}`}
          >
            <Play size={16} style={{ color: 'var(--brand-purple)' }} /> Competitive Wargaming
          </button>
          <button 
            onClick={() => setActiveTab('radar')}
            className={`sidebar-nav-btn ${activeTab === 'radar' ? 'active' : ''}`}
          >
            <Eye size={16} style={{ color: 'var(--brand-cyan)' }} /> Global Market Radar
          </button>
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`sidebar-nav-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          >
            <ClipboardList size={16} /> Workstream Tracker
          </button>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Collaborate & Validate</span>
          <button 
            onClick={() => setActiveTab('matrix')}
            className={`sidebar-nav-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          >
            <Layers size={16} /> Commercial Matrix
          </button>
          <button 
            onClick={() => setActiveTab('builder')}
            className={`sidebar-nav-btn ${activeTab === 'builder' ? 'active' : ''}`}
          >
            <Plus size={16} /> Imperative Builder
          </button>
          <button 
            onClick={() => setActiveTab('workshop')}
            className={`sidebar-nav-btn ${activeTab === 'workshop' ? 'active' : ''}`}
          >
            <Users size={16} /> Live Workshop
          </button>
          <button 
            onClick={() => setActiveTab('kol')}
            className={`sidebar-nav-btn ${activeTab === 'kol' ? 'active' : ''}`}
          >
            <Users size={16} style={{ color: 'var(--brand-cyan)' }} /> Stakeholder Engagement
          </button>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Deliverables</span>
          <button 
            onClick={() => setActiveTab('deck')}
            className={`sidebar-nav-btn ${activeTab === 'deck' ? 'active' : ''}`}
          >
            <FileText size={16} style={{ color: 'var(--brand-blue)' }} /> Executive Deck Studio
          </button>
          <button 
            onClick={() => setActiveTab('budget')}
            className={`sidebar-nav-btn ${activeTab === 'budget' ? 'active' : ''}`}
          >
            <PieChart size={16} style={{ color: 'var(--brand-purple)' }} /> Budget Strategy
          </button>
          <button 
            onClick={() => setActiveTab('roleplay')}
            className={`sidebar-nav-btn ${activeTab === 'roleplay' ? 'active' : ''}`}
          >
            <BookOpen size={16} style={{ color: 'var(--brand-blue)' }} /> Execution Readiness
          </button>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Govern & Control</span>
          <button 
            onClick={() => setActiveTab('ingest')}
            className={`sidebar-nav-btn ${activeTab === 'ingest' ? 'active' : ''}`}
          >
            <Database size={16} /> Ingestion Factory
          </button>
          <button 
            onClick={() => setActiveTab('logistics')}
            className={`sidebar-nav-btn ${activeTab === 'logistics' ? 'active' : ''}`}
          >
            <Activity size={16} style={{ color: 'var(--brand-purple)' }} /> Manufacturing Readiness
          </button>
          <button 
            onClick={() => setActiveTab('skills')}
            className={`sidebar-nav-btn ${activeTab === 'skills' ? 'active' : ''}`}
          >
            <Settings size={16} style={{ color: 'var(--brand-cyan)' }} /> Agent Skill Studio
          </button>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Demo & Showcase</span>
          <button 
            onClick={() => setActiveTab('theater')}
            className={`sidebar-nav-btn ${activeTab === 'theater' ? 'active' : ''}`}
            style={{ 
              background: activeTab === 'theater' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', 
              border: activeTab === 'theater' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
            }}
          >
            <Play size={16} style={{ color: 'var(--brand-purple)' }} fill={activeTab === 'theater' ? 'var(--brand-purple)' : 'none'} /> Simulation Theater
          </button>
        </div>
        </div>

        {/* THEME TOGGLE DOCK */}
        <div style={{ marginTop: 'auto', padding: '0 8px', marginBottom: '16px' }}>
          <button 
            onClick={toggleTheme}
            className="sidebar-nav-btn"
            style={{ width: '100%', justifyContent: 'flex-start', gap: '10px' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={16} style={{ color: '#f59e0b' }} /> Light Theme Mode
              </>
            ) : (
              <>
                <Moon size={16} style={{ color: '#818cf8' }} /> Dark Theme Mode
              </>
            )}
          </button>
        </div>

        {/* User Footer Profile */}
        <div className="sidebar-footer">
          <div className="footer-avatar">GL</div>
          <div className="footer-user-info">
            <h5>GOLT Team Lead</h5>
            <p>Merck Oncology HQ</p>
          </div>
        </div>
      </aside>

      {/* Main content display section */}
      <div className="main-content-area">

        {/* UNIFIED PREMIUM STICKY HEADER BAR */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(12px)',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
              <span>ITACS Platform</span>
              <span>/</span>
              <span style={{ color: 'var(--brand-cyan)' }}>
                {activeTab === 'cockpit' && 'Command & Interrogate'}
                {activeTab === 'cascade' && 'Command & Interrogate'}
                {activeTab === 'wargaming' && 'Command & Interrogate'}
                {activeTab === 'radar' && 'Command & Interrogate'}
                {activeTab === 'tracker' && 'Command & Interrogate'}
                {activeTab === 'matrix' && 'Collaborate & Validate'}
                {activeTab === 'builder' && 'Collaborate & Validate'}
                {activeTab === 'workshop' && 'Collaborate & Validate'}
                {activeTab === 'kol' && 'Collaborate & Validate'}
                {activeTab === 'deck' && 'Deliverables'}
                {activeTab === 'budget' && 'Deliverables'}
                {activeTab === 'roleplay' && 'Deliverables'}
                {activeTab === 'ingest' && 'Govern & Control'}
                {activeTab === 'logistics' && 'Govern & Control'}
                {activeTab === 'skills' && 'Govern & Control'}
                {activeTab === 'theater' && 'Demo & Showcase'}
              </span>
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>
              {activeTab === 'cockpit' && 'Launch Cockpit'}
              {activeTab === 'cascade' && 'Indication Roadmap'}
              {activeTab === 'wargaming' && 'Competitive Wargaming'}
              {activeTab === 'radar' && 'Global Market Radar'}
              {activeTab === 'tracker' && 'Workstream Tracker'}
              {activeTab === 'matrix' && 'Commercial Matrix'}
              {activeTab === 'builder' && 'Imperative Builder'}
              {activeTab === 'workshop' && 'Live Workshop'}
              {activeTab === 'kol' && 'Stakeholder Engagement'}
              {activeTab === 'deck' && 'Executive Deck Studio'}
              {activeTab === 'budget' && 'Budget Strategy'}
              {activeTab === 'roleplay' && 'Execution Readiness'}
              {activeTab === 'ingest' && 'Ingestion Factory'}
              {activeTab === 'logistics' && 'Manufacturing Readiness'}
              {activeTab === 'skills' && 'Agent Skill Studio'}
              {activeTab === 'theater' && 'Simulation Theater'}
            </h2>
          </div>

          {/* Right side connection / status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '10px',
              color: '#a7f3d0',
              fontWeight: 'bold'
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>CONNECTED: PIPELINE V1.3.1</span>
            </div>
            
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>User:</span>
              <strong style={{ color: 'var(--text-primary)' }}>HQ Ops (Jersey)</strong>
            </div>
          </div>
        </header>

        {/* BRAND PLANNING MACRO-TIMELINE (L3Next Milestone Windows) */}
        {activeTab === 'cockpit' && (
          <div className="lifecycle-timeline-container">
            <div className="timeline-header">
              <h3>Oncology Brand Launch Planning Lifecycle</h3>
              <div className="timeline-active-badge">
                <div className="pulse-dot" />
                <span>ACTIVE PHASE: CROSS-FUNCTIONAL SYNTHESIS</span>
              </div>
            </div>
            
            <div className="timeline-steps-row">
              <div className="timeline-progress-bar">
                <div className="timeline-progress-fill" style={{ width: '50%' }} />
              </div>

              <div className="timeline-step-node completed">
                <div className="step-node-circle">✔</div>
                <div className="step-node-label">
                  <h4>Ingestion & Mapping</h4>
                  <p>Sept - Oct 2026</p>
                </div>
              </div>

              <div className="timeline-step-node active">
                <div className="step-node-circle">02</div>
                <div className="step-node-label">
                  <h4>Thematic Synthesis</h4>
                  <p>Nov 2026 - Jan 2027</p>
                </div>
              </div>

              <div className="timeline-step-node">
                <div className="step-node-circle">03</div>
                <div className="step-node-label">
                  <h4>GOLT Presentation Ready</h4>
                  <p>Feb - Mar 2027</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: LAUNCH COCKPIT (THE EXECUTIVE COMMAND HUB) */}
        {activeTab === 'cockpit' && (
          <main className="cockpit-layout animate-fade-in">
            
            {/* Left Column: Scorecard & Themes */}
            <div className="cockpit-left">
              
              {/* STRIPE/LINEAR STYLE ACCENTED TELEMETRY CARDS */}
              <div className="scorecard-grid">
                <div className="metric-card has-success">
                  <span className="metric-val blue">{validatedMemoryCount}</span>
                  <span className="metric-label">Validated Memory</span>
                </div>
                <div className={`metric-card ${activeDraftsCount > 0 ? 'has-warning' : ''}`}>
                  <span className="metric-val amber">{activeDraftsCount}</span>
                  <span className="metric-label">Active Drafts</span>
                </div>
                <div className={`metric-card ${openConflictsCount > 0 ? 'has-danger' : ''}`}>
                  <span className="metric-val red">{openConflictsCount}</span>
                  <span className="metric-label">Open Conflicts</span>
                </div>
              </div>

              <div className="glass-card">
                <h3 className="glass-card-title">
                  <Sparkles size={16} style={{ color: '#60a5fa' }} /> Launch Themes & Strategic Risks
                </h3>
                <div className="themes-scroller">
                  {themes.map((theme, idx) => (
                    <div 
                      key={idx} 
                      className="theme-item"
                      onClick={() => handleSendMessage(`Analyze the launch implications and strategic risks of theme: "${theme.theme_name}"`)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      title="Click to ask the Strategic Advisor to analyze this launch theme"
                    >
                      <div className="theme-item-header">
                        <h4>{theme.theme_name}</h4>
                        <span className="theme-score">Weight: {theme.theme_score}</span>
                      </div>
                      <p>{theme.executive_synthesis}</p>
                      <div className="theme-meta-chips">
                        {theme.contributing_functions.map((fn, fIdx) => (
                          <span key={fIdx} className="meta-chip">{fn}</span>
                        ))}
                        <span className="meta-chip" style={{ color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)' }}>
                          {theme.opportunity_spaces[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card">
                <h3 className="glass-card-title">
                  <AlertTriangle size={16} style={{ color: '#ef4444' }} /> Active Alignments (Conflicts Room)
                </h3>
                <div className="themes-scroller" style={{ maxHeight: '220px' }}>
                  {conflicts.map(conf => (
                    <div 
                      key={conf.id} 
                      className="theme-item" 
                      style={{ borderLeft: '3px solid #ef4444', cursor: 'pointer' }}
                      onClick={() => {
                        setActiveTab('workshop');
                        alert(`Consensus Hub: Directing you to the Live Workshop to resolve conflict: "${conf.conflict_type}". Cast your anonymous team vote to lock consensus!`);
                      }}
                      title="Click to resolve this disagreement inside the Live Workshop Consensus board"
                    >
                      <div className="theme-item-header">
                        <h4 style={{ color: '#fca5a5', fontSize: '11px' }}>{conf.conflict_type}</h4>
                        <span className="theme-score" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>FLAGGED</span>
                      </div>
                      <p style={{ fontSize: '10px' }}>{conf.description}</p>
                      <div className="drawer-actions" style={{ justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button 
                          className="btn btn-primary"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 10px', fontSize: '9px', pointerEvents: 'none' }}
                        >
                          Resolve in Workshop
                        </button>
                      </div>
                    </div>
                  ))}
                  {conflicts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px', fontSize: '11px', color: '#64748b' }}>
                      No outstanding alignment conflicts. Full consensus achieved!
                    </div>
                  )}
                </div>
              </div>

              {/* Balances Grid: Truth Ledger & Recent System Activity */}
              <div className="glass-card" style={{ marginTop: '16px' }}>
                <h3 className="glass-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} style={{ color: 'var(--brand-cyan)' }} /> Truth Ledger & System Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                  {[
                    { id: 1, agent: 'Medical Affairs Agent', text: 'Validated clinical efficacy implication for Opportunity-1', time: '2 mins ago', color: '#10b981' },
                    { id: 2, agent: 'Market Access Agent', text: 'Flagged a payer contradiction on step-therapy CSF-3', time: '14 mins ago', color: '#f59e0b' },
                    { id: 3, agent: 'Ingestion Pipeline', text: 'Synchronized 14 new clinical deck slides from Veeva Vault', time: '1 hour ago', color: '#06b6d4' }
                  ].map(act => (
                    <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: act.color, display: 'block', letterSpacing: '0.5px' }}>
                          {act.agent}
                        </span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{act.text}</p>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Grounded Strategic Chat Advisor */}
            <div className="cockpit-right">
              <div className="glass-card chat-container">
                <div className="drawer-header" style={{ marginBottom: '14px' }}>
                  <div className="drawer-header-title">
                    <h3>Strategic Launch Advisor</h3>
                    <p>Grounded strictly in validated OKF Memory. Powered by Gemini 1.5 Pro.</p>
                  </div>
                  <div className="chat-header-status">
                    <div className="chat-dot" />
                    <span>Interactive Memory</span>
                  </div>
                </div>

                {/* Messages Viewport */}
                <div className="chat-viewport" ref={chatContainerRef}>
                  {chatMessages.length === 1 ? (
                    
                    /* PROACTIVE INTELLIGENCE WIDGETS */
                    <div className="proactive-advisor-canvas proactive-mode animate-fade-in">
                      <div className="proactive-canvas-header">
                        <h4>Strategic Command Intelligence</h4>
                        <p>Select a proactive readout or simulate competitive pressure to begin.</p>
                      </div>

                      <div className="proactive-widgets-grid">
                        <div 
                          onClick={() => handleSendMessage("What changed in payer coverage timelines since last week?")}
                          className="proactive-widget-card"
                        >
                          <div className="widget-card-header alert">
                            <AlertTriangle size={12} />
                            <h5>What changed since last week?</h5>
                          </div>
                          <p>Payer hurdles on KRAS G12C combinations are increasing. Click to evaluate access threats.</p>
                        </div>

                        <div 
                          onClick={() => handleSendMessage("Simulate competitive pressure from pan-KRAS inhibitors in Lung Cancer.")}
                          className="proactive-widget-card"
                        >
                          <div className="widget-card-header trend">
                            <Sparkles size={12} />
                            <h5>Simulate Competitor Pressure</h5>
                          </div>
                          <p>Analyze pre-mixed monotherapies threatening our personalized vaccine timelines.</p>
                        </div>
                      </div>

                      <div className="prompt-chips-wrapper" style={{ marginTop: '20px' }}>
                        <span className="prompt-chips-header">Launch Action Prompts</span>
                        <button 
                          onClick={() => handleSendMessage("Generate GOLT Executive Summary for March presentation.")}
                          className="prompt-suggestion-btn"
                        >
                          → Generate Executive Summary for March GOLT presentation
                        </button>
                        <button 
                          onClick={() => handleSendMessage("How do we reduce community oncology adoption lag for mRNA vaccines?")}
                          className="prompt-suggestion-btn"
                        >
                          → Analyze community oncology operational hubs
                        </button>
                      </div>
                    </div>
                  ) : (
                    
                    /* Regular chat message streams */
                    chatMessages.map((msg, index) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div 
                          key={index}
                          className={`chat-bubble-row ${isUser ? 'user' : 'assistant'}`}
                        >
                          <div className={`chat-bubble-avatar ${isUser ? 'user' : 'assistant'}`}>
                            {isUser ? 'ME' : '🤖'}
                          </div>
                          
                          <div className="chat-speech-bubble">
                            {renderMessageContent(msg.content)}

                            {!isUser && index === chatMessages.length - 1 && (
                              <div className="prompt-chips-wrapper" style={{ marginTop: '14px' }}>
                                <span className="prompt-chips-header" style={{ fontSize: '9px', fontWeight: 700, color: 'var(--brand-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                  Suggested Next Actions
                                </span>
                                
                                {(() => {
                                  const contentLower = msg.content.toLowerCase();
                                  if (contentLower.includes("payer") || contentLower.includes("prior auth") || contentLower.includes("reimbursement") || contentLower.includes("access")) {
                                    return (
                                      <>
                                        <button 
                                          onClick={() => handleSendMessage("Run a simulation on payer prior authorization friction thresholds for customized immunotherapies.")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → Simulate payer prior authorization friction thresholds
                                        </button>
                                        <button 
                                          onClick={() => handleSendMessage("Analyze the operational flowchart for regional delivery hubs to reduce community oncology lag.")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → Analyze community operational delivery hubs
                                        </button>
                                      </>
                                    );
                                  } else if (contentLower.includes("logistics") || contentLower.includes("cold-chain") || contentLower.includes("delivery") || contentLower.includes("infrastructure")) {
                                    return (
                                      <>
                                        <button 
                                          onClick={() => handleSendMessage("Analyze the operational flowchart for regional delivery hubs to reduce community oncology lag.")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → Analyze community operational delivery hubs
                                        </button>
                                        <button 
                                          onClick={() => handleSendMessage("What changed in payer coverage timelines since last week?")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → Evaluate access threats and step-therapy gating
                                        </button>
                                      </>
                                    );
                                  } else if (contentLower.includes("executive summary") || contentLower.includes("summary") || contentLower.includes("presentation") || contentLower.includes("golt")) {
                                    return (
                                      <>
                                        <button 
                                          onClick={() => handleSendMessage("What changed in payer coverage timelines since last week?")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → Evaluate access threats and step-therapy gating
                                        </button>
                                        <button 
                                          onClick={() => handleSendMessage("Simulate competitive pressure from pan-KRAS inhibitors in Lung Cancer.")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → Simulate competitive wargaming pressure in Lung Cancer
                                        </button>
                                      </>
                                    );
                                  } else {
                                    return (
                                      <>
                                        <button 
                                          onClick={() => handleSendMessage("What changed in payer coverage timelines since last week?")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → What changed in payer coverage timelines since last week?
                                        </button>
                                        <button 
                                          onClick={() => handleSendMessage("Simulate competitive pressure from pan-KRAS inhibitors in Lung Cancer.")}
                                          className="prompt-suggestion-btn"
                                        >
                                          → Simulate competitive wargaming pressure in Lung Cancer
                                        </button>
                                      </>
                                    );
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {chatLoading && (
                    <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center', margin: '8px 0' }}>
                      <RefreshCw className="animate-spin" size={12} style={{ color: '#3b82f6' }} />
                      Grounded advisor synthesizing oncology plans...
                    </div>
                  )}

                </div>

                {/* Grounding Context */}
                {retrievedContext.length > 0 && (
                  <div className="chat-grounding-chips">
                    <div className="grounding-header">
                      <Database size={12} /> Grounded Source Cards ({retrievedContext.length})
                    </div>
                    <div className="grounding-scroller">
                      {retrievedContext.map((c, i) => (
                        <span key={i} className="grounding-pill" onClick={() => handleVerifyCitation(c.id)} style={{ cursor: 'pointer' }}>
                          {c.metadata.asset} {c.metadata.tumor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="chat-input-row">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about clinical adoption, access barriers, or competitive timeline alignment..."
                    className="chat-text-input"
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={chatLoading}
                    className="chat-send-icon-btn"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

          </main>
        )}

        {/* TAB 2: COMMERCIAL MATRIX (CROSS-FUNCTIONAL REVIEW GRID) */}
        {activeTab === 'matrix' && (
          <main className="matrix-layout animate-fade-in">
            
            <div className="matrix-left">
              <div className="matrix-toolbar">
                <input 
                  type="text" 
                  placeholder="Search Opportunity Spaces, Insights, or Tumors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="matrix-search"
                />

                <div className="matrix-filters">
                  <select 
                    value={filterLane} 
                    onChange={(e) => setFilterLane(e.target.value)}
                    className="matrix-select-filter"
                  >
                    <option>All Functions</option>
                    <option>Market Research</option>
                    <option>Medical Affairs</option>
                    <option>Market Access</option>
                    <option>Competitive Intelligence</option>
                  </select>

                  <select 
                    value={filterAsset} 
                    onChange={(e) => setFilterAsset(e.target.value)}
                    className="matrix-select-filter"
                  >
                    <option>All Assets</option>
                    <option>V940</option>
                    <option>MK-1084</option>
                    <option>Keytruda</option>
                  </select>
                </div>
              </div>

              <div className="matrix-grid">
                {filteredInsights.map(ins => {
                  const isSelected = selectedInsight && selectedInsight.id === ins.id;
                  const laneClass = getFunctionBadgeClass(ins.metadata.function_lane);
                  
                  // AAA Status pills (low opacity bg, desaturated contrasting text)
                  let statusClass = "flagged";
                  let statusText = "DRAFT REVIEW";
                  if (ins.is_validated) { statusClass = "memory"; statusText = "MEMORY"; }
                  else if (ins.is_quarantined) { statusClass = "quarantine"; statusText = "QUARANTINE"; }

                  return (
                    <div 
                      key={ins.id}
                      onClick={() => setSelectedInsight(ins)}
                      className={`matrix-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="matrix-card-header">
                        <span className={`matrix-lane-tag ${laneClass}`}>{ins.metadata.function_lane}</span>
                        <span className={`status-pill ${statusClass}`}>{statusText}</span>
                      </div>

                      <div className="matrix-card-body">
                        <h4>{highlightText(ins.opportunity_space, searchTerm)}</h4>
                        <p style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {highlightText(ins.insight, searchTerm)}
                        </p>
                      </div>

                      <div className="matrix-card-footer">
                        <span>Asset: <strong>{ins.metadata.asset}</strong> ({ins.metadata.tumor})</span>
                        <span>Compliance: <strong style={{ color: ins.compliance_score >= 0.8 ? '#34d399' : '#ef4444' }}>{Math.round(ins.compliance_score * 100)}%</strong></span>
                      </div>
                    </div>
                  );
                })}

                {/* PREMIUM SKELETON CARD EMPTY STATE LAYOUT */}
                {filteredInsights.length === 0 && (
                  <div className="skeleton-card-grid" style={{ gridColumn: '1/-1' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="skeleton-card">
                        <div className="skeleton-header">
                          <div className="skeleton-badge" />
                          <div style={{ width: '40px', height: '8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '2px' }} />
                        </div>
                        <div className="skeleton-title" />
                        <div className="skeleton-line medium" />
                        <div className="skeleton-line short" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: '4px' }}>
                          <div style={{ width: '50px', height: '8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '2px' }} />
                          <div style={{ width: '30px', height: '8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Source Verification & Details Drawer */}
            {selectedInsight && (
              <div className="matrix-right-drawer">
                <div className="glass-card" style={{ height: '100%' }}>
                  <div className="drawer-header" style={{ marginBottom: '10px' }}>
                    <div className="drawer-header-title">
                      <h3>ITACS Card Validation</h3>
                      <p>Validate the extracted fields and review compliance gating.</p>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                    <div className="nav-tabs" style={{ marginBottom: '16px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <button 
                      onClick={() => setDetailTab('framework')} 
                      className={`tab-btn ${detailTab === 'framework' ? 'active' : ''}`}
                      style={{ fontSize: '9px', padding: '6px 12px', flex: 1, justifyContent: 'center' }}
                    >
                      ITACS Framework
                    </button>
                    <button 
                      onClick={() => setDetailTab('grounding')} 
                      className={`tab-btn ${detailTab === 'grounding' ? 'active' : ''}`}
                      style={{ fontSize: '9px', padding: '6px 12px', flex: 1, justifyContent: 'center' }}
                    >
                      Slide Grounding
                    </button>
                    <button 
                      onClick={() => setDetailTab('audit')} 
                      className={`tab-btn ${detailTab === 'audit' ? 'active' : ''}`}
                      style={{ fontSize: '9px', padding: '6px 12px', flex: 1, justifyContent: 'center' }}
                    >
                      Compliance & History
                    </button>
                  </div>

                  {/* CHEVRON/CASCADE INTERCONNECTED FLOW MATRIX */}
                  {detailTab === 'framework' && (
                    <div className="cascade-flow-matrix animate-fade-in">
                      
                      <div className="cascade-flow-node">
                        <div className="cascade-node-marker" />
                        <div className="cascade-node-content">
                          <label>1. Opportunity Space</label>
                          <textarea 
                            rows={2}
                            value={editOpportunity}
                            onChange={(e) => setEditOpportunity(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="cascade-flow-node">
                        <div className="cascade-node-marker" />
                        <div className="cascade-node-content">
                          <label>2. Critical Success Factor (CSF)</label>
                          <textarea 
                            rows={2}
                            value={editCSF}
                            onChange={(e) => setEditCSF(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="cascade-flow-node">
                        <div className="cascade-node-marker" />
                        <div className="cascade-node-content">
                          <label>3. What (Strategic Insight)</label>
                          <textarea 
                            rows={3}
                            value={editInsight}
                            onChange={(e) => setEditInsight(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="cascade-flow-node">
                        <div className="cascade-node-marker" />
                        <div className="cascade-node-content">
                          <label>4. Why (Rationale & Evidence)</label>
                          <textarea 
                            rows={3}
                            value={editRationale}
                            onChange={(e) => setEditRationale(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="cascade-flow-node">
                        <div className="cascade-node-marker" />
                        <div className="cascade-node-content">
                          <label>5. Implication & Recommendation</label>
                          <textarea 
                            rows={3}
                            value={editImplication}
                            onChange={(e) => setEditImplication(e.target.value)}
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Sub-Tab 2: Slide Grounding */}
                  {detailTab === 'grounding' && (
                    <div className="verification-tabs-box animate-fade-in" style={{ borderTop: 'none', paddingTop: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="mock-slide-box" style={{ padding: '24px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <div className="slide-headline-indicator" style={{ width: '80px', height: '6px' }} />
                          <div style={{ height: '6px', width: '24px', background: '#1e293b', borderRadius: '2px' }} />
                        </div>

                        <div className="slide-bounding-tile-cyan" style={{ padding: '8px 12px', borderLeft: '3px solid #06b6d4', marginBottom: '10px' }}>
                          <span style={{ background: '#06b6d4', color: '#06080d', fontSize: '9.5px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '3px', display: 'inline-block', marginBottom: '6px', letterSpacing: '0.5px' }}>OCR COORDINATES BLOCK</span>
                          <p style={{ fontSize: '12.5px', fontWeight: 700, margin: 0, color: 'white', lineHeight: '1.4' }}>"{selectedInsight.quotes[0]?.text || "Logistics are complex."}"</p>
                        </div>

                        <div className="slide-bounding-tile-purple" style={{ padding: '8px 12px', borderLeft: '3px solid #c084fc' }}>
                          <span style={{ background: '#c084fc', color: 'white', fontSize: '9.5px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '3px', display: 'inline-block', marginBottom: '6px', letterSpacing: '0.5px' }}>CHART TEXT FIELD</span>
                          <p style={{ fontSize: '12.5px', color: '#c084fc', margin: 0, fontWeight: 700, lineHeight: '1.4' }}>"Preventing recurrence through personalized therapies offsets advanced cost."</p>
                        </div>

                        <div className="slide-footer-coords" style={{ marginTop: '16px', fontSize: '10px', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                          <span>SOURCE: {selectedInsight.slide_reference}</span>
                          <span>COORDS: [x: 104, y: 342, w: 590, h: 120]</span>
                        </div>
                      </div>

                      <div>
                        <span className="verification-heading" style={{ display: 'block', fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '8px' }}>Verbatim Slide Grounding</span>
                        {selectedInsight.quotes.map((q, i) => (
                          <div key={i} className="verbatim-container" style={{ marginTop: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '14px 18px', borderRadius: '10px' }}>
                            <p className="italic" style={{ fontSize: '13.5px', margin: 0, lineHeight: '1.5', color: 'var(--text-primary)' }}>"{q.text}"</p>
                            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--brand-cyan)', marginTop: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>— Grounded Area: {q.location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 3: Compliance & Memory Bank Timeline */}
                  {detailTab === 'audit' && (
                    <div className="verification-tabs-box animate-fade-in" style={{ borderTop: 'none', paddingTop: 0, gap: '16px', display: 'flex', flexDirection: 'column', maxHeight: '520px', overflowY: 'auto' }}>
                      <div className="compliance-metric-row" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'center', marginTop: '10px', border: '1px solid var(--glass-border)' }}>
                        <div className="compliance-donut" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3.5px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{Math.round(selectedInsight.compliance_score * 100)}%</span>
                        </div>
                        <div className="compliance-donut-text">
                          <h5 style={{ fontSize: '11.5px', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Compliance Verification Gating</h5>
                          <p style={{ fontSize: '9.5px', margin: '4px 0 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {selectedInsight.compliance_score >= 0.8
                              ? "APPROVED: Cleared for scientific exchange."
                              : "QUARANTINED: Contains non-compliant commercial terms."}
                          </p>
                        </div>
                      </div>

                      {/* SYSTEM OF RECORD: IMMUTABLE MEMORY BANK LEDGER TIMELINE */}
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>
                          📁 System of Record: Agent Memory Bank
                        </span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid var(--glass-border)', paddingLeft: '16px', marginLeft: '8px', position: 'relative' }}>
                          {activeRevisions.map((rev, rIdx) => (
                            <div key={rIdx} style={{ position: 'relative', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)' }}>
                              {/* Glowing dot for revision step */}
                              <div style={{ position: 'absolute', left: '-21px', top: '16px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-cyan)', border: '2px solid var(--bg-canvas)', boxShadow: '0 0 6px var(--brand-cyan)' }} />
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800 }}>Version {rev.version} {rev.version === 1 ? '(Genesis)' : '(SME Edit)'}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{new Date(rev.created_at).toLocaleTimeString()}</span>
                              </div>
                              <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{rev.change_summary}</p>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                                <span>Identity: <strong style={{ color: 'var(--text-primary)' }}>{rev.modified_by.substring(rev.modified_by.lastIndexOf('/') + 1)}</strong></span>
                                <span style={{ fontFamily: 'monospace', color: 'var(--brand-cyan)' }}>Hash: {rev.row_hash.substring(0, 20)}...</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {showConflictForm && (
                    <div className="conflict-flag-box" style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '14px', borderRadius: '12px' }}>
                      <h4 className="conflict-flag-title" style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px 0', fontSize: '12px' }}>
                        <AlertTriangle size={14} /> Flag Analytical Disagreement
                      </h4>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Conflict Type</label>
                        <select 
                          value={conflictType} 
                          onChange={(e) => setConflictType(e.target.value)}
                          className="form-select"
                          style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '6px', borderRadius: '6px', fontSize: '10px', width: '100%', outline: 'none' }}
                        >
                          <option>Inter-Functional Divergence</option>
                          <option>Timeline Contradiction</option>
                          <option>Decay Discrepancy</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Disagreement Details</label>
                        <textarea 
                          rows={2}
                          value={conflictDesc}
                          onChange={(e) => setConflictDesc(e.target.value)}
                          placeholder="Describe the opposing timelines or research discrepancies..."
                          className="form-textarea"
                          style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '6px', borderRadius: '6px', fontSize: '10px', width: '100%', resize: 'none', outline: 'none' }}
                        />
                      </div>
                      <div className="drawer-actions" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button onClick={() => setShowConflictForm(false)} className="btn btn-subtle">Cancel</button>
                        <button onClick={handleFlagContradiction} className="btn btn-primary" style={{ background: '#ef4444' }}>Flag Dispute</button>
                      </div>
                    </div>
                  )}

                  </div>

                  {/* Sticky Action Footer (Protected Tab Navigation!) */}
                  <div className="drawer-footer" style={{ 
                    marginTop: '20px', 
                    paddingTop: '14px', 
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)', 
                    display: 'flex', 
                    gap: '10px', 
                    justifyContent: 'flex-end',
                    flexShrink: 0
                  }}>
                    <button onClick={() => setShowConflictForm(true)} className="btn btn-warn" style={{ padding: '8px 14px', fontSize: '12px' }}>
                      <AlertTriangle size={14} /> Flag Contradiction
                    </button>
                    <button onClick={handleApprove} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                      <Check size={14} /> Approve to Memory
                    </button>
                  </div>

                </div>
              </div>
            )}

          </main>
        )}

        {/* MISSING MODULE 1: THE IMPERATIVE BUILDER (STRATEGIC KANBAN BOARD) */}
        {activeTab === 'builder' && (
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', boxSizing: 'border-box' }}>
            
            {/* Dynamic Controls Header Bar */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', width: '100%', boxSizing: 'border-box', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} style={{ color: 'var(--brand-indigo)' }} /> Strategic Imperative Builder
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>
                  Organize tactical launch implications into strategic macro-pillars. Auto-sort with Gemini AI or export slides.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleAutoSort} 
                  className="btn" 
                  disabled={isSorting}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '11.5px', padding: '8px 14px', cursor: 'pointer', borderRadius: '8px' }}
                >
                  {isSorting ? <RefreshCw className="animate-spin" size={13} /> : '✨ Auto-Sort with Gemini'}
                </button>
                <button 
                  onClick={handleAddPillar} 
                  className="btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '11.5px', padding: '8px 14px', cursor: 'pointer', borderRadius: '8px' }}
                >
                  <Plus size={13} /> Add Strategic Pillar
                </button>
                <button 
                  onClick={handleExportPptx} 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', padding: '8px 14px', cursor: 'pointer', borderRadius: '8px' }}
                >
                  <FileText size={13} /> Export GOLT Presentation (PPTX)
                </button>
              </div>
            </div>

            {/* 4-Column Board Wrapper */}
            <main className="kanban-board" style={{ gridTemplateColumns: `repeat(${pillars.length + 1}, 1fr)`, height: 'calc(100vh - 220px)', padding: 0 }}>
              
              {/* Column 0: Unassigned Inbox */}
              <div className="kanban-column" style={{ background: 'rgba(15, 23, 42, 0.015)', borderStyle: 'dashed', borderWidth: '1.5px' }}>
                <div className="kanban-column-header">
                  <h3 style={{ color: 'var(--text-muted)' }}>Unassigned Implications Inbox</h3>
                  <span className="kanban-card-count">
                    {insights.filter(ins => (!ins.strategic_pillar || ins.strategic_pillar === '') && ins.is_validated).length} Cards
                  </span>
                </div>
                
                <div className="kanban-cards-container">
                  {insights.filter(ins => (!ins.strategic_pillar || ins.strategic_pillar === '') && ins.is_validated).map(card => (
                    <div 
                      key={card.id} 
                      className="kanban-card animate-fade-in" 
                      onClick={() => { setSelectedBuilderCard(card); setIsBuilderDrawerOpen(true); }}
                      style={{ cursor: 'pointer', borderLeft: '4px solid #64748b' }}
                      title="Click to explore Clinical Grounding and slide lineage"
                    >
                      <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{card.opportunity_space}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 12px 0', whiteSpace: 'normal', lineHeight: '1.4' }}>
                        "Implication: {card.implication}"
                      </p>
                      
                      <div className="kanban-card-footer">
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Asset: {card.metadata.asset}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {pillars.map(p => (
                            <button
                              key={p.key_name}
                              onClick={(e) => { e.stopPropagation(); handleMoveCard(card.id, p.key_name); }}
                              className="kanban-move-btn"
                              style={{ padding: '4px 6px', fontSize: '11px' }}
                              title={`Move to ${p.display_name}`}
                            >
                              {p.class_name === 'diff' ? '🎯' : (p.class_name === 'value' ? '💳' : '🧬')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {insights.filter(ins => (!ins.strategic_pillar || ins.strategic_pillar === '') && ins.is_validated).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 10px', fontSize: '10.5px', color: '#475569' }}>
                      ✨ All implications sorted into pillars!consensus achieved.
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Columns */}
              {pillars.map(col => {
                const colCards = insights.filter(ins => ins.strategic_pillar === col.key_name && ins.is_validated);
                
                return (
                  <div key={col.key_name} className="kanban-column">
                    <div className={`kanban-column-header ${col.class_name}`} style={{ position: 'relative', paddingRight: '36px' }}>
                      <h3>{col.display_name}</h3>
                      <span className="kanban-card-count">{colCards.length} Cards</span>
                      
                      {/* Delete column button (Red cross on hover, highly premium!) */}
                      <button
                        onClick={() => handleDeletePillar(col.id, col.key_name)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.color = '#ef4444'; 
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.color = 'var(--text-muted)'; 
                          e.currentTarget.style.background = 'transparent'; 
                        }}
                        title="Delete strategic pillar column"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="kanban-cards-container">
                      {colCards.map(card => (
                        <div 
                          key={card.id} 
                          className="kanban-card animate-fade-in"
                          onClick={() => { setSelectedBuilderCard(card); setIsBuilderDrawerOpen(true); }}
                          style={{ cursor: 'pointer', borderLeft: `4px solid ${col.class_name === 'diff' ? 'var(--brand-indigo)' : (col.class_name === 'value' ? 'var(--brand-cyan)' : 'var(--brand-purple)')}` }}
                          title="Click to explore Clinical Grounding and slide lineage"
                        >
                          <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{card.opportunity_space}</h4>
                          <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)', margin: '8px 0 12px 0', whiteSpace: 'normal', lineHeight: '1.4' }}>
                            "Implication: {card.implication}"
                          </p>
                          
                          <div className="kanban-card-footer">
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Asset: {card.metadata.asset}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMoveCard(card.id, 'unassigned'); }}
                                className="kanban-move-btn"
                                style={{ padding: '4px 6px', fontSize: '11px' }}
                                title="Move back to Unassigned Inbox"
                              >
                                📥
                              </button>
                              {pillars.filter(p => p.key_name !== col.key_name).map(p => (
                                <button
                                  key={p.key_name}
                                  onClick={(e) => { e.stopPropagation(); handleMoveCard(card.id, p.key_name); }}
                                  className="kanban-move-btn"
                                  style={{ padding: '4px 6px', fontSize: '11px' }}
                                  title={`Move to ${p.display_name}`}
                                >
                                  {p.class_name === 'diff' ? '🎯' : (p.class_name === 'value' ? '💳' : '🧬')}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      {colCards.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 10px', fontSize: '10.5px', color: '#475569', border: '1px dashed rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                          Drag/Move implications here to formulate macro-strategy
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </main>
          </div>
        )}

        {/* MISSING MODULE 2: TACTICAL WORKSTREAM TRACKER (PROJECT MANAGER) */}
        {activeTab === 'tracker' && (
          <div className="workstream-layout animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Left Column: Workstream List */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexShrink: 0 }}>
                <div>
                  <h3 className="glass-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                    <ClipboardList size={16} style={{ color: '#06b6d4' }} /> Tactical Launch Readiness Workstreams
                  </h3>
                  <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0' }}>
                    Track and update execution milestones derived from validated strategic implications.
                  </p>
                </div>
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Plus size={13} /> Add Task
                </button>
              </div>

              {/* Scrollable list */}
              <div className="workstream-grid" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tacticalTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="workstream-row" 
                    onClick={() => setEditingTaskId(editingTaskId === task.id ? null : task.id)}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      padding: '16px 20px', 
                      gap: '12px',
                      cursor: 'pointer',
                      borderLeft: editingTaskId === task.id ? '3px solid var(--brand-cyan)' : '1px solid var(--glass-border)',
                      background: editingTaskId === task.id ? 'rgba(255,255,255,0.01)' : 'var(--glass-bg)',
                      transition: 'all 0.2s ease',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                        <span className="workstream-task-id" style={{ marginTop: '2px', fontSize: '11px' }}>{task.id}</span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</h4>
                            <span className={`matrix-status-badge ${task.status === 'Completed' ? 'validated' : 'draft'}`} style={{ padding: '3px 6px', fontSize: '9.5px', display: 'inline-block' }}>
                              {task.status}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            <span>Focus: <strong>{task.function}</strong></span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '200px' }}>
                              <div className="progress-track" style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', flex: 1 }}>
                                <div className="progress-fill" style={{ width: `${task.progress}%`, height: '100%', background: 'var(--brand-cyan)' }} />
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="workstream-owner" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <div className="owner-avatar" style={{ width: '28px', height: '28px', fontSize: '10px' }}>{task.owner.split(' ').map(n=>n[0]).join('')}</div>
                        <span className="owner-name" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{task.owner}</span>
                      </div>
                    </div>

                    {/* Collapsible Inline Progress & Status Editor */}
                    {editingTaskId === task.id && (
                      <div className="animate-fade-in" style={{ 
                        width: '100%',
                        marginTop: '10px', 
                        paddingTop: '14px', 
                        borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '20px',
                        background: 'rgba(0,0,0,0.15)',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        boxSizing: 'border-box'
                      }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Progress:</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={task.progress} 
                            onChange={(e) => handleUpdateTask(task.id, { progress: parseInt(e.target.value) })}
                            style={{ flex: 1, accentColor: 'var(--brand-cyan)', cursor: 'pointer' }}
                          />
                          <strong style={{ fontSize: '12px', color: 'var(--brand-cyan)', minWidth: '36px' }}>{task.progress}%</strong>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status:</span>
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTask(task.id, { status: e.target.value })}
                            className="form-select"
                            style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', outline: 'none', cursor: 'pointer' }}
                          >
                            <option>Not Started</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Workstream Telemetry & AI Diagnostic Feed */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '20px',
              overflowY: 'auto'
            }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  EXECUTION TELEMETRY
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  AI Workstream Diagnostics
                </h3>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>COMPLETION RATE</span>
                  <strong style={{ fontSize: '24px', color: 'var(--brand-cyan)' }}>
                    {Math.round((tacticalTasks.filter(t => t.status === 'Completed').length / tacticalTasks.length) * 100)}%
                  </strong>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {tacticalTasks.filter(t => t.status === 'Completed').length} of {tacticalTasks.length} tasks completed
                  </span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>ACTIVE SPRINT</span>
                  <strong style={{ fontSize: '16px', color: 'var(--text-primary)', display: 'block', marginTop: '4px', fontWeight: 800 }}>HQ-MELANOMA-26</strong>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Sprint cycle ends in 12 days</span>
                </div>
              </div>

              {/* Progress bars by focus area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  Focus Area Distribution
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Market Access (HEOR)</span>
                      <strong style={{ color: 'var(--text-primary)' }}>2 Tasks</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '50%', height: '100%', background: 'var(--brand-indigo)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Medical Affairs</span>
                      <strong style={{ color: 'var(--text-primary)' }}>2 Tasks</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '50%', height: '100%', background: 'var(--brand-cyan)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Warnings Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  Live Diagnostic Logs
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.12)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Task T-2 Completed</span>: Diagnostic molecular PCR kit deployment successfully verified at US clinics.
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.12)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⚠️ Task T-4 In Progress</span>: MSL training on KRAS clinical packs is currently at 40%. Recommend expediting before Q4 PDUFA review.
                  </div>
                </div>
              </div>

              {/* Sync execution team button */}
              <button
                onClick={() => alert("⚡ Downstream execution timelines successfully synchronized with regional MSL and KAM channels!")}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' }}
              >
                ⚡ Synchronize Execution Teams
              </button>
            </div>
          </div>
        )}

        {/* MISSING MODULE 3: LIVE WORKSHOP MODE (CONSENSUS BUILDING CANVAS) */}
        {activeTab === 'workshop' && (
          <main className="workshop-layout animate-fade-in">
            
            {/* Left: Collaborative Digital Node Board */}
            <div className="workshop-canvas-container">
              <div className="glass-card" style={{ padding: '16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '14.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                    <Users size={14} style={{ color: 'var(--brand-cyan)' }} /> Cross-Functional Alignment Workshop
                  </h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Collaboratively prioritize AI-synthesized themes. Drag nodes to cluster, double-click to edit, or add custom brainstorm cards.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Enter a title for the new strategic launch theme:");
                    if (!name) return;
                    const desc = prompt("Enter a short description or weight for this theme:");
                    if (!desc) return;
                    
                    const newId = `node_${Math.random().toString(36).substring(2, 9)}`;
                    setWorkshopNodes(prev => ({
                      ...prev,
                      [newId]: {
                        id: newId,
                        name: name,
                        desc: desc,
                        left: 180 + Math.random() * 80,
                        top: 140 + Math.random() * 80,
                        color: 'var(--brand-cyan)'
                      }
                    }));
                    setWorkshopVotes(prev => ({
                      ...prev,
                      [name]: 0
                    }));
                  }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px', cursor: 'pointer', borderRadius: '8px' }}
                >
                  <Plus size={13} /> Add Custom Theme
                </button>
              </div>

              <div 
                className="workshop-canvas"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                style={{ position: 'relative', overflow: 'hidden', cursor: activeDragNode ? 'grabbing' : 'default' }}
              >
                <div className="workshop-grid-overlay" style={{ pointerEvents: 'none' }} />
                
                {/* Visual Bezier Tethers (Wired dynamically to node coordinates!) */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                  <defs>
                    <linearGradient id="tether-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--brand-indigo)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="var(--brand-cyan)" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="tether-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  {/* Elastic roadmap links (Updates in real-time on drag!) */}
                  {workshopNodes.node1 && workshopNodes.node2 && <path d={getDynamicLinkPath('node1', 'node2')} fill="none" stroke="url(#tether-grad-1)" strokeWidth="2" strokeDasharray="4 4" className="animated-tether" />}
                  {workshopNodes.node1 && workshopNodes.node3 && <path d={getDynamicLinkPath('node1', 'node3')} fill="none" stroke="url(#tether-grad-2)" strokeWidth="2" strokeDasharray="4 4" className="animated-tether" />}
                  {workshopNodes.node2 && workshopNodes.node4 && <path d={getDynamicLinkPath('node2', 'node4')} fill="none" stroke="url(#tether-grad-1)" strokeWidth="2" strokeDasharray="4 4" className="animated-tether" />}
                  
                  {/* Outer elastic strategic links */}
                  {workshopNodes.node2 && workshopNodes.node5 && <path d={getDynamicLinkPath('node2', 'node5')} fill="none" stroke="url(#tether-grad-2)" strokeWidth="1.5" strokeDasharray="3 3" />}
                  {workshopNodes.node5 && workshopNodes.node4 && <path d={getDynamicLinkPath('node5', 'node4')} fill="none" stroke="url(#tether-grad-1)" strokeWidth="1.5" strokeDasharray="3 3" />}
                  {workshopNodes.node6 && workshopNodes.node1 && <path d={getDynamicLinkPath('node6', 'node1')} fill="none" stroke="url(#tether-grad-2)" strokeWidth="1.5" strokeDasharray="3 3" />}
                  {workshopNodes.node6 && workshopNodes.node4 && <path d={getDynamicLinkPath('node6', 'node4')} fill="none" stroke="url(#tether-grad-1)" strokeWidth="1.5" strokeDasharray="3 3" />}
                  {workshopNodes.node3 && workshopNodes.node6 && <path d={getDynamicLinkPath('node3', 'node6')} fill="none" stroke="url(#tether-grad-2)" strokeWidth="1.5" strokeDasharray="3 3" />}
                </svg>
                
                {/* Dynamically Render Coordinates & Drag Listeners */}
                {Object.values(workshopNodes).map(node => {
                  const isBeingDragged = activeDragNode === node.id;
                  const votesCount = workshopVotes[node.name] || 0;
                  return (
                    <div 
                      key={node.id}
                      className="interactive-theme-node"
                      onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                      onDoubleClick={() => {
                        const newName = prompt("Edit Theme Title:", node.name);
                        if (!newName) return;
                        const newDesc = prompt("Edit Theme Description:", node.desc);
                        if (!newDesc) return;
                        
                        setWorkshopNodes(prev => ({
                          ...prev,
                          [node.id]: { ...prev[node.id], name: newName, desc: newDesc }
                        }));
                        setWorkshopVotes(prev => {
                          const updated = { ...prev };
                          if (node.name !== newName) {
                            updated[newName] = updated[node.name] || 0;
                            delete updated[node.name];
                          }
                          return updated;
                        });
                      }}
                      style={{ 
                        position: 'absolute',
                        left: `${node.left}px`, 
                        top: `${node.top}px`, 
                        zIndex: isBeingDragged ? 10 : 2,
                        userSelect: 'none',
                        cursor: isBeingDragged ? 'grabbing' : 'grab',
                        borderLeft: `3px solid ${node.color || 'var(--brand-indigo)'}`,
                        boxShadow: isBeingDragged ? '0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)' : 'none',
                        transition: isBeingDragged ? 'none' : 'box-shadow 0.2s ease, border 0.2s ease',
                        boxSizing: 'border-box',
                        padding: '16px 36px 16px 16px'
                      }}
                      title="Drag to move • Double-click to edit"
                    >
                      {/* Delete node cross */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${node.name}" from the workshop board?`)) {
                            setWorkshopNodes(prev => {
                              const updated = { ...prev };
                              delete updated[node.id];
                              return updated;
                            });
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px'
                        }}
                        title="Delete theme card"
                      >
                        <X size={10} />
                      </button>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, flex: 1, color: 'var(--text-primary)' }}>{node.name}</h4>
                        <span style={{
                          fontSize: '8.5px',
                          fontWeight: 'bold',
                          color: 'var(--brand-cyan)',
                          background: 'rgba(6, 182, 212, 0.06)',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          padding: '1px 5px',
                          borderRadius: '10px',
                          whiteSpace: 'nowrap'
                        }}>
                          {votesCount} Vote{votesCount !== 1 && 's'}
                        </span>
                      </div>
                      <p style={{ marginTop: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>{node.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Interactive Blind Voting Console */}
            <div className="voting-console glass-card">
              <h3 className="glass-card-title" style={{ fontSize: '15px', fontWeight: 800 }}>
                <Sparkles size={16} style={{ color: 'var(--color-warning)' }} /> Blind Alignment Vote
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '16px' }}>
                Lock in team consensus on launch priority. Cast your anonymous vote.
              </p>

              <div className="voting-list">
                {Object.values(workshopNodes).map(node => {
                  const itemVotes = workshopVotes[node.name] || 0;
                  const totalVotes = Object.values(workshopVotes).reduce((a,b)=>a+b, 0);
                  const percentage = totalVotes > 0 ? Math.round((itemVotes / totalVotes) * 100) : 0;

                  return (
                    <div key={node.name} className="voting-item">
                      <div className="voting-item-header">
                        <div>
                          <h5 style={{ fontSize: '14px', fontWeight: 800 }}>{node.name}</h5>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'inline-block' }}>
                            {node.desc.includes('•') ? node.desc.substring(node.desc.indexOf('•') + 1).trim() : node.desc}
                          </span>
                        </div>
                        <div className="vote-button-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--brand-cyan)', whiteSpace: 'nowrap' }}>{itemVotes} Votes ({percentage}%)</span>
                          <button 
                            onClick={() => handleCastWorkshopVote(node.name)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '11.5px', cursor: 'pointer' }}
                          >
                            Vote
                          </button>
                        </div>
                      </div>
                      <div className="vote-tally-bar">
                        <div className="vote-tally-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '28px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => alert("Consensus Locked! Syncing workshop ranks to GOLT launch deck.")}
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '10px 18px', fontSize: '13.5px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <UserCheck size={14} /> Lock Alignment Consensus
                </button>
              </div>
            </div>

          </main>
        )}

        {/* TAB 3: GOVERN & CONTROL (INGESTION, MCP REGISTRY, QA SIMULATOR) */}
        {activeTab === 'ingest' && (
          <main className="ingest-layout animate-fade-in">
            
            {/* Left Column: Asset Ingestion & Connected MCP Servers */}
            <div className="ingest-left-controls">
              
              <div className="glass-card">
                <div className="drawer-header" style={{ marginBottom: '14px' }}>
                  <h3 className="drawer-header-title" style={{ margin: 0 }}>
                    <Upload size={16} /> Asset Ingestion Port
                  </h3>
                  <button 
                    onClick={handleTriggerDemo}
                    disabled={isUploading}
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', fontSize: '9px', padding: '4px 8px' }}
                  >
                    <Play size={10} /> Trigger Ingestion Demo
                  </button>
                </div>

                <div className="metadata-selectors-grid" style={{ marginBottom: '12px' }}>
                  <div className="select-box-group">
                    <label>Function Lane</label>
                    <select 
                      value={uploadLane} 
                      onChange={(e) => setUploadLane(e.target.value)}
                      className="select-box-input"
                    >
                      <option>Market Research</option>
                      <option>Medical Affairs</option>
                      <option>Market Access</option>
                      <option>Competitive Intelligence</option>
                    </select>
                  </div>
                  <div className="select-box-group">
                    <label>Oncology Asset</label>
                    <select 
                      value={uploadAsset} 
                      onChange={(e) => setUploadAsset(e.target.value)}
                      className="select-box-input"
                    >
                      <option>V940</option>
                      <option>MK-1084</option>
                      <option>Keytruda</option>
                    </select>
                  </div>
                  <div className="select-box-group">
                    <label>Tumor Type</label>
                    <input 
                      type="text" 
                      value={uploadTumor}
                      onChange={(e) => setUploadTumor(e.target.value)}
                      className="select-box-input"
                    />
                  </div>
                  <div className="select-box-group">
                    <label>Sub-Indication</label>
                    <input 
                      type="text" 
                      value={uploadSubTumor}
                      onChange={(e) => setUploadSubTumor(e.target.value)}
                      className="select-box-input"
                    />
                  </div>
                </div>

                <div className="dropzone-box">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                  />
                  <Upload size={24} style={{ color: '#818cf8', margin: '0 auto' }} />
                  <p>Drag & drop strategic presentations</p>
                  <span>Supports PPTX, PDF, PNG (Vision PixelRAG)</span>
                </div>

                {isUploading && (
                  <div className="bar-box" style={{ marginTop: '14px' }}>
                    <div className="bar-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Multi-Agent Parsing In Progress...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="bar-track" style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div className="bar-fill" style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--brand-cyan)' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* ENTERPRISE MCP AGENT REGISTRY */}
              <div className="glass-card">
                <div className="drawer-header" style={{ marginBottom: '14px' }}>
                  <h3 className="drawer-header-title" style={{ margin: 0 }}>
                    <Server size={16} style={{ color: '#06b6d4' }} /> Agent Registry (MCP Servers)
                  </h3>
                  <button 
                    onClick={() => setShowMcpForm(!showMcpForm)} 
                    className="btn btn-primary"
                    style={{ fontSize: '9px', padding: '4px 8px' }}
                  >
                    <Plus size={10} /> Connect Source
                  </button>
                </div>

                {showMcpForm && (
                  <form onSubmit={handleRegisterMcp} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                    <div className="metadata-selectors-grid">
                      <div className="select-box-group">
                        <label>Connector ID</label>
                        <input type="text" value={mcpId} onChange={(e) => setMcpId(e.target.value)} placeholder="veeva-vault-primary" className="select-box-input" />
                      </div>
                      <div className="select-box-group">
                        <label>Server Name</label>
                        <input type="text" value={mcpDisplayName} onChange={(e) => setMcpDisplayName(e.target.value)} placeholder="Veeva Vault" className="select-box-input" />
                      </div>
                      <div className="select-box-group" style={{ gridColumn: '1/-1' }}>
                        <label>gRPC / HTTPS Server URL</label>
                        <input type="text" value={mcpServerUrl} onChange={(e) => setMcpServerUrl(e.target.value)} placeholder="grpc://veeva-mcp.internal:9090" className="select-box-input" />
                      </div>
                      <div className="select-box-group">
                        <label>Connector Type</label>
                        <select value={mcpConnectorType} onChange={(e) => setMcpConnectorType(e.target.value)} className="select-box-input">
                          <option>Veeva Vault</option>
                          <option>SharePoint</option>
                          <option>Snowflake</option>
                          <option>Salesforce</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => setShowMcpForm(false)} className="btn btn-subtle">Cancel</button>
                      <button type="submit" className="btn btn-primary">Register Server</button>
                    </div>
                  </form>
                )}

                <div className="themes-scroller" style={{ maxHeight: '200px' }}>
                  {mcpServers.map(server => (
                    <div key={server.id} className="theme-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px' }}>
                      <div>
                        <h4 style={{ fontSize: '11.5px', margin: 0 }}>{server.display_name}</h4>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                          Url: <strong>{server.server_url}</strong> • Type: <strong>{server.connector_type}</strong>
                        </span>
                        <span style={{ fontSize: '8px', color: '#818cf8', display: 'block', marginTop: '2px' }}>
                          Last Sync: {new Date(server.last_sync_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span className="status-pill memory" style={{ padding: '2px 8px' }}>CONNECTED</span>
                        <button 
                          onClick={() => handleSyncMcp(server.id)} 
                          disabled={isSyncingMcp[server.id]}
                          className="btn btn-subtle"
                          style={{ padding: '2px 6px', fontSize: '8px' }}
                        >
                          {isSyncingMcp[server.id] ? "Syncing..." : "Sweep Sync"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: QA Simulation Console & Visual Agent Handoff Audit Nodes */}
            <div className="ingest-right-audit">
              
              {/* CI/CD AGENTIC QA & SIMULATION CONSOLE */}
              <div className="glass-card" style={{ marginBottom: '24px' }}>
                <div className="drawer-header" style={{ marginBottom: '14px' }}>
                  <h3 className="drawer-header-title" style={{ margin: 0 }}>
                    <Activity size={16} style={{ color: '#f59e0b' }} /> AI Safety & Simulation Console (CI/CD)
                  </h3>
                  <button 
                    onClick={handleRunQASimulation}
                    disabled={isSimulatingQA}
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', fontSize: '9px', padding: '4px 10px', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)' }}
                  >
                    {isSimulatingQA ? "Simulating Test..." : "🧪 Run Safety Regression Test"}
                  </button>
                </div>

                {/* Scorecards */}
                <div className="scorecard-grid" style={{ marginBottom: '14px', gap: '10px' }}>
                  <div className="metric-card" style={{ padding: '10px' }}>
                    <span className="metric-val blue" style={{ fontSize: '20px' }}>
                      {evalResults[0]?.task_success_rate ? `${Math.round(evalResults[0].task_success_rate)}%` : "100%"}
                    </span>
                    <span className="metric-label" style={{ fontSize: '8px' }}>Task Success</span>
                  </div>
                  <div className="metric-card" style={{ padding: '10px' }}>
                    <span className="metric-val amber" style={{ fontSize: '20px' }}>
                      {evalResults[0]?.compliance_accuracy ? `${Math.round(evalResults[0].compliance_accuracy)}%` : "100%"}
                    </span>
                    <span className="metric-label" style={{ fontSize: '8px' }}>Safety Accuracy</span>
                  </div>
                  <div className="metric-card" style={{ padding: '10px' }}>
                    <span className="metric-val red" style={{ fontSize: '20px' }}>0</span>
                    <span className="metric-label" style={{ fontSize: '8px' }}>Regressions</span>
                  </div>
                </div>

                {/* Simulation Logs */}
                <div className="themes-scroller" style={{ maxHeight: '120px' }}>
                  {evalResults.map((res, rIdx) => (
                    <div key={rIdx} className="theme-item" style={{ padding: '10px 12px', borderLeft: '3px solid #f59e0b' }}>
                      <div className="theme-item-header" style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'white' }}>Safety Simulation Run</span>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{new Date(res.run_date).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '9px', margin: 0, lineHeight: '1.4' }}>{res.simulation_notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 
                 VISUAL AUDIT NODES (Default Expanded - Show the Machine's Work!)
                 Decoupled from heavy raw details. Clicking opens the Slide-out Drawer!
              */}
              <div className="glass-card">
                <h3 className="glass-card-title">
                  <History size={16} /> Verifiable Compliance Audit Log (Click to Verify)
                </h3>
                
                <div className="audit-scroller" style={{ maxHeight: '240px' }}>
                  {auditLogs.map((log, lIdx) => (
                    <div 
                      key={lIdx} 
                      onClick={() => handleAuditNodeClick(log)}
                      className="audit-node animate-fade-in"
                      style={{ display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer', padding: '14px 18px' }}
                      title="Click to slide open visual handoffs and transaction payloads"
                    >
                      <div className="step-node-circle" style={{ 
                        flexShrink: 0, 
                        width: '28px', 
                        height: '28px', 
                        fontSize: '11px',
                        borderColor: 'var(--brand-indigo)',
                        boxShadow: '0 0 10px rgba(79, 70, 229, 0.25)',
                        color: 'var(--brand-cyan)',
                        background: 'var(--bg-primary)'
                      }}>
                        {log.step_index}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.step_name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Agent: <strong style={{ color: 'var(--brand-cyan)' }}>{log.agent_name}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        )}

        {/* MISSING MODULE 5: THE SHOWCASE SIMULATION THEATER */}
        {activeTab === 'theater' && (
          <div className="theater-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            
            {/* Left Column: Selector Panel */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '16px',
              overflowY: 'auto'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-purple)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  SHOWCASE MULTI-AGENT ARENA
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Simulation Theater
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Run live, animated agentic scenarios showing the platform's eyes, safety guardrails, department clashes, and deep research outbound loops.
                </p>
              </div>

              {/* Selector List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', flex: 1 }}>
                {[
                  { id: 'pixelrag', label: '1. PixelRAG X-Ray Ingestion', desc: "Witness the VLM's eyes extract structured clinical frameworks from complex visual slide layouts.", icon: '👁️', color: 'var(--brand-cyan)' },
                  { id: 'compliance', label: '2. Compliance Guard Intercept', desc: "Watch the Compliance Supervisor quarantine MA drafts containing promotional terminology.", icon: '🛡️', color: '#ef4444' },
                  { id: 'collision', label: '3. Cross-Functional Collision', desc: "See agent-to-agent timeline contradictions spark automated alerts and GOLT human voting.", icon: '⚔️', color: 'var(--brand-indigo)' },
                  { id: 'research', label: '4. Deep Research Outbreak', desc: "Deploy the Gap Detection agent to scrape external trials databases and synthesize new insights.", icon: '🛰️', color: '#f59e0b' }
                ].map(scene => (
                  <div
                    key={scene.id}
                    onClick={() => {
                      setSimActiveScene(scene.id);
                      setSimStatus('idle');
                      setSimStep(0);
                      setSimText('');
                      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: simActiveScene === scene.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                      border: `1px solid ${simActiveScene === scene.id ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                      borderLeft: `3px solid ${simActiveScene === scene.id ? scene.color : 'rgba(255,255,255,0.03)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px' }}>{scene.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '12.5px', fontWeight: 700, color: simActiveScene === scene.id ? 'white' : 'var(--text-secondary)' }}>
                        {scene.label}
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {scene.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Trigger Button */}
              <button
                onClick={() => runSimulation(simActiveScene)}
                disabled={simStatus === 'running'}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--brand-indigo) 0%, var(--brand-purple) 100%)',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.2)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {simStatus === 'running' ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Running Live Agent Simulation...
                  </>
                ) : (
                  <>
                    <Play size={14} fill="white" /> Execute Showcase Simulation
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Stage Panel */}
            <div style={{
              display: 'grid',
              gridTemplateRows: '1fr 180px',
              gap: '20px',
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              
              {/* Top: Animated Stage Canvas */}
              <div className="glass-card" style={{
                position: 'relative',
                background: 'rgba(5, 7, 12, 0.6)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}>
                
                {/* Visual Watermark grid background */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 0)',
                  backgroundSize: '16px 16px',
                  zIndex: 0
                }} />

                {/* SCENE 1 STAGE: PIXEL-RAG X-RAY */}
                {simActiveScene === 'pixelrag' && (
                  <div className="animate-fade-in" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left: Slide Mockup Image container */}
                    <div className="glass-card" style={{
                      position: 'relative',
                      background: '#0b0f19',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {/* Scanning laser line */}
                      {simStatus === 'running' && (
                        <div style={{
                          position: 'absolute',
                          left: 0, right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, rgba(34,211,238,0) 0%, #22d3ee 50%, rgba(34,211,238,0) 100%)',
                          boxShadow: '0 0 10px #22d3ee',
                          animation: 'laser-scan 3s linear infinite',
                          zIndex: 5
                        }} />
                      )}

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '8px', color: 'var(--brand-cyan)', fontWeight: 'bold' }}>FILE INGRESS: MELANOMA_V940_LATE_PHASE.PPTX</span>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Slide 12 of 24</span>
                        </div>
                        
                        <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', color: 'white', fontWeight: 800 }}>
                          V940 + Pembrolizumab Adjuvant Survival Evidence
                        </h3>
                      </div>

                      {/* Quadrant 1: HEOR survival table */}
                      <div style={{
                        border: simStep >= 1 ? '2px solid var(--brand-cyan)' : '1px solid rgba(255,255,255,0.03)',
                        boxShadow: simStep >= 1 ? '0 0 15px rgba(6, 182, 212, 0.25)' : 'none',
                        background: simStep === 1 ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.01)',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        transition: 'all 0.4s ease'
                      }}>
                        <span style={{ fontSize: '7px', color: 'var(--brand-cyan)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                          QUADRANT 1: ADJUVANT EFFICACY MATRIX
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
                          <span>Adjuvant Combo (V940 + Pembro)</span>
                          <strong style={{ color: 'white' }}>44% Recurrence Risk Reduction (HR: 0.56)</strong>
                        </div>
                      </div>

                      {/* Quadrant 2: Executive Quote */}
                      <div style={{
                        border: simStep >= 2 ? '2px solid var(--brand-blue)' : '1px solid rgba(255,255,255,0.03)',
                        boxShadow: simStep >= 2 ? '0 0 15px rgba(59, 130, 246, 0.25)' : 'none',
                        background: simStep === 2 ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        transition: 'all 0.4s ease',
                        fontStyle: 'italic'
                      }}>
                        <span style={{ fontSize: '7px', color: 'var(--brand-blue)', fontWeight: 'bold', display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>
                          QUADRANT 2: OPERATIONAL CLINICAL SIGNALS
                        </span>
                        <p style={{ margin: 0, fontSize: '9px', lineHeight: '1.4', color: 'var(--text-muted)' }}>
                          "Reimbursement timelines are highly sensitive to HEOR package submissions immediately following FDA clearance."
                        </p>
                      </div>

                      {/* Quadrant 3: Strategic recommendation */}
                      <div style={{
                        border: simStep >= 3 ? '2px solid var(--brand-purple)' : '1px solid rgba(255,255,255,0.03)',
                        boxShadow: simStep >= 3 ? '0 0 15px rgba(139, 92, 246, 0.25)' : 'none',
                        background: simStep === 3 ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                        padding: '10px',
                        borderRadius: '8px',
                        transition: 'all 0.4s ease'
                      }}>
                        <span style={{ fontSize: '7px', color: 'var(--brand-purple)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                          QUADRANT 3: LAUNCH IMPERATIVES RECOMMENDATION
                        </span>
                        <p style={{ margin: 0, fontSize: '9px', color: 'white', fontWeight: 600 }}>
                          Recommendation: Deploy HEOR surrogate models to Access leads by Q3.
                        </p>
                      </div>
                    </div>

                    {/* Right: Typing Extraction terminal & Final spawned card */}
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: '1fr auto',
                      gap: '16px',
                      height: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}>
                      {/* Ingress Terminal Output */}
                      <div style={{
                        background: '#04060b',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '14px',
                        fontFamily: 'monospace',
                        fontSize: '9.5px',
                        color: 'var(--brand-cyan)',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4'
                      }}>
                        <span style={{ color: '#818cf8', fontWeight: 'bold' }}>[VLM Copilot Visual Extraction Node]</span>
                        <pre style={{ margin: '8px 0 0 0', fontFamily: 'inherit', color: '#22d3ee', whiteSpace: 'pre-wrap' }}>
                          {simText || "Awaiting simulation trigger. Click 'Execute' to begin visual extraction..."}
                        </pre>
                      </div>

                      {/* Sparkled Insight Card */}
                      {simStatus === 'completed' && (
                        <div className="glass-card animate-slide-up" style={{
                          padding: '14px',
                          border: '1px solid rgba(34, 211, 238, 0.3)',
                          boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
                          background: 'rgba(6,182,212,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--brand-cyan)', background: 'rgba(6,182,212,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              SPAWNED OKF MEMORY BLOCK
                            </span>
                            <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>ID: V940-012</span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '11px', color: 'white', fontWeight: 'bold' }}>
                            Personalized mRNA Efficacy & Access Grounding
                          </h4>
                          <p style={{ margin: 0, fontSize: '9.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            "Implication: Deploy HEOR surrogate validation models to Access leads by Q3."
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SCENE 2 STAGE: COMPLIANCE INTERCEPTION */}
                {simActiveScene === 'compliance' && (
                  <div className="animate-fade-in" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left: Live Typing Draft Editor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
                      <div className="glass-card" style={{
                        position: 'relative',
                        background: simStep === 2 ? 'rgba(239, 68, 68, 0.05)' : 'var(--glass-bg)',
                        border: simStep === 2 ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                        boxShadow: simStep === 2 ? '0 0 25px rgba(239, 68, 68, 0.3)' : 'none',
                        padding: '20px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'all 0.3s ease',
                        transform: simStep === 3 ? 'translateX(120%) scale(0.6) rotate(5deg)' : 'none',
                        opacity: simStep === 3 ? 0 : 1
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', background: 'var(--brand-cyan)', borderRadius: '50%' }} />
                            <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                              Draft Editor (Medical Affairs Lane)
                            </strong>
                          </div>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Status: Active Draft</span>
                        </div>

                        {/* Input Field with highlighted forbidden words */}
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          padding: '14px',
                          borderRadius: '8px',
                          minHeight: '100px',
                          fontSize: '12px',
                          lineHeight: '1.6',
                          color: 'var(--text-primary)',
                          position: 'relative'
                        }}>
                          {simStep === 0 ? (
                            <span>{simText}<span className="animate-pulse" style={{ color: 'var(--brand-cyan)' }}>|</span></span>
                          ) : (
                            <span>
                              Medical Affairs expectations: Strong clinical adoption in community oncology clinics, which will drive rapid {" "}
                              <span style={{ background: '#ef4444', color: 'white', padding: '0 4px', borderRadius: '4px', fontWeight: 'bold', animation: 'blink 0.8s infinite' }}>market share</span> gains and guarantee a {" "}
                              <span style={{ background: '#ef4444', color: 'white', padding: '0 4px', borderRadius: '4px', fontWeight: 'bold', animation: 'blink 0.8s infinite' }}>high ROI</span> on our investments.
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '9px', color: 'var(--text-muted)' }}>
                          <span>Principal ID: spiffe://itacs.merck.com/.../medical-affairs</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quarantine Chamber / Auditor info */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}>
                      
                      {/* Quarantine Chamber Container */}
                      <div className="glass-card" style={{
                        width: '100%',
                        maxHeight: '260px',
                        background: simStep === 3 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.01)',
                        border: simStep === 3 ? '2px dashed #ef4444' : '1px dashed rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.4s ease',
                        boxSizing: 'border-box'
                      }}>
                        {simStep === 3 ? (
                          <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                            <ShieldAlert size={48} style={{ color: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                            <h4 style={{ margin: 0, color: '#ef4444', fontWeight: 800, fontSize: '13.5px' }}>
                              ⚠️ CARD QUARANTINED
                            </h4>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              Draft insight #DF-942 intercepted by Compliance Supervisor.<br />
                              <strong>Reason:</strong> Commercial language ('market share', 'ROI') detected in non-commercial lane.
                            </p>
                            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              BLOCK AUDIT COMMIT: sha256:7f92b42ca1a0b98
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.3, textAlign: 'center' }}>
                            <ShieldAlert size={40} style={{ color: 'var(--text-muted)' }} />
                            <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                              Quarantine Chamber
                            </h4>
                            <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-muted)' }}>
                              Compliance Supervisor active. Standing by to intercept lane breaches.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENE 3 STAGE: CROSS-FUNCTIONAL COLLISION */}
                {simActiveScene === 'collision' && (
                  <div className="animate-fade-in" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    boxSizing: 'border-box',
                    gap: '16px'
                  }}>
                    
                    {/* SVG Connector overlay for glowing red tether */}
                    <svg style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      width: '100%', height: '100%',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}>
                      {simStep >= 3 && (
                        <line 
                          x1="35%" y1="40%" 
                          x2="65%" y2="40%" 
                          stroke={simVoteSelected ? "#10b981" : "#ef4444"} 
                          strokeWidth={simVoteSelected ? "3" : "2"}
                          style={{
                            strokeDasharray: simVoteSelected ? "none" : "6",
                            animation: simVoteSelected ? "none" : "dash 1.2s linear infinite",
                            filter: simVoteSelected ? 'drop-shadow(0 0 10px #10b981)' : 'drop-shadow(0 0 10px #ef4444)',
                            transition: 'all 0.4s ease'
                          }}
                        />
                      )}
                    </svg>

                    {/* Split Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '80px',
                      alignItems: 'center',
                      flex: 1,
                      width: '100%',
                      boxSizing: 'border-box',
                      zIndex: 3
                    }}>
                      
                      {/* Left: Medical Affairs Card */}
                      <div className="glass-card animate-slide-right" style={{
                        padding: '16px',
                        background: 'var(--bg-tertiary)',
                        borderLeft: '4px solid var(--brand-cyan)',
                        opacity: simStep >= 1 ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                        height: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <span style={{ fontSize: '7.5px', color: 'var(--brand-cyan)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            MEDICAL AFFAIRS STRATEGY
                          </span>
                          <h4 style={{ margin: 0, fontSize: '12px', color: 'white', fontWeight: 'bold' }}>
                            Clinical Adjuvant Launch
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                            "Clinical adoption pathways support a rapid community launch in <strong>Q3 2026</strong>."
                          </p>
                        </div>
                      </div>

                      {/* Right: Market Access Card */}
                      <div className="glass-card animate-slide-left" style={{
                        padding: '16px',
                        background: 'var(--bg-tertiary)',
                        borderLeft: '4px solid var(--brand-indigo)',
                        opacity: simStep >= 2 ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                        height: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <span style={{ fontSize: '7.5px', color: 'var(--brand-indigo)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            MARKET ACCESS / REIMBURSEMENT
                          </span>
                          <h4 style={{ margin: 0, fontSize: '12px', color: 'white', fontWeight: 'bold' }}>
                            Payer Step-Edit Friction
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                            "Payer step-authorization requirements will delay community access until <strong>Q1 2027</strong>."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Divergence warning and voting box */}
                    {simStep >= 3 && (
                      <div className="animate-scale-in" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: `1px solid ${simVoteSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        padding: '16px 24px',
                        borderRadius: '12px',
                        width: '100%',
                        boxSizing: 'border-box',
                        zIndex: 4,
                        textAlign: 'center'
                      }}>
                        {simVoteSelected ? (
                          <div className="animate-fade-in">
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                              ✓ CONFLICT RESOLVED
                            </span>
                            <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: 'white' }}>
                              Consensus achieved: <strong>{simVoteSelected === 'optionA' ? 'Delay clinical launch to Q1 (Prioritize Access)' : 'Deploy HEOR evidence packages to pull launch forward'}</strong>
                            </p>
                            <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              GOLT Alignment Vote: Option A ({simVoteCounts.optionA}) — Option B ({simVoteCounts.optionB}) • Consensus Committed!
                            </span>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="animate-ping" style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
                              <strong style={{ fontSize: '11px', color: '#fca5a5', textTransform: 'uppercase' }}>
                                ⚔️ INTER-FUNCTIONAL TIMELINE COLLISION
                              </strong>
                            </div>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-secondary)' }}>
                              Chronological timeline divergence detected. Medical Affairs assumes Q3 launch, Access reports Q1 clearance.
                            </p>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                              <button 
                                onClick={() => {
                                  setSimVoteSelected('optionA');
                                  setSimVoteCounts(prev => ({ ...prev, optionA: prev.optionA + 1 }));
                                  setSimLogs(prev => [...prev, "[Consensus] GOLT Vote registered for Option A. Conflict resolved."]);
                                }}
                                className="btn btn-subtle" 
                                style={{ fontSize: '10px', padding: '6px 12px', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                              >
                                Option A: Align Launch with Access (Q1)
                              </button>
                              <button 
                                onClick={() => {
                                  setSimVoteSelected('optionB');
                                  setSimVoteCounts(prev => ({ ...prev, optionB: prev.optionB + 1 }));
                                  setSimLogs(prev => [...prev, "[Consensus] GOLT Vote registered for Option B. Deploying HEOR to accelerate Access."]);
                                }}
                                className="btn btn-primary" 
                                style={{ fontSize: '10px', padding: '6px 12px', cursor: 'pointer' }}
                              >
                                Option B: Accelerate Access with HEOR evidence
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SCENE 4 STAGE: DEEP RESEARCH OUTBREAK */}
                {simActiveScene === 'research' && (
                  <div className="animate-fade-in" style={{
                    display: 'grid',
                    gridTemplateColumns: '320px 1fr',
                    gap: '24px',
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left: Map node showing knowledge gap */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <div className="glass-card" style={{
                        background: '#0a0d14',
                        border: simStep === 0 ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        flex: 1
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          border: '2px solid #f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 20px rgba(245,158,11,0.3)',
                          animation: 'pulse 1.5s infinite',
                          background: 'rgba(245,158,11,0.05)',
                          fontSize: '20px'
                        }}>
                          🛰️
                        </div>
                        <h4 style={{ margin: 0, fontSize: '12.5px', color: '#f59e0b', fontWeight: 800 }}>
                          CRITICAL KNOWLEDGE GAP
                        </h4>
                        <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          Target: Competitor X's Q3 Oncology Pricing Strategy & Access Thresholds are unknown.
                        </p>
                      </div>
                    </div>

                    {/* Right: Agent crawler terminal & Spawned competitor card */}
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: '1fr auto',
                      gap: '16px',
                      height: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}>
                      
                      {/* Scraper Terminal panel */}
                      <div style={{
                        background: '#030509',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '14px',
                        fontFamily: 'monospace',
                        fontSize: '9.5px',
                        color: '#f59e0b',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4'
                      }}>
                        <span style={{ color: '#818cf8', fontWeight: 'bold' }}>[Deep Research Agent Crawler Terminal]</span>
                        {simStep >= 1 && (
                          <div style={{ marginTop: '8px', color: '#cbd5e1' }}>
                            {simStep >= 1 && <div>[Research Agent] Querying PubMed Oncology registries... 200 OK</div>}
                            {simStep >= 2 && <div>[Web Crawler] Scraping Competitor Investor reports and SEC filing records...</div>}
                            {simStep >= 2 && <div>[Web Scraper] ClinicalTrials.gov (NCT0654321) scraped. Target pricing discount found (5%).</div>}
                            {simStep >= 3 && <div>[Synthesizer] Signal parsed successfully. Structuring competitor access matrix.</div>}
                            {simStep >= 4 && <div style={{ color: '#10b981', fontWeight: 'bold' }}>[Success] Knowledge Gap Filled. Spawned Strategic Competitor Card #CI-102.</div>}
                          </div>
                        )}
                        {simStep === 0 && (
                          <div style={{ marginTop: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Awaiting deployment. Click 'Execute' to deploy the Research crawler agent.
                          </div>
                        )}
                      </div>

                      {/* Spawned competitor card */}
                      {simStatus === 'completed' && (
                        <div className="glass-card animate-slide-up" style={{
                          padding: '14px',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
                          background: 'rgba(245,158,11,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              SPAWNED COMPETITOR INTELLIGENCE CARD
                            </span>
                            <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>ID: CI-102</span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '11px', color: 'white', fontWeight: 'bold' }}>
                            Competitor X Q3 Pricing & Access Strategy
                          </h4>
                          <p style={{ margin: 0, fontSize: '9.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            "Implication: Competitor X plans 5% discount on monotherapy, but our HEOR survival packaging offset allows price integrity."
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: Real-Time Scrolling Telemetry Log */}
              <div className="glass-card" style={{
                background: 'rgba(5, 7, 12, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '12px',
                padding: '12px 20px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', marginBottom: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📊 Multi-Agent Real-Time Telemetry Log
                  </span>
                  <span style={{ fontSize: '7.5px', color: 'var(--brand-cyan)' }}>
                    System Status: {simStatus === 'running' ? 'Active Ingress Pipeline' : 'Idle'}
                  </span>
                </div>
                
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '9.5px',
                  lineHeight: '1.4',
                  color: 'rgba(255,255,255,0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  paddingRight: '6px'
                }}>
                  {simLogs.map((log, logIdx) => (
                    <div key={logIdx} style={{
                      color: log.startsWith('⚠️') ? '#ef4444' : (log.startsWith('[System]') ? '#a5b4fc' : (log.includes('[Success]') || log.includes('✓') ? '#10b981' : 'rgba(255,255,255,0.85)'))
                    }}>
                      {log}
                    </div>
                  ))}
                  {simLogs.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                      Terminal Standby. Click 'Execute' to stream live multi-agent communication.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. EXECUTIVE DECK STUDIO */}
        {activeTab === 'deck' && (
          <div className="deck-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Left: Outline Pane */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '16px',
              overflowY: 'auto'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-blue)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  GOLT DELIVERABLE CONSOLE
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Executive Deck Studio
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Assemble, review, and compile the final Oncology Launch Strategy slide deck. Approve imperatives slide-by-slide.
                </p>
              </div>

              {/* Slide List (Interactive & Clickable!) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, marginTop: '10px' }}>
                {[
                  { index: 1, type: 'Title Slide', title: 'ITACS Adjuvant Launch Strategy', pillar: 'Executive Intro' },
                  { index: 2, type: 'Strategic Imperative', title: 'Sharpen Clinical Differentiation via Adjuvant Combo', pillar: 'Sharpen Clinical Differentiation' },
                  { index: 3, type: 'Strategic Imperative', title: 'Demonstrate Payer Value & HEOR Evidence', pillar: 'Demonstrate Payer Value' },
                  { index: 4, type: 'Strategic Imperative', title: 'Accelerate Diagnostic Screening Infrastructure', pillar: 'Accelerate Diagnostic Speed' },
                  { index: 5, type: 'Strategic Imperative', title: 'Optimize Operational Launch Readiness Timeline', pillar: 'Optimize Launch Readiness' }
                ].map(slide => {
                  const isActive = activePreviewSlide === slide.index;
                  return (
                    <div
                      key={slide.index}
                      onClick={() => setActivePreviewSlide(slide.index)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.01)',
                        border: isActive ? '1.5px solid var(--brand-cyan)' : '1px solid rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '7.5px', color: isActive ? 'var(--brand-cyan)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                          SLIDE {slide.index} • {slide.type}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                          {slide.title.substring(0, 32)}...
                        </h4>
                      </div>
                      
                      {/* Slide approval checkbox */}
                      <input
                        type="checkbox"
                        checked={deckApprovedSlides.includes(slide.index)}
                        onClick={(e) => e.stopPropagation()} // Prevent triggering slide selection when toggling checkbox
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDeckApprovedSlides(prev => [...prev, slide.index]);
                          } else {
                            setDeckApprovedSlides(prev => prev.filter(idx => idx !== slide.index));
                          }
                        }}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: 'var(--brand-cyan)',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    setIsCompilingDeck(true);
                    setCompilationStep(1);
                    setTimeout(() => setCompilationStep(2), 1500);
                    setTimeout(() => setCompilationStep(3), 3000);
                    setTimeout(() => {
                      setIsCompilingDeck(false);
                      alert("⚡ GOLT Strategic Presentation compiled successfully! Download dispatched.");
                    }, 4500);
                  }}
                  disabled={isCompilingDeck}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-indigo) 100%)',
                    fontWeight: 'bold',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={14} fill="white" />
                  {isCompilingDeck ? 'Compiling presentation deck...' : '⚡ Auto-Generate GOLT Deck'}
                </button>
                <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Approved Slides: {deckApprovedSlides.length} of 5 selected
                </div>
              </div>
            </div>

            {/* Right: Slide Preview Pane */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              {/* PPTX slide mockup container */}
              <div className="glass-card" style={{
                flex: 1,
                background: 'var(--bg-canvas)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                aspectRatio: '16/9',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}>
                {/* PPTX Border Badge */}
                <div style={{
                  position: 'absolute',
                  top: '20px', right: '24px',
                  fontSize: '8px',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Microsoft PowerPoint • 16:9 widescreen template
                </div>

                {/* Merck Corporate Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🧬</span>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '13px', color: 'var(--brand-cyan)', textTransform: 'uppercase', fontWeight: 800 }}>
                      ITACS GOLT STRATEGIC ROADMAP
                    </h5>
                    <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-muted)' }}>
                      Strictly Confidential • Oncology Launch Command
                    </p>
                  </div>
                </div>

                {/* Slide content area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                  {activePreviewSlide === 1 ? (
                    /* Slide 1: Premium Title Page Layout */
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center', height: '100%' }}>
                      <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: '1.25' }}>
                        ITACS Adjuvant Oncology Launch Strategy
                      </h1>
                      <p style={{ margin: 0, fontSize: '15px', color: 'var(--brand-cyan)', fontWeight: 600 }}>
                        Cross-Functional Alignment & Strategic Execution Roadmap for V940/MK-940
                      </p>
                      <div style={{ marginTop: '24px', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>Presented by: Global Oncology Leadership Team (GOLT)</span>
                        <span>Date: March 2026 Presentation Ready</span>
                      </div>
                    </div>
                  ) : (
                    /* Slides 2, 3, 4, 5: Dynamic Imperative Slide Layout */
                    <>
                      <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        {activePreviewSlide === 2 && "MK-940 Adjuvant Recurrence Risk Reduction Plan"}
                        {activePreviewSlide === 3 && "Payer Access Strategy & HEOR Value Realization"}
                        {activePreviewSlide === 4 && "Companion Diagnostic Scaling & Molecular Screening"}
                        {activePreviewSlide === 5 && "Vein-to-Vein Logistics & Practice Support Operations"}
                      </h1>
                      
                      {/* Grid showing bullets mapping to active Postgres memory */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '10px' }}>
                        <div style={{ borderLeft: '3px solid var(--brand-indigo)', paddingLeft: '14px' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--brand-indigo)', fontWeight: 700 }}>
                            {activePreviewSlide === 2 && "CLINICAL DIFFERENTIATION STRATEGY"}
                            {activePreviewSlide === 3 && "RISK-SHARING AGREEMENTS"}
                            {activePreviewSlide === 4 && "RAPID IHC TESTING ROLLOUT"}
                            {activePreviewSlide === 5 && "ULTRA-COLD CHAIN HUBS"}
                          </h4>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            {activePreviewSlide === 2 && "Provide robust HEOR overall survival models supporting personalized vaccine efficacy to global payers immediately at launch."}
                            {activePreviewSlide === 3 && "Formulate performance milestone-based rebate contracts with commercial insurers to bypass national step-therapy thresholds."}
                            {activePreviewSlide === 4 && "Deploy rapid IHC companion assay kits to 250+ community hospital pathology labs by Q4 to avoid chemotherapy misrouting."}
                            {activePreviewSlide === 5 && "Establish leased -70°C deep-freezer placement programs targeting tier-1 community oncology practices to secure storage capacity."}
                          </p>
                        </div>
                        <div style={{ borderLeft: '3px solid var(--brand-purple)', paddingLeft: '14px' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--brand-purple)', fontWeight: 700 }}>
                            {activePreviewSlide === 2 && "MARKET ACCESS REIMBURSEMENT ROADMAP"}
                            {activePreviewSlide === 3 && "SUBCUTANEOUS VALUE ARGUMENT"}
                            {activePreviewSlide === 4 && "NGS REFLEX PROTOCOLS"}
                            {activePreviewSlide === 5 && "ONCOLOGY PATIENT NAVIGATORS"}
                          </h4>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            {activePreviewSlide === 2 && "Engage payers via customized digital value folders in Q3 to offset prior-authorization friction and secure early Q1 clearance."}
                            {activePreviewSlide === 3 && "Highlight the 20% clinical throughput gain and nursing chair-time savings of the subcutaneous adjuvant formulation."}
                            {activePreviewSlide === 4 && "Standardize reflex testing protocols at surgical resection to ensure patient biomarker results are returned within 7 days."}
                            {activePreviewSlide === 5 && "Deploy dedicated clinical navigators to manage patient scheduling, biopsy routing, and prior-authorization approvals."}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer brand block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                    Author: Global Oncology Leadership Team (GOLT)
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'var(--brand-cyan)', fontWeight: 'bold' }}>
                    Slide {activePreviewSlide} of 5 • Approved: {deckApprovedSlides.includes(activePreviewSlide) ? '✓ Yes' : '✕ Pending'}
                  </span>
                </div>
              </div>

              {/* Deck Compiler Console */}
              {isCompilingDeck && (
                <div className="glass-card animate-scale-in" style={{
                  padding: '16px 20px',
                  background: 'rgba(5, 7, 12, 0.95)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <RefreshCw className="animate-spin" style={{ color: 'var(--brand-indigo)' }} size={20} />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, fontSize: '12px', color: 'white', fontWeight: 'bold' }}>
                      {compilationStep === 1 && "Ingesting approved OKF memory pillars..."}
                      {compilationStep === 2 && "Mapping strategic timelines and JSON metrics..."}
                      {compilationStep === 3 && "Injecting corporate slide templates & compiling PPTX..."}
                    </h5>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>
                      VLM document-generator pipeline active. Spiffe identity token checked.
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--brand-cyan)' }}>
                    {compilationStep * 33}% Complete
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. COMPETITIVE WARGAMING SANDBOX */}
        {activeTab === 'wargaming' && (
          <div className="wargaming-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            {/* Top row: Slider parameter controls */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-purple)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PREDICTIVE SCENARIO SIMULATOR
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Competitive Wargaming Sandbox
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>
                  Adjust competitor market variables using the sliders below. ITACS' AI instantly evaluates the structural risk on your Strategic Imperatives.
                </p>
              </div>

              {/* Sliders Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginTop: '10px' }}>
                {/* Slider 1: Competitor Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Competitor X FDA Approval</span>
                    <strong style={{ color: 'var(--brand-cyan)' }}>{warTimeline} Months</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={warTimeline}
                    onChange={(e) => setWarTimeline(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--brand-purple)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>Immediate (1m)</span>
                    <span>Delayed (12m)</span>
                  </div>
                </div>

                {/* Slider 2: Payer Rebates */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Competitor Rebate Pressure</span>
                    <strong style={{ color: 'var(--brand-cyan)' }}>{warRebate}% Discount</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={warRebate}
                    onChange={(e) => setWarRebate(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--brand-purple)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>0% rebate</span>
                    <span>Aggressive (50%)</span>
                  </div>
                </div>

                {/* Slider 3: Clinical OS Margin */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Trial OS (Overall Survival) Margin</span>
                    <strong style={{ color: 'var(--brand-cyan)' }}>+{warOSMargin}% Margin</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={warOSMargin}
                    onChange={(e) => setWarOSMargin(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--brand-purple)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>Unblinded (0%)</span>
                    <span>Superior (+30%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row: Impact Heatmap Matrix */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Imperative Strategic Impact Heatmap
                </h3>
                {/* Flash Warning Badge */}
                {(warRebate >= 30 || warOSMargin < 5) && (
                  <span className="animate-pulse" style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    ⚠️ ALERT: HIGH COMPETITIVE PRESSURE IN MARKET
                  </span>
                )}
              </div>

              {/* Heatmap Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '10px' }}>
                {[
                  {
                    id: 1,
                    title: 'CSF-1: Clinical Differentiation',
                    desc: 'Evaluates the survival margin difference against competitor discount plans.',
                    eval: () => {
                      if (warOSMargin >= 15) return { status: '🟢 LOW RISK', color: '#10b981', bg: 'rgba(16,185,129,0.02)', border: 'rgba(16,185,129,0.15)' };
                      if (warOSMargin >= 5) return { status: '🟡 MODERATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.02)', border: 'rgba(245,158,11,0.15)' };
                      return { status: '🔴 HIGH RISK', color: '#ef4444', bg: 'rgba(239,68,68,0.02)', border: 'rgba(239,68,68,0.15)' };
                    }
                  },
                  {
                    id: 2,
                    title: 'CSF-2: Payer Reimbursement Access',
                    desc: 'Evaluates pricing integrity under aggressive rebate demands.',
                    eval: () => {
                      if (warRebate <= 15) return { status: '🟢 LOW RISK', color: '#10b981', bg: 'rgba(16,185,129,0.02)', border: 'rgba(16,185,129,0.15)' };
                      if (warRebate <= 30) return { status: '🟡 MODERATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.02)', border: 'rgba(245,158,11,0.15)' };
                      return { status: '🔴 HIGH RISK', color: '#ef4444', bg: 'rgba(239,68,68,0.02)', border: 'rgba(239,68,68,0.15)' };
                    }
                  },
                  {
                    id: 3,
                    title: 'CSF-3: Diagnostic Speed & Scale',
                    desc: 'Evaluates operational readiness delays under competitor approval acceleration.',
                    eval: () => {
                      if (warTimeline >= 8) return { status: '🟢 LOW RISK', color: '#10b981', bg: 'rgba(16,185,129,0.02)', border: 'rgba(16,185,129,0.15)' };
                      if (warTimeline >= 4) return { status: '🟡 MODERATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.02)', border: 'rgba(245,158,11,0.15)' };
                      return { status: '🔴 HIGH RISK', color: '#ef4444', bg: 'rgba(239,68,68,0.02)', border: 'rgba(239,68,68,0.15)' };
                    }
                  }
                ].map(csf => {
                  const rating = csf.eval();
                  return (
                    <div
                      key={csf.id}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: rating.bg,
                        border: `1px solid ${rating.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {csf.title}
                          </h4>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: rating.color }}>
                            {rating.status}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {csf.desc}
                        </p>
                      </div>
                      
                      {/* Metric readout */}
                      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Current Threshold: <strong style={{ color: 'var(--text-primary)' }}>
                          {csf.id === 1 && `+${warOSMargin}% OS Margin`}
                          {csf.id === 2 && `${warRebate}% rebate`}
                          {csf.id === 3 && `${warTimeline}m competitor lead`}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. GLOBAL MARKET RADAR */}
        {activeTab === 'radar' && (
          <div className="radar-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Left: Region List & Filters */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '16px',
              overflowY: 'auto'
            }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  GEOGRAPHIC ROLLOUT GRID
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Global Market Radar
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Oncology launches are global. Filter the strategic memory log and insights database by clicking regional markets below.
                </p>
              </div>

              {/* Filter controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', flex: 1 }}>
                <button
                  onClick={() => setSelectedRegionFilter('ALL')}
                  className={`btn ${selectedRegionFilter === 'ALL' ? 'btn-primary' : 'btn-subtle'}`}
                  style={{ width: '100%', padding: '14px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '10px' }}
                >
                  <span>🌍 All Global Launch Insights</span>
                  <span style={{ fontWeight: 'bold' }}>{insights.length} Cards</span>
                </button>

                {[
                  { code: 'US', label: 'United States (FDA)', color: '#10b981', status: 'GREEN (Ready)', desc: 'FDA clearance achieved, clinical pathways validated.' },
                  { code: 'EU', label: 'European Union (EMA)', color: '#f59e0b', status: 'AMBER (HEOR Review)', desc: 'EMA approval secured; Germany G-BA pricing pushback active.' },
                  { code: 'APAC', label: 'Asia-Pacific (APAC)', color: '#f59e0b', status: 'AMBER (Diagnostic Lag)', desc: 'Japan PMDA bridge trials active; diagnostic kit scale delay.' }
                ].map(region => (
                  <button
                    key={region.code}
                    onClick={() => setSelectedRegionFilter(region.code)}
                    className="glass-card"
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      background: selectedRegionFilter === region.code ? 'rgba(255,255,255,0.03)' : 'transparent',
                      border: `1px solid ${selectedRegionFilter === region.code ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.04)'}`,
                      borderLeft: `3px solid ${region.color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 800 }}>{region.label}</strong>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: region.color }}>{region.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {region.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Filtered Strategic Memory Grid */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Active Region Filter: <strong style={{ color: 'var(--brand-cyan)' }}>{selectedRegionFilter === 'ALL' ? 'All Global Markets' : selectedRegionFilter}</strong>
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing {selectedRegionFilter === 'ALL' ? insights.length : insights.filter(ins => (selectedRegionFilter === 'US' && ins.metadata?.tumor === 'Melanoma') || (selectedRegionFilter === 'EU' && ins.metadata?.tumor === 'Head & Neck') || (selectedRegionFilter === 'APAC' && ins.metadata?.tumor === 'Lung')).length} strategic records
                </span>
              </div>

              {/* Cards Grid */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                alignContent: 'start',
                paddingRight: '6px'
              }}>
                {insights
                  .filter(ins => {
                    if (selectedRegionFilter === 'ALL') return true;
                    if (selectedRegionFilter === 'US') return ins.metadata?.tumor === 'Melanoma';
                    if (selectedRegionFilter === 'EU') return ins.metadata?.tumor === 'Head & Neck';
                    if (selectedRegionFilter === 'APAC') return ins.metadata?.tumor === 'Lung';
                    return true;
                  })
                  .map(ins => (
                    <div
                      key={ins.id}
                      className="glass-card animate-scale-in"
                      style={{
                        padding: '20px 24px',
                        borderLeft: `3px solid ${ins.strategic_pillar ? 'var(--brand-indigo)' : 'var(--brand-purple)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 'bold', color: 'var(--brand-cyan)', background: 'rgba(6,182,212,0.06)', padding: '4px 10px', borderRadius: '4px' }}>
                            {ins.strategic_pillar || 'UNASSIGNED PILLAR'}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ID: {ins.id.substring(0, 8)}</span>
                        </div>
                        <h4 style={{ margin: '6px 0 0 0', fontSize: '14.5px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                          {ins.title || ins.opportunity_space}
                        </h4>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          {ins.implication}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        <span>Asset: <strong style={{ color: 'var(--text-secondary)' }}>{ins.metadata?.asset || ins.asset || 'Oncology Asset'}</strong></span>
                        <span>Owner: <strong style={{ color: 'var(--text-secondary)' }}>{ins.metadata?.function_lane || ins.owner || 'Global Lead'}</strong></span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Bottom: Global Rollout Progress Telemetry (Brand new widget to fill empty space!) */}
              <div className="glass-card" style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flexShrink: 0,
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--glass-border)',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      LAUNCH VELOCITY MONITOR
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Global Regulatory Rollout Telemetry
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.06)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                    Overall Sync: 72%
                  </span>
                </div>

                {/* Progress bars for regions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>USA (FDA)</span>
                      <strong style={{ color: '#10b981' }}>100%</strong>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Approved & Ready</span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Europe (EMA)</span>
                      <strong style={{ color: '#f59e0b' }}>75%</strong>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '75%', height: '100%', background: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Under G-BA Pricing Rev.</span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Japan (PMDA)</span>
                      <strong style={{ color: '#f59e0b' }}>40%</strong>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '40%', height: '100%', background: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>PMDA Bridge Trial Active</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  🎯 <strong>AI Rollout Insight:</strong> Global launch velocity is stable. Primary blockers are Germany pricing negotiations and Japan diagnostic scale-up delays. Recommended next action: Dispatch pricing dossier package directly to European G-BA committee.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. AGENT SKILL STUDIO */}
        {activeTab === 'skills' && (
          <div className="skills-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Left: Dictionary Manager */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '16px',
              overflowY: 'auto'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  NO-CODE AI CONTROL ROOM
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Agent Skill Studio
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Visual dictionary management for the Compliance Supervisor agent. Add or remove custom forbidden vocabulary.
                </p>
              </div>

              {/* Forbidden Words List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', marginTop: '10px' }}>
                <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Active Compliance Dictionary ({forbiddenWords.length} tokens)
                </span>
                
                {forbiddenWords.map(word => (
                  <div
                    key={word}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(239,68,68,0.02)',
                      border: '1px solid rgba(239,68,68,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'white', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {word}
                    </span>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => {
                        setForbiddenWords(prev => prev.filter(w => w !== word));
                        setTestBenchResult(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Word Input */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <input
                  type="text"
                  placeholder="Type new forbidden word..."
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'white'
                  }}
                />
                <button
                  onClick={() => {
                    if (!newWordInput.trim()) return;
                    if (forbiddenWords.includes(newWordInput.trim())) return;
                    setForbiddenWords(prev => [...prev, newWordInput.trim()]);
                    setNewWordInput("");
                    setTestBenchResult(null);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '8px 14px', fontSize: '11px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Add Word
                </button>
              </div>
            </div>

            {/* Right: Test Bench chat window */}
            <div style={{
              display: 'grid',
              gridTemplateRows: '1fr auto',
              gap: '20px',
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              {/* Test Sandbox Terminal */}
              <div className="glass-card" style={{
                background: 'rgba(5, 7, 12, 0.6)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                overflowY: 'auto'
              }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={14} style={{ color: 'var(--brand-cyan)' }} /> Guardrail Validation Test Bench
                </h3>
                <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Write or paste a sample clinical draft below and click "Validate Guardrails" to verify how the supervisor agent intercepts commercial vocabulary before pushing it to production.
                </p>

                {/* Plaintext input */}
                <textarea
                  value={testBenchInput}
                  onChange={(e) => setTestBenchInput(e.target.value)}
                  placeholder="Example: Medical Affairs expectations: Strong clinical adoption in clinics which will drive rapid market share gains and guarantee a high ROI on our investments."
                  style={{
                    flex: 1,
                    background: '#04060b',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    color: 'white',
                    resize: 'none',
                    lineHeight: '1.6'
                  }}
                />

                {/* Validation Response Panel */}
                {testBenchResult && (
                  <div className="animate-scale-in" style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: testBenchResult.status === 'pass' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                    border: `1px solid ${testBenchResult.status === 'pass' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: testBenchResult.status === 'pass' ? '#10b981' : '#ef4444', textTransform: 'uppercase' }}>
                      {testBenchResult.status === 'pass' ? '✓ Compliance Verification Passed' : '⚠️ Guardrail Breach Intercepted'}
                    </span>
                    <p style={{ margin: 0, fontSize: '11px', color: 'white', lineHeight: '1.4' }}>
                      {testBenchResult.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Trigger Row */}
              <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    if (!testBenchInput.trim()) {
                      alert("Please type a test paragraph first.");
                      return;
                    }
                    const textLower = testBenchInput.toLowerCase();
                    const detected = forbiddenWords.filter(word => textLower.includes(word.toLowerCase()));
                    
                    if (detected.length > 0) {
                      setTestBenchResult({
                        status: 'fail',
                        message: `COMPLIANCE REGRESSION: Paragraph blocked. Prohibited lane vocabulary detected: [${detected.join(', ')}]. Spiffe gateway has quarantined this record.`
                      });
                    } else {
                      setTestBenchResult({
                        status: 'pass',
                        message: `SAFE CLINICAL DRAFT: Ingress pipeline approved. Zero compliance regressions found against active vocabulary dictionary.`
                      });
                    }
                  }}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--brand-indigo) 0%, var(--brand-purple) 100%)',
                    fontWeight: 'bold',
                    fontSize: '11.5px',
                    cursor: 'pointer'
                  }}
                >
                  Test Compliance Guardrail Rule
                </button>
                <button
                  onClick={() => {
                    setTestBenchInput("");
                    setTestBenchResult(null);
                  }}
                  className="btn btn-subtle"
                  style={{ padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '11.5px' }}
                >
                  Reset Bench
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. STAKEHOLDER ENGAGEMENT (KOL & DOL NETWORK GRAPH) */}
        {activeTab === 'kol' && (
          <div className="kol-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Left: Force-Directed Network Graph Mockup */}
            <div className="glass-card" style={{
              position: 'relative',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CLINICAL ADVOCACY NETWORK
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Key Opinion Leader (KOL) Network Graph
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Visualizes co-authorships, clinical trials, and sentiment toward our V940 asset. Click a node to inspect advocacy details.
                </p>
              </div>

              {/* Force-directed graph canvas mockup (6 Nodes dense web!) */}
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                {/* SVG Connections (Intricate Collaboration Web!) */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {/* Center to nodes */}
                  <line x1="50%" y1="50%" x2="25%" y2="30%" stroke="var(--glass-border)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="75%" y2="30%" stroke="var(--glass-border)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="30%" y2="75%" stroke="var(--glass-border)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="70%" y2="75%" stroke="var(--glass-border)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="50%" y2="18%" stroke="var(--glass-border)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="50%" y2="82%" stroke="var(--glass-border)" strokeWidth="1.5" />
                  
                  {/* Peer-to-peer collaboration links (co-authorship web!) */}
                  <line x1="25%" y1="30%" x2="50%" y2="18%" stroke="var(--brand-indigo)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="50%" y1="18%" x2="75%" y2="30%" stroke="var(--brand-indigo)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="25%" y1="30%" x2="30%" y2="75%" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="75%" y1="30%" x2="70%" y2="75%" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="30%" y1="75%" x2="50%" y2="82%" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="50%" y1="82%" x2="70%" y2="75%" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                </svg>

                {/* Center Asset Node */}
                <div style={{
                  position: 'absolute',
                  width: '84px', height: '84px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand-indigo) 0%, var(--brand-purple) 100%)',
                  border: '2.5px solid white',
                  boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  zIndex: 5
                }}>
                  <strong style={{ fontSize: '13px', color: 'white' }}>MK-940</strong>
                  <span style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.7)' }}>(V940)</span>
                </div>

                {/* Node 1: Dr. Sarah Patel */}
                <div 
                  onClick={() => setSelectedKol("Dr. Sarah Patel")}
                  style={{
                    position: 'absolute',
                    top: '30%', left: '25%',
                    width: '66px', height: '66px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${selectedKol === 'Dr. Sarah Patel' ? 'var(--brand-cyan)' : '#10b981'}`,
                    boxShadow: selectedKol === 'Dr. Sarah Patel' ? '0 0 15px var(--brand-cyan)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 4,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px' }}>👩‍⚕️</div>
                    <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>Patel</strong>
                  </div>
                </div>

                {/* Node 2: Dr. Marcus Vance */}
                <div 
                  onClick={() => setSelectedKol("Dr. Marcus Vance")}
                  style={{
                    position: 'absolute',
                    top: '30%', right: '25%',
                    width: '66px', height: '66px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${selectedKol === 'Dr. Marcus Vance' ? 'var(--brand-cyan)' : '#10b981'}`,
                    boxShadow: selectedKol === 'Dr. Marcus Vance' ? '0 0 15px var(--brand-cyan)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 4,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px' }}>👨‍⚕️</div>
                    <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>Vance</strong>
                  </div>
                </div>

                {/* Node 3: Dr. Aris Thorne */}
                <div 
                  onClick={() => setSelectedKol("Dr. Aris Thorne")}
                  style={{
                    position: 'absolute',
                    bottom: '25%', left: '30%',
                    width: '66px', height: '66px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${selectedKol === 'Dr. Aris Thorne' ? 'var(--brand-cyan)' : '#f59e0b'}`,
                    boxShadow: selectedKol === 'Dr. Aris Thorne' ? '0 0 15px var(--brand-cyan)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 4,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px' }}>👨‍⚕️</div>
                    <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>Thorne</strong>
                  </div>
                </div>

                {/* Node 4: Dr. Evelyn Chen */}
                <div 
                  onClick={() => setSelectedKol("Dr. Evelyn Chen")}
                  style={{
                    position: 'absolute',
                    bottom: '25%', right: '30%',
                    width: '66px', height: '66px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${selectedKol === 'Dr. Evelyn Chen' ? 'var(--brand-cyan)' : '#10b981'}`,
                    boxShadow: selectedKol === 'Dr. Evelyn Chen' ? '0 0 15px var(--brand-cyan)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 4,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px' }}>👩‍⚕️</div>
                    <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>Chen</strong>
                  </div>
                </div>

                {/* Node 5: Dr. Helen Ross (NEW!) */}
                <div 
                  onClick={() => setSelectedKol("Dr. Helen Ross")}
                  style={{
                    position: 'absolute',
                    top: '12%', left: '46%',
                    width: '66px', height: '66px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${selectedKol === 'Dr. Helen Ross' ? 'var(--brand-cyan)' : '#10b981'}`,
                    boxShadow: selectedKol === 'Dr. Helen Ross' ? '0 0 15px var(--brand-cyan)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 4,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px' }}>👩‍⚕️</div>
                    <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>Ross</strong>
                  </div>
                </div>

                {/* Node 6: Dr. Sanjay Gupta (NEW!) */}
                <div 
                  onClick={() => setSelectedKol("Dr. Sanjay Gupta")}
                  style={{
                    position: 'absolute',
                    bottom: '10%', left: '46%',
                    width: '66px', height: '66px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${selectedKol === 'Dr. Sanjay Gupta' ? 'var(--brand-cyan)' : '#10b981'}`,
                    boxShadow: selectedKol === 'Dr. Sanjay Gupta' ? '0 0 15px var(--brand-cyan)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 4,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px' }}>👨‍⚕️</div>
                    <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>Gupta</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>🟢 Positive Sentiment (&gt;75%)</span>
                <span>🟡 Neutral Payer Pushback (40%-70%)</span>
              </div>
            </div>

            {/* Right: KOL AI Sentiment Panel */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '20px',
              overflowY: 'auto'
            }}>
              {selectedKol ? (
                <>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      STAKEHOLDER PROFILE
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: 800 }}>
                      {selectedKol}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {selectedKol === 'Dr. Sarah Patel' && 'Oncology Department Chair, Harvard Medical School'}
                      {selectedKol === 'Dr. Marcus Vance' && 'Chief HEOR Strategy Lead, Berlin Health Institute'}
                      {selectedKol === 'Dr. Aris Thorne' && 'Payer Advisory Board Director, US Humana Network'}
                      {selectedKol === 'Dr. Evelyn Chen' && 'Clinical Lead and ASCO President (2026)'}
                      {selectedKol === 'Dr. Helen Ross' && 'Director of Thoracic Oncology, Mayo Clinic'}
                      {selectedKol === 'Dr. Sanjay Gupta' && 'Lead HEOR Investigator, MD Anderson'}
                    </p>
                  </div>

                  {/* Sentiment Metric Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>AI SENTIMENT</span>
                      <strong style={{ fontSize: '18px', color: selectedKol === 'Dr. Aris Thorne' ? '#f59e0b' : '#10b981' }}>
                        {selectedKol === 'Dr. Sarah Patel' && '95% Positive'}
                        {selectedKol === 'Dr. Marcus Vance' && '80% Positive'}
                        {selectedKol === 'Dr. Aris Thorne' && '45% Neutral'}
                        {selectedKol === 'Dr. Evelyn Chen' && '90% Positive'}
                        {selectedKol === 'Dr. Helen Ross' && '92% Positive'}
                        {selectedKol === 'Dr. Sanjay Gupta' && '88% Positive'}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>ADVOCACY ALIGNMENT</span>
                      <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>
                        {selectedKol === 'Dr. Sarah Patel' && 'Clinical Efficacy'}
                        {selectedKol === 'Dr. Marcus Vance' && 'HEOR Evidence'}
                        {selectedKol === 'Dr. Aris Thorne' && 'Prior-Auth Cost'}
                        {selectedKol === 'Dr. Evelyn Chen' && 'Adjuvant Trial Lead'}
                        {selectedKol === 'Dr. Helen Ross' && 'Subcutaneous Option'}
                        {selectedKol === 'Dr. Sanjay Gupta' && 'Biomarker Compliance'}
                      </strong>
                    </div>
                  </div>

                  {/* PubMed Publication History */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h5 style={{ margin: 0, fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                      Recent PubMed & ASCO Abstracts
                    </h5>
                    
                    {[
                      {
                        title: selectedKol === 'Dr. Aris Thorne' ? 'Payer prior-authorization timelines and clinical outcomes in adjuvant melanoma' : 
                               selectedKol === 'Dr. Helen Ross' ? 'Operational capacity gains of rapid subcutaneous immunotherapies in thoracic clinics' :
                               selectedKol === 'Dr. Sanjay Gupta' ? 'Biomarker-directed therapy sequencing and real-world PFS in KRAS G12C NSCLC' :
                               'Efficacy and safety of personalized mRNA vaccine combo V940 in melanoma',
                        journal: selectedKol === 'Dr. Aris Thorne' ? 'Journal of Managed Care Pharmacy (2026)' : 
                                 selectedKol === 'Dr. Helen Ross' ? 'Journal of Oncology Practice (2026)' :
                                 selectedKol === 'Dr. Sanjay Gupta' ? 'Nature Medicine (2025)' :
                                 'New England Journal of Medicine (2025)',
                        sentiment: selectedKol === 'Dr. Aris Thorne' ? 'Neutral' : 'Highly Positive'
                      },
                      {
                        title: selectedKol === 'Dr. Aris Thorne' ? 'Reimbursement cost-effectiveness thresholds for personalized gene therapies' : 
                               selectedKol === 'Dr. Helen Ross' ? 'Patient preference and adherence metrics for home-administered adjuvant lung therapies' :
                               selectedKol === 'Dr. Sanjay Gupta' ? 'Cost-effectiveness thresholds of multi-gene diagnostic panels in early lung cancer' :
                               'Phase 3 trial design and endpoints for neoadjuvant NSCLC vaccine protocols',
                        journal: selectedKol === 'Dr. Aris Thorne' ? 'HEOR Quarterly Review (2026)' : 
                                 selectedKol === 'Dr. Helen Ross' ? 'Lancet Respiratory Medicine (2026)' :
                                 selectedKol === 'Dr. Sanjay Gupta' ? 'Value in Health (2026)' :
                                 'Lancet Oncology (2026)',
                        sentiment: selectedKol === 'Dr. Aris Thorne' ? 'Moderate HEOR Friction' : 'Positive'
                      }
                    ].map((pub, pubIdx) => (
                      <div key={pubIdx} style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <h6 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 'bold', lineHeight: '1.4' }}>
                          {pub.title}
                        </h6>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>{pub.journal}</span>
                          <span style={{ color: pub.sentiment.includes('Positive') ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{pub.sentiment}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sentiment summary */}
                  <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', padding: '16px 18px', borderRadius: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    <strong style={{ fontSize: '12.5px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>AI Sentiment Analysis Summary:</strong>
                    {selectedKol === 'Dr. Sarah Patel' && 'Dr. Patel is a highly vocal advocate for our clinical efficacy data. Her recent ASCO presentations strongly endorse the 44% recurrence risk reduction.'}
                    {selectedKol === 'Dr. Marcus Vance' && 'Dr. Vance supports our HEOR package but notes that Germany pricing reviews will require strict overall survival endpoints compared to pembrolizumab alone.'}
                    {selectedKol === 'Dr. Aris Thorne' && 'Dr. Thorne represents significant payer friction. He demands further cost-effectiveness models and cold-chain operational guarantee data before easing prior-authorization restrictions.'}
                    {selectedKol === 'Dr. Evelyn Chen' && 'Dr. Chen is highly optimistic about trial expansions in adjuvant lung cancer. She recommends accelerating patient diagnostic kit rollouts to clinics.'}
                    {selectedKol === 'Dr. Helen Ross' && 'Dr. Ross is a strong proponent of our subcutaneous formulation. She emphasizes that shifting stable patients to a 5-minute injection is critical to relieving clinic nursing shortages.'}
                    {selectedKol === 'Dr. Sanjay Gupta' && 'Dr. Gupta is highly supportive of our biomarker-driven sequencing models. He advocates for standardizing early reflex IHC screening to avoid chemotherapy misrouting.'}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', fontSize: '13px' }}>
                  Select a KOL node on the graph to inspect sentiment and clinical advocacy logs.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MANUFACTURING READINESS (VEIN-TO-VEIN LOGISTICS) */}
        {activeTab === 'logistics' && (
          <div className="logistics-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            {/* Top Row: Logistics Overview */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-purple)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PERSONALIZED mRNA SUPPLY CHAIN
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Vein-to-Vein Logistics Radar
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>
                  Personalized cancer vaccines (V940) require biopsy extraction, rapid sequencing, custom manufacturing, and cold-chain clinic infusion within 22 days.
                </p>
              </div>

              {/* Dynamic Warning Alert */}
              {logisticsManufacturing >= 95 && (
                <div className="animate-pulse" style={{
                  padding: '12px 16px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '16px' }}>🔴</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '11px', color: '#fca5a5' }}>
                      CAPACITY BOTTLE-NECK WARNING: Custom vaccine manufacturing slots are at {logisticsManufacturing}% capacity.
                    </strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#fca5a5' }}>
                      Patient Turnaround Time (TAT) is projected to slip from 18 days to 24 days. Action required: Allocate backup manufacturing lines in Merck Jersey Hub.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Pipeline Diagram Mockup & Node Sliders */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '32px'
            }}>
              
              {/* Left: Pipeline Diagram Flow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Vein-to-Vein Pipeline Flow Chart
                </h3>
                
                {/* Horizontal nodes list representing flow */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', alignItems: 'center', gap: '8px', padding: '20px 0' }}>
                  
                  {/* Node 1: Biopsy */}
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: `1px solid ${logisticsBiopsy >= 90 ? '#ef4444' : 'var(--glass-border)'}`,
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '6px' }}>🩸</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block' }}>1. Biopsy Extraction</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Clinic Capacity: {logisticsBiopsy}%</span>
                  </div>

                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

                  {/* Node 2: Sequencing */}
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: `1px solid ${logisticsSequencing >= 90 ? '#ef4444' : 'var(--glass-border)'}`,
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '6px' }}>🧬</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block' }}>2. Tumor Sequencing</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lab Capacity: {logisticsSequencing}%</span>
                  </div>

                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

                  {/* Node 3: Manufacturing */}
                  <div style={{
                    background: logisticsManufacturing >= 95 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)',
                    border: `2px solid ${logisticsManufacturing >= 95 ? '#ef4444' : 'var(--glass-border)'}`,
                    boxShadow: logisticsManufacturing >= 95 ? '0 0 15px rgba(239,68,68,0.2)' : 'none',
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '6px' }}>🏭</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block' }}>3. Manufacturing</strong>
                    <span style={{ fontSize: '10px', color: logisticsManufacturing >= 95 ? '#fca5a5' : 'var(--text-muted)' }}>Slot Capacity: {logisticsManufacturing}%</span>
                  </div>

                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

                  {/* Node 4: Infusion */}
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: `1px solid ${logisticsInfusion >= 90 ? '#ef4444' : 'var(--glass-border)'}`,
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '6px' }}>💉</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block' }}>4. Infusion Clinic</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Slot Capacity: {logisticsInfusion}%</span>
                  </div>
                </div>
              </div>

              {/* Right: Simulated capacity controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '24px' }}>
                <h4 style={{ margin: 0, fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  Simulate Capacity Loads
                </h4>
                
                {[
                  { label: 'Biopsy Slot Load', state: logisticsBiopsy, setter: setLogisticsBiopsy },
                  { label: 'DNA Sequencing Load', state: logisticsSequencing, setter: setLogisticsSequencing },
                  { label: 'mRNA Manufacturing Load', state: logisticsManufacturing, setter: setLogisticsManufacturing },
                  { label: 'Adjuvant Infusion Load', state: logisticsInfusion, setter: setLogisticsInfusion }
                ].map((ctrl, ctrlIdx) => (
                  <div key={ctrlIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{ctrl.label}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{ctrl.state}%</strong>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={ctrl.state}
                      onChange={(e) => ctrl.setter(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--brand-purple)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. REGULATORY & LABEL CASCADES (MULTIPLE INDICATION GANTT) */}
        {activeTab === 'cascade' && (
          <div className="cascade-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            {/* Top row: Indication Roadmap Header */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  MULTI-INDICATIONS PIPELINE
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Regulatory & Label Cascades
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>
                  Tracks clinical trial readouts, FDA PDUFA action dates, and commercial launch windows across parallel oncology indications.
                </p>
              </div>

              {/* Indication Filters */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {['ALL', 'MELANOMA', 'NSCLC', 'RCC', 'HNSCC', 'BLADDER'].map(ind => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndicationFilter(ind)}
                    className={`btn ${selectedIndicationFilter === ind ? 'btn-primary' : 'btn-subtle'}`}
                    style={{ fontSize: '10px', padding: '6px 12px', cursor: 'pointer' }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: Gantt Chart Mockup */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Regulatory & Commercial Indication Roadmap (Q1 2026 - Q4 2027)
              </h3>

              {/* Gantt Timeline tracks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '10px' }}>
                {/* Melanoma Lane */}
                {(selectedIndicationFilter === 'ALL' || selectedIndicationFilter === 'MELANOMA') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <strong style={{ color: 'var(--brand-cyan)' }}>1. MELANOMA (ADJUVANT COMBO V940)</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Phase 3 Efficacy: Primary Endpoints Met</span>
                    </div>
                    
                    {/* Visual Gantt Bar */}
                    <div style={{ position: 'relative', height: '36px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                      {/* Clinical Readout Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('melanoma_readout')}
                        style={{
                          position: 'absolute',
                          left: '10%', width: '25%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'melanoma_readout' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.12)',
                          borderRight: '2px solid var(--brand-cyan)',
                          outline: selectedRoadmapMilestone === 'melanoma_readout' ? '2px solid var(--brand-cyan)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'melanoma_readout' ? 'inset 0 0 12px rgba(6, 182, 212, 0.3), 0 0 15px rgba(6, 182, 212, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-cyan)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'melanoma_readout' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Clinical Trial details"
                      >
                        Trial Readout (Q2 '26)
                      </div>
                      
                      {/* FDA Action PDUFA Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('melanoma_pdufa')}
                        style={{
                          position: 'absolute',
                          left: '35%', width: '30%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'melanoma_pdufa' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)',
                          borderRight: '2px solid var(--brand-indigo)',
                          outline: selectedRoadmapMilestone === 'melanoma_pdufa' ? '2px solid var(--brand-indigo)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'melanoma_pdufa' ? 'inset 0 0 12px rgba(99, 102, 241, 0.3), 0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-indigo)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'melanoma_pdufa' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore FDA Review details"
                      >
                        FDA PDUFA Review (Q4 '26)
                      </div>
 
                      {/* Commercial Launch Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('melanoma_launch')}
                        style={{
                          position: 'absolute',
                          left: '65%', width: '35%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'melanoma_launch' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
                          borderRight: '2px solid var(--brand-purple)',
                          outline: selectedRoadmapMilestone === 'melanoma_launch' ? '2px solid var(--brand-purple)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'melanoma_launch' ? 'inset 0 0 12px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-purple)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'melanoma_launch' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Launch Readiness details"
                      >
                        🚀 Commercial Launch (Q1 '27)
                      </div>
                    </div>
                  </div>
                )}
 
                {/* NSCLC Lane */}
                {(selectedIndicationFilter === 'ALL' || selectedIndicationFilter === 'NSCLC') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <strong style={{ color: '#f59e0b' }}>2. NON-SMALL CELL LUNG CANCER (NSCLC NEOADJUVANT)</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Phase 3 Accrual: Enrolling Active Patients</span>
                    </div>
                    
                    {/* Visual Gantt Bar */}
                    <div style={{ position: 'relative', height: '36px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                      {/* Clinical Readout Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('nsclc_readout')}
                        style={{
                          position: 'absolute',
                          left: '30%', width: '25%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'nsclc_readout' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.12)',
                          borderRight: '2px solid #f59e0b',
                          outline: selectedRoadmapMilestone === 'nsclc_readout' ? '2px solid #f59e0b' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'nsclc_readout' ? 'inset 0 0 12px rgba(245, 158, 11, 0.3), 0 0 15px rgba(245, 158, 11, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: '#f59e0b',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'nsclc_readout' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Clinical Trial details"
                      >
                        Trial Readout (Q1 '27)
                      </div>
                      
                      {/* FDA Action PDUFA Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('nsclc_pdufa')}
                        style={{
                          position: 'absolute',
                          left: '55%', width: '25%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'nsclc_pdufa' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)',
                          borderRight: '2px solid var(--brand-indigo)',
                          outline: selectedRoadmapMilestone === 'nsclc_pdufa' ? '2px solid var(--brand-indigo)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'nsclc_pdufa' ? 'inset 0 0 12px rgba(99, 102, 241, 0.3), 0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-indigo)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'nsclc_pdufa' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore FDA Review details"
                      >
                        FDA PDUFA (Q3 '27)
                      </div>
 
                      {/* Commercial Launch Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('nsclc_launch')}
                        style={{
                          position: 'absolute',
                          left: '80%', width: '20%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'nsclc_launch' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
                          borderRight: '2px solid var(--brand-purple)',
                          outline: selectedRoadmapMilestone === 'nsclc_launch' ? '2px solid var(--brand-purple)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'nsclc_launch' ? 'inset 0 0 12px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-purple)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'nsclc_launch' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Launch Readiness details"
                      >
                        🚀 Launch (Q4 '27)
                      </div>
                    </div>
                  </div>
                )}

                {/* RCC Lane */}
                {(selectedIndicationFilter === 'ALL' || selectedIndicationFilter === 'RCC') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <strong style={{ color: '#10b981' }}>3. RCC (ADJUVANT POST-NEPHRECTOMY)</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Phase 3 Accrual: Active Patient Screening</span>
                    </div>
                    
                    {/* Visual Gantt Bar */}
                    <div style={{ position: 'relative', height: '36px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                      {/* Clinical Readout Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('rcc_readout')}
                        style={{
                          position: 'absolute',
                          left: '40%', width: '25%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'rcc_readout' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
                          borderRight: '2px solid #10b981',
                          outline: selectedRoadmapMilestone === 'rcc_readout' ? '2px solid #10b981' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'rcc_readout' ? 'inset 0 0 12px rgba(16, 185, 129, 0.3), 0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: '#10b981',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'rcc_readout' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Clinical Trial details"
                      >
                        Trial Readout (Q3 '27)
                      </div>
                      
                      {/* FDA Action PDUFA Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('rcc_pdufa')}
                        style={{
                          position: 'absolute',
                          left: '65%', width: '20%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'rcc_pdufa' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)',
                          borderRight: '2px solid var(--brand-indigo)',
                          outline: selectedRoadmapMilestone === 'rcc_pdufa' ? '2px solid var(--brand-indigo)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'rcc_pdufa' ? 'inset 0 0 12px rgba(99, 102, 241, 0.3), 0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-indigo)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'rcc_pdufa' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore FDA Review details"
                      >
                        FDA PDUFA (Q1 '28)
                      </div>
 
                      {/* Commercial Launch Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('rcc_launch')}
                        style={{
                          position: 'absolute',
                          left: '85%', width: '15%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'rcc_launch' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
                          borderRight: '2px solid var(--brand-purple)',
                          outline: selectedRoadmapMilestone === 'rcc_launch' ? '2px solid var(--brand-purple)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'rcc_launch' ? 'inset 0 0 12px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-purple)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'rcc_launch' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Launch Readiness details"
                      >
                        🚀 Launch (Q2 '28)
                      </div>
                    </div>
                  </div>
                )}

                {/* HNSCC Lane */}
                {(selectedIndicationFilter === 'ALL' || selectedIndicationFilter === 'HNSCC') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <strong style={{ color: '#ec4899' }}>4. HNSCC (RESECTED HEAD & NECK CANCER)</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Phase 2 Cohort: High Pathological Response Met</span>
                    </div>
                    
                    {/* Visual Gantt Bar */}
                    <div style={{ position: 'relative', height: '36px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                      {/* Clinical Readout Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('hnscc_readout')}
                        style={{
                          position: 'absolute',
                          left: '5%', width: '20%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'hnscc_readout' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(236, 72, 153, 0.12)',
                          borderRight: '2px solid #ec4899',
                          outline: selectedRoadmapMilestone === 'hnscc_readout' ? '2px solid #ec4899' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'hnscc_readout' ? 'inset 0 0 12px rgba(236, 72, 153, 0.3), 0 0 15px rgba(236, 72, 153, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: '#ec4899',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'hnscc_readout' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Clinical Trial details"
                      >
                        Trial Readout (Q1 '26)
                      </div>
                      
                      {/* FDA Action PDUFA Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('hnscc_pdufa')}
                        style={{
                          position: 'absolute',
                          left: '25%', width: '25%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'hnscc_pdufa' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)',
                          borderRight: '2px solid var(--brand-indigo)',
                          outline: selectedRoadmapMilestone === 'hnscc_pdufa' ? '2px solid var(--brand-indigo)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'hnscc_pdufa' ? 'inset 0 0 12px rgba(99, 102, 241, 0.3), 0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-indigo)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'hnscc_pdufa' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore FDA Review details"
                      >
                        FDA PDUFA (Q3 '26)
                      </div>
 
                      {/* Commercial Launch Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('hnscc_launch')}
                        style={{
                          position: 'absolute',
                          left: '50%', width: '20%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'hnscc_launch' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
                          borderRight: '2px solid var(--brand-purple)',
                          outline: selectedRoadmapMilestone === 'hnscc_launch' ? '2px solid var(--brand-purple)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'hnscc_launch' ? 'inset 0 0 12px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-purple)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'hnscc_launch' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Launch Readiness details"
                      >
                        🚀 Launch (Q4 '26)
                      </div>
                    </div>
                  </div>
                )}

                {/* Bladder Lane */}
                {(selectedIndicationFilter === 'ALL' || selectedIndicationFilter === 'BLADDER') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <strong style={{ color: 'var(--brand-cyan)' }}>5. UROTHELIAL CARCINOMA (BLADDER CANCER)</strong>
                      <span style={{ color: 'var(--text-muted)' }}>IND Phase: Trial Protocol Activated</span>
                    </div>
                    
                    {/* Visual Gantt Bar */}
                    <div style={{ position: 'relative', height: '36px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                      {/* Clinical Readout Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('bladder_readout')}
                        style={{
                          position: 'absolute',
                          left: '60%', width: '25%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'bladder_readout' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.12)',
                          borderRight: '2px solid var(--brand-cyan)',
                          outline: selectedRoadmapMilestone === 'bladder_readout' ? '2px solid var(--brand-cyan)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'bladder_readout' ? 'inset 0 0 12px rgba(6, 182, 212, 0.3), 0 0 15px rgba(6, 182, 212, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-cyan)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'bladder_readout' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore Clinical Trial details"
                      >
                        Trial Readout (Q4 '27)
                      </div>
                      
                      {/* FDA Action PDUFA Phase */}
                      <div 
                        onClick={() => setSelectedRoadmapMilestone('bladder_pdufa')}
                        style={{
                          position: 'absolute',
                          left: '85%', width: '15%',
                          height: '100%',
                          background: selectedRoadmapMilestone === 'bladder_pdufa' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)',
                          borderRight: '2px solid var(--brand-indigo)',
                          outline: selectedRoadmapMilestone === 'bladder_pdufa' ? '2px solid var(--brand-indigo)' : 'none',
                          boxShadow: selectedRoadmapMilestone === 'bladder_pdufa' ? 'inset 0 0 12px rgba(99, 102, 241, 0.3), 0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          fontSize: '11.5px',
                          color: 'var(--brand-indigo)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: selectedRoadmapMilestone === 'bladder_pdufa' ? 3 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to explore FDA Review details"
                      >
                        FDA PDUFA (Q2 '28)
                      </div>
                    </div>
                  </div>
                )}
              </div>
 
              {/* Timeline calibration grid scale */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', borderTop: '1px solid var(--glass-border)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                <span>Q1 2026</span>
                <span>Q2 2026</span>
                <span>Q3 2026</span>
                <span>Q4 2026</span>
                <span>Q1 2027</span>
                <span>Q2 2027</span>
                <span>Q3 2027</span>
                <span>Q4 2027</span>
              </div>
 
              {/* INTERACTIVE REGULATORY BRIEFING CONSOLE (Aesthetic Highlight!) */}
              {selectedRoadmapMilestone && (
                <div className="glass-card animate-scale-in" style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  marginTop: '10px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  position: 'relative'
                }}>
                  {/* Close Button */}
                  <button 
                    onClick={() => setSelectedRoadmapMilestone(null)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Close Briefing"
                  >
                    <X size={16} />
                  </button>
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 'bold',
                        color: selectedRoadmapMilestone.includes('readout') ? 'var(--brand-cyan)' : (selectedRoadmapMilestone.includes('pdufa') ? 'var(--brand-indigo)' : 'var(--brand-purple)'),
                        background: selectedRoadmapMilestone.includes('readout') ? 'rgba(6, 182, 212, 0.08)' : (selectedRoadmapMilestone.includes('pdufa') ? 'rgba(99, 102, 241, 0.08)' : 'rgba(139, 92, 246, 0.08)'),
                        border: `1px solid ${selectedRoadmapMilestone.includes('readout') ? 'rgba(6, 182, 212, 0.25)' : (selectedRoadmapMilestone.includes('pdufa') ? 'rgba(99, 102, 241, 0.25)' : 'rgba(139, 92, 246, 0.25)')}`,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {selectedRoadmapMilestone.includes('readout') ? 'Clinical Trial Milestone' : (selectedRoadmapMilestone.includes('pdufa') ? 'Regulatory Approval Gating' : 'Commercial Go-To-Market Launch')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status:</span>
                      <strong style={{ fontSize: '11.5px', color: '#10b981' }}>
                        {selectedRoadmapMilestone === 'melanoma_readout' && "On Track"}
                        {selectedRoadmapMilestone === 'melanoma_pdufa' && "Active Review"}
                        {selectedRoadmapMilestone === 'melanoma_launch' && "Readiness Active"}
                        {selectedRoadmapMilestone === 'nsclc_readout' && "Patient Accrual Active"}
                        {selectedRoadmapMilestone === 'nsclc_pdufa' && "Preparation Phase"}
                        {selectedRoadmapMilestone === 'nsclc_launch' && "Planning Stage"}
                        {selectedRoadmapMilestone === 'rcc_readout' && "Patient Accrual Active"}
                        {selectedRoadmapMilestone === 'rcc_pdufa' && "Preparation Phase"}
                        {selectedRoadmapMilestone === 'rcc_launch' && "Planning Stage"}
                        {selectedRoadmapMilestone === 'hnscc_readout' && "Completed"}
                        {selectedRoadmapMilestone === 'hnscc_pdufa' && "Active Review"}
                        {selectedRoadmapMilestone === 'hnscc_launch' && "Readiness Active"}
                        {selectedRoadmapMilestone === 'bladder_readout' && "Planning Stage"}
                        {selectedRoadmapMilestone === 'bladder_pdufa' && "Planning Stage"}
                      </strong>
                    </div>
 
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {selectedRoadmapMilestone === 'melanoma_readout' && "Phase 3 KEYNOTE-940 Efficacy Topline Readout"}
                        {selectedRoadmapMilestone === 'melanoma_pdufa' && "FDA Priority BLA Action Date (PDUFA) Review"}
                        {selectedRoadmapMilestone === 'melanoma_launch' && "Melanoma Commercial Launch & Vein-to-Vein Pipeline"}
                        {selectedRoadmapMilestone === 'nsclc_readout' && "Phase 3 KEYNOTE-A18 EFS & pCR Accrual Readout"}
                        {selectedRoadmapMilestone === 'nsclc_pdufa' && "FDA BLA Regulatory Label Expansion Action Date"}
                        {selectedRoadmapMilestone === 'nsclc_launch' && "Lung Oncology Commercial Launch Ingress Readiness"}
                        {selectedRoadmapMilestone === 'rcc_readout' && "Phase 3 KEYNOTE-B24 Renal Cell Trial Readout"}
                        {selectedRoadmapMilestone === 'rcc_pdufa' && "FDA BLA Submission & Priority Action Date"}
                        {selectedRoadmapMilestone === 'rcc_launch' && "Adjuvant RCC Commercial Go-To-Market Integration"}
                        {selectedRoadmapMilestone === 'hnscc_readout' && "Phase 2 KEYNOTE-C08 Pathological Response Efficacy"}
                        {selectedRoadmapMilestone === 'hnscc_pdufa' && "FDA Breakthrough Accelerated Approval Review"}
                        {selectedRoadmapMilestone === 'hnscc_launch' && "Head & Neck Commercial Ingress & Companion Assay Setup"}
                        {selectedRoadmapMilestone === 'bladder_readout' && "Phase 3 Urothelial Carcinoma Trial Protocol Readout"}
                        {selectedRoadmapMilestone === 'bladder_pdufa' && "FDA BLA Submission Gating (Urothelial)"}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {selectedRoadmapMilestone === 'melanoma_readout' && "Q2 2026 Target Readout • Primary Cohorts"}
                        {selectedRoadmapMilestone === 'melanoma_pdufa' && "Q4 2026 Target Action • RTOR Channel"}
                        {selectedRoadmapMilestone === 'melanoma_launch' && "Q1 2027 Global Launch • Regional Hubs"}
                        {selectedRoadmapMilestone === 'nsclc_readout' && "Q1 2027 Target Readout • Pathological Response"}
                        {selectedRoadmapMilestone === 'nsclc_pdufa' && "Q3 2027 Target Label Decision • Companion Dx"}
                        {selectedRoadmapMilestone === 'nsclc_launch' && "Q4 2027 Target Ingress • Reflex Testing"}
                        {selectedRoadmapMilestone === 'rcc_readout' && "Q3 2027 Target Readout • Disease-Free Survival"}
                        {selectedRoadmapMilestone === 'rcc_pdufa' && "Q1 2028 Target Action • Priority Label Submission"}
                        {selectedRoadmapMilestone === 'rcc_launch' && "Q2 2028 Target Launch • Post-Nephrectomy Ingress"}
                        {selectedRoadmapMilestone === 'hnscc_readout' && "Q1 2026 Readout (Completed) • 38% MPR Achieved"}
                        {selectedRoadmapMilestone === 'hnscc_pdufa' && "Q3 2026 Target Action • Accelerated Path"}
                        {selectedRoadmapMilestone === 'hnscc_launch' && "Q4 2026 Target Ingress • Companion Diagnostic Installation"}
                        {selectedRoadmapMilestone === 'bladder_readout' && "Q4 2027 Target Readout • Event-Free Survival"}
                        {selectedRoadmapMilestone === 'bladder_pdufa' && "Q2 2028 Target Action • Diagnostic Screening Setup"}
                      </p>
                    </div>
 
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                      {selectedRoadmapMilestone === 'melanoma_readout' && "Primary Endpoint: Recurrence-Free Survival (RFS) topline efficacy. Positive results will trigger immediate priority BLA filing strategy. Patient cohort covers stage III/IV resected high-risk melanoma with pembrolizumab combotherapy."}
                      {selectedRoadmapMilestone === 'melanoma_pdufa' && "Covers adjuvant combination label for mRNA-940 + pembrolizumab. Real-Time Oncology Review (RTOR) channel has been initiated with the FDA to accelerate review cycles and secure early Q4 label clearance."}
                      {selectedRoadmapMilestone === 'melanoma_launch' && "Deploying specialized oncology patient navigators to key community clinics to coordinate prior-authorizations. Establishing leased -70°C deep-freezer placement programs at Tier-1 practices to secure cold-chain capacity."}
                      {selectedRoadmapMilestone === 'nsclc_readout' && "Evaluating neoadjuvant mRNA-940 + pembrolizumab followed by adjuvant monotherapy. High strategic importance to secure early pathological Complete Response (pCR) data to challenge chemotherapy monotherapy."}
                      {selectedRoadmapMilestone === 'nsclc_pdufa' && "Regulatory filing covering resectable stage II, IIIA, or IIIB NSCLC. Companion diagnostic PD-L1 expression gating protocols are being aligned with global pathology labs to streamline screening."}
                      {selectedRoadmapMilestone === 'nsclc_launch' && "Standardizing surgical reflex testing protocols at primary resection. Deploying rapid IHC companion diagnostic kits to 250+ community hospital pathology labs by Q4 to guarantee turnaround times under 7 days."}
                      {selectedRoadmapMilestone === 'rcc_readout' && "Primary Endpoint: Disease-Free Survival (DFS). Evaluating adjuvant combotherapy in patients post-nephrectomy at intermediate-to-high risk. Positive results will extend personalized vaccines to urological oncology hubs."}
                      {selectedRoadmapMilestone === 'rcc_pdufa' && "Targeting first-line adjuvant label extension. Priority review pathway submission scheduled to bypass traditional tyrosine kinase inhibitor (TKI) combinations and establish vaccination standards."}
                      {selectedRoadmapMilestone === 'rcc_launch' && "Partnering with global urology networks to align referral pathways. Integrating clinical education into nephrectomy post-operative protocols to identify eligible vaccine candidates within 14 days."}
                      {selectedRoadmapMilestone === 'hnscc_readout' && "Primary Endpoint: Major Pathological Response (MPR). Phase 2 signal-finding study met its key endpoints with a highly statistically significant 38% MPR, establishing robust clinical validation in resectable Head & Neck cancer."}
                      {selectedRoadmapMilestone === 'hnscc_pdufa' && "Breakthrough Therapy Designation granted by the FDA. Accelerated approval filing pathway initiated to fast-track BLA review and deliver neoadjuvant therapies to patients with high unmet medical need."}
                      {selectedRoadmapMilestone === 'hnscc_launch' && "Deploying targeted companion diagnostic assay installation campaigns to 150+ academic medical centers. Training surgical and pathology staff on pre-operative tissue collection protocols to secure high-yield RNA extraction."}
                      {selectedRoadmapMilestone === 'bladder_readout' && "Phase 3 clinical protocol finalized. Target trial covers adjuvant urothelial carcinoma post-cystectomy. Screening protocols focus on high-risk muscle-invasive disease states."}
                      {selectedRoadmapMilestone === 'bladder_pdufa' && "Regulatory timeline tracks companion diagnostic assays. Aligning companion diagnostic immunohistochemistry (IHC) markers to support patient identification at the time of surgical cystectomy."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. STRATEGIC RESOURCE ALLOCATION (BUDGET TREE-MAP) */}
        {activeTab === 'budget' && (
          <div className="budget-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            {/* Top Row: Budget Strategy Overview */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-purple)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  FINANCIAL STRATEGY INTEGRATION
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Strategic Resource Allocation (Budget Strategy)
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Total Brand Launch Budget: <strong style={{ color: 'var(--text-primary)' }}>$50.0M USD</strong>. Maps financial allocations directly to the pillars created in the Imperative Builder.
                </p>
              </div>

              {/* AI Misalignment Flag */}
              {budgetAllocations["Accelerate Diagnostic Speed"] === 15 ? (
                <div className="animate-scale-in" style={{
                  padding: '12px 16px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <div>
                      <strong style={{ fontSize: '11px', color: '#fde047' }}>
                        AI STRATEGIC ALIGNMENT WARNING: Diagnostic Screening Speed is flagged as GOLT Priority #1, but is underfunded.
                      </strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#fde047' }}>
                        Diagnostic Speed has the highest priority weighting (Accrual Barrier) but only has 15% ($7.5M) budget allocated. Consider shifting $5.0M to avoid launch execution bottlenecks.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setBudgetAllocations({
                        "Sharpen Clinical Differentiation": 35, // down from 45%
                        "Demonstrate Payer Value": 35,
                        "Accelerate Diagnostic Speed": 25, // up from 15%
                        "Optimize Launch Readiness": 5
                      });
                      alert("⚡ Brand Launch Budget optimized successfully. Aligned with GOLT priority matrices!");
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '10px', padding: '6px 12px', whiteSpace: 'nowrap', cursor: 'pointer' }}
                  >
                    ⚡ Auto-Reallocate Budget
                  </button>
                </div>
              ) : (
                <div className="animate-scale-in" style={{
                  padding: '12px 16px',
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '16px' }}>✓</span>
                  <div>
                    <strong style={{ fontSize: '11px', color: '#a7f3d0' }}>
                      ✓ AI STRATEGIC ALIGNMENT OPTIMIZED: Budget matches tactical priority weights.
                    </strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#a7f3d0' }}>
                      Diagnostic screening has been reallocated to 25% ($12.5M), resolving structural launch execution friction.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Hierarchical budget blocks (Tree-map mockup) */}
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                $50.0M Budget Distribution Map
              </h3>

              {/* Tree-map horizontal blocks representation */}
              <div style={{ display: 'flex', height: '160px', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                {/* Block 1: Clinical Differentiation */}
                <div style={{
                  flex: budgetAllocations["Sharpen Clinical Differentiation"],
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '2px solid var(--brand-indigo)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.4s ease'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      Sharpen Clinical Differentiation
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--brand-cyan)', fontWeight: 'bold' }}>GOLT Priority #2</span>
                  </div>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {budgetAllocations["Sharpen Clinical Differentiation"]}% (${(50 * budgetAllocations["Sharpen Clinical Differentiation"] / 100).toFixed(1)}M)
                  </strong>
                </div>

                {/* Block 2: Payer Value */}
                <div style={{
                  flex: budgetAllocations["Demonstrate Payer Value"],
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '2px solid var(--brand-purple)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.4s ease'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      Demonstrate Payer Value
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--brand-cyan)', fontWeight: 'bold' }}>GOLT Priority #3</span>
                  </div>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {budgetAllocations["Demonstrate Payer Value"]}% (${(50 * budgetAllocations["Demonstrate Payer Value"] / 100).toFixed(1)}M)
                  </strong>
                </div>

                {/* Block 3: Diagnostic Screening */}
                <div style={{
                  flex: budgetAllocations["Accelerate Diagnostic Speed"],
                  background: budgetAllocations["Accelerate Diagnostic Speed"] === 25 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245,158,11,0.1)',
                  border: `2px solid ${budgetAllocations["Accelerate Diagnostic Speed"] === 25 ? 'var(--brand-cyan)' : '#f59e0b'}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.4s ease'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      Accelerate Diagnostic Speed
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--brand-cyan)', fontWeight: 'bold' }}>GOLT Priority #1</span>
                  </div>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {budgetAllocations["Accelerate Diagnostic Speed"]}% (${(50 * budgetAllocations["Accelerate Diagnostic Speed"] / 100).toFixed(1)}M)
                  </strong>
                </div>

                {/* Block 4: Launch Readiness */}
                <div style={{
                  flex: budgetAllocations["Optimize Launch Readiness"],
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.4s ease'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>
                      Optimize Launch Readiness
                    </h4>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>GOLT Priority #4</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {budgetAllocations["Optimize Launch Readiness"]}% (${(50 * budgetAllocations["Optimize Launch Readiness"] / 100).toFixed(1)}M)
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Execution Readiness (MSL SIMULATION ROLEPLAY PORTAL) */}
        {activeTab === 'roleplay' && (
          <div className="roleplay-container animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '24px',
            padding: '24px 32px',
            height: 'calc(100vh - 80px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Left: AI Skeptical Oncologist Chat Arena */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '16px',
              overflow: 'hidden'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-purple)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  FIELD FORCE ROLEPLAY TERMINAL
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Execution Readiness Sandbox (MSL Coach)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  Simulate clinical details with skeptical oncology stakeholders. Pitch our approved strategic insights and receive real-time messaging grades.
                </p>
              </div>

              {/* Active Chat Window */}
              <div style={{
                flex: 1,
                background: 'var(--bg-canvas)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {roleplayChatHistory.map((msg, msgIdx) => (
                  <div key={msgIdx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    alignSelf: msg.sender === 'msl' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', alignSelf: msg.sender === 'msl' ? 'flex-end' : 'flex-start' }}>
                      {msg.sender === 'msl' ? 'MSL Rep (You)' : 'Dr. Thorne (Oncologist)'}
                    </span>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '12.5px',
                      lineHeight: '1.5',
                      background: msg.sender === 'msl' ? 'var(--brand-indigo)' : 'var(--bg-secondary)',
                      color: msg.sender === 'msl' ? 'white' : 'var(--text-primary)',
                      border: msg.sender === 'msl' ? 'none' : '1px solid var(--glass-border)'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!roleplayInput.trim()) return;
                  
                  // 1. Append MSL Pitch
                  const userPitch = roleplayInput;
                  setRoleplayChatHistory(prev => [...prev, { sender: 'msl', text: userPitch }]);
                  setRoleplayInput("");

                  // 2. Dynamic scoring calculation (Skeletal verification AI!)
                  const hasClinicalKey = userPitch.toLowerCase().includes("risk") || userPitch.toLowerCase().includes("44%") || userPitch.toLowerCase().includes("survival");
                  const hasPayerKey = userPitch.toLowerCase().includes("payer") || userPitch.toLowerCase().includes("access") || userPitch.toLowerCase().includes("evidence");
                  
                  const targetClin = hasClinicalKey ? Math.min(100, Math.floor(Math.random() * 15) + 85) : Math.floor(Math.random() * 20) + 50;
                  const targetPay = hasPayerKey ? Math.min(100, Math.floor(Math.random() * 15) + 80) : Math.floor(Math.random() * 20) + 40;
                  
                  const avg = (targetClin + targetPay) / 2;
                  let grade = 'C';
                  if (avg >= 90) grade = 'A';
                  else if (avg >= 80) grade = 'B';
                  
                  setTimeout(() => {
                    setRoleplayScores({
                      clinicalEvidence: targetClin,
                      payerArgument: targetPay,
                      overallGrade: grade
                    });

                    // 3. Append Doctor Skeptical Response
                    let doctorReply = "That's an interesting point, but how does this 44% reduction translate to overall survival? pembrolizumab alone is already the standard.";
                    if (hasClinicalKey && hasPayerKey) {
                      doctorReply = "Ah, I see you are connecting the HEOR payer evidence packages with the adjuvant OS trial margins. That does address my concerns about reimbursement timelines.";
                    } else if (hasPayerKey) {
                      doctorReply = "Reimbursement timelines are important, but as a clinician, I need to see the clinical trial margins before prescribing this combo.";
                    }
                    setRoleplayChatHistory(prev => [...prev, { sender: 'doctor', text: doctorReply }]);
                  }, 1500);
                }}
                style={{ display: 'flex', gap: '10px', flexShrink: 0 }}
              >
                <input
                  type="text"
                  placeholder="Type your strategic clinical pitch to Dr. Thorne..."
                  value={roleplayInput}
                  onChange={(e) => setRoleplayInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'white',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: '11px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Send Pitch
                </button>
              </form>
            </div>

            {/* Right: Pitch Grading Scorecard */}
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              height: '100%',
              boxSizing: 'border-box',
              gap: '20px',
              overflowY: 'auto'
            }}>
              <div>
                <span style={{ fontSize: '7.5px', color: 'var(--brand-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PITCH PERFORMANCE EVALUATION
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 800 }}>
                  Strategic Message Scorecard
                </h3>
              </div>

              {/* Big Grade readout */}
              <div style={{
                background: 'rgba(99,102,241,0.05)',
                border: '1px solid rgba(99,102,241,0.12)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>OVERALL GRADE</span>
                <strong style={{ fontSize: '36px', color: roleplayScores.overallGrade === 'A' ? '#10b981' : (roleplayScores.overallGrade === 'B' ? 'var(--brand-cyan)' : 'var(--text-muted)') }}>
                  {roleplayScores.overallGrade}
                </strong>
              </div>

              {/* Subscores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Score 1: Clinical Efficacy */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Clinical Evidence Pitching</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{roleplayScores.clinicalEvidence}/100</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${roleplayScores.clinicalEvidence}%`, height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Score 2: HEOR Payer Argument */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Payer / HEOR Value Alignment</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{roleplayScores.payerArgument}/100</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${roleplayScores.payerArgument}%`, height: '100%', background: 'var(--brand-cyan)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '14px 16px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                💡 <strong>MSL Messaging Coach Tip:</strong><br />
                To secure a Grade A pitch, make sure to explicitly cite:
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                  <li>The clinical trial's <strong>44% recurrence risk reduction</strong>.</li>
                  <li>The <strong>HEOR package</strong> designed to offset payer prior-authorization timelines.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PROGRESSIVE DISCLOSURE: SLIDE-OUT AUDIT DETAIL DRAWER (Elite UX Fix!) */}
      <div className={`drawer-overlay ${isAuditDrawerOpen ? 'open' : ''}`} onClick={() => setIsAuditDrawerOpen(false)} />
      <div className={`slide-out-drawer ${isAuditDrawerOpen ? 'open' : ''}`}>
        <div className="truth-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: 'var(--bg-tertiary)' }}>
          <div className="truth-modal-header-title">
            <h3 style={{ margin: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <History size={14} style={{ color: 'var(--brand-cyan)' }} /> Visual Handoff & Ledger Verify
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: 'var(--text-muted)' }}>
              Step {selectedAuditDrawerLog?.step_index}: {selectedAuditDrawerLog?.step_name} • Agent: {selectedAuditDrawerLog?.agent_name}
            </p>
          </div>
          <button 
            onClick={() => setIsAuditDrawerOpen(false)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
        
        {selectedAuditDrawerLog && (
          <div className="drawer-inner-padding animate-fade-in">
            
            <div className="glass-card" style={{ padding: '14px', background: 'var(--bg-tertiary)' }}>
              <span style={{ fontSize: '7.5px', color: 'var(--brand-cyan)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                Active Transaction Pipeline Payload (JSON)
              </span>
              <pre style={{ margin: '8px 0 0 0', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', fontSize: '9.5px', color: '#34d399', overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '180px', overflowY: 'auto', lineHeight: '1.4' }}>
                {JSON.stringify({
                  transaction_id: `tx_${selectedAuditDrawerLog.id || Math.random().toString(36).substring(2, 8)}`,
                  timestamp: selectedAuditDrawerLog.created_at || new Date().toISOString(),
                  step_index: selectedAuditDrawerLog.step_index,
                  agent_identity: selectedAuditDrawerLog.agent_name === 'System Ingestion' ? 'spiffe://itacs.merck.com/ns/production/sa/system-ingestion' : 'spiffe://itacs.merck.com/ns/production/sa/golt-coordinator',
                  payload: {
                    input_trigger: selectedAuditDrawerLog.user_input,
                    output_decision: selectedAuditDrawerLog.model_output
                  }
                }, null, 2)}
              </pre>
            </div>
            
            <div className="verbatim-container" style={{ margin: 0, padding: '14px' }}>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                Verbatim Input Reference
              </h5>
              <p className="italic" style={{ fontSize: '11.5px', margin: 0, lineHeight: '1.5' }}>"{selectedAuditDrawerLog.user_input}"</p>
            </div>

            <div className="truth-node-graph-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <h5 style={{ margin: '0 0 10px 0', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                Interactions API Handoff Path
              </h5>
              <div className="truth-step-nodes-list" style={{ gap: '6px' }}>
                <div className={`truth-graph-node-item ${selectedAuditDrawerLog.step_index >= 1 ? 'completed' : ''}`} style={{ fontSize: '9px', padding: '6px 10px' }}>
                  <span>1. File Ingress & Hash Anchoring</span>
                </div>
                <div className={`truth-graph-node-item ${selectedAuditDrawerLog.step_index >= 2 ? 'completed' : ''}`} style={{ fontSize: '9px', padding: '6px 10px' }}>
                  <span>2. Vision-Language Layout Parsing (PixelRAG)</span>
                </div>
                <div className={`truth-graph-node-item ${selectedAuditDrawerLog.step_index >= 3 ? 'completed' : ''}`} style={{ fontSize: '9px', padding: '6px 10px' }}>
                  <span>3. Structured Frame Mappings</span>
                </div>
                <div className={`truth-graph-node-item ${selectedAuditDrawerLog.step_index >= 4 ? 'completed' : ''}`} style={{ fontSize: '9px', padding: '6px 10px' }}>
                  <span>4. Compliance Supervisor Audit</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* CONTEXTUAL DRILL-DOWN: STRATEGIC LINEAGE DRAWER */}
      <div className={`drawer-overlay ${isBuilderDrawerOpen ? 'open' : ''}`} onClick={() => setIsBuilderDrawerOpen(false)} />
      <div className={`slide-out-drawer ${isBuilderDrawerOpen ? 'open' : ''}`}>
        <div className="truth-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: 'var(--bg-tertiary)' }}>
          <div className="truth-modal-header-title">
            <h3 style={{ margin: 0, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 800 }}>
              <Database size={14} style={{ color: 'var(--brand-cyan)' }} /> Strategic Lineage & Grounding
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '9.5px', color: 'var(--text-muted)' }}>
              Explore the clinical grounding and PixelRAG source lineage for this launch implication.
            </p>
          </div>
          <button 
            onClick={() => setIsBuilderDrawerOpen(false)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
        
        {selectedBuilderCard && (
          <div className="drawer-inner-padding animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Visual Indented Cascade Hierarchy */}
            <div className="glass-card" style={{ padding: '20px', background: 'var(--bg-tertiary)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '14px' }}>
                🔗 Strategic Lineage (Opportunity Space → CSF → What → Why)
              </span>
              
              <div className="cascade-flow-matrix" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Node 1: Opportunity Space */}
                <div className="cascade-flow-node" style={{ margin: 0 }}>
                  <div className="cascade-node-content" style={{ padding: '14px 18px', borderLeft: '3.5px solid var(--brand-indigo)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-indigo)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>OPPORTUNITY SPACE</span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.4' }}>{selectedBuilderCard.opportunity_space}</p>
                  </div>
                </div>

                {/* Node 2: CSF */}
                <div className="cascade-flow-node" style={{ margin: 0 }}>
                  <div className="cascade-node-content" style={{ padding: '14px 18px', borderLeft: '3.5px solid var(--brand-blue)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-blue)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>CRITICAL SUCCESS FACTOR (CSF)</span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>{selectedBuilderCard.csf}</p>
                  </div>
                </div>

                {/* Node 3: Insight */}
                <div className="cascade-flow-node" style={{ margin: 0 }}>
                  <div className="cascade-node-content" style={{ padding: '14px 18px', borderLeft: '3.5px solid var(--brand-cyan)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-cyan)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>WHAT (INFERRED CLINICAL INSIGHT)</span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>{selectedBuilderCard.insight}</p>
                  </div>
                </div>

                {/* Node 4: Rationale */}
                <div className="cascade-flow-node" style={{ margin: 0 }}>
                  <div className="cascade-node-content" style={{ padding: '14px 18px', borderLeft: '3.5px solid var(--brand-purple)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-purple)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>WHY (COMMERCIAL/LAUNCH RATIONALE)</span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>{selectedBuilderCard.rationale}</p>
                  </div>
                </div>

                {/* Node 5: Implication */}
                <div className="cascade-flow-node" style={{ margin: 0 }}>
                  <div className="cascade-node-content" style={{ padding: '14px 18px', background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.15)', borderLeft: '3.5px solid var(--brand-cyan)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-cyan)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>HOW (IMPLICATION FOR ACTION)</span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '14px', fontWeight: 800, color: 'var(--brand-cyan)', lineHeight: '1.4' }}>{selectedBuilderCard.implication}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Source Grounding References */}
            <div className="glass-card" style={{ padding: '18px', background: 'var(--bg-tertiary)' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--brand-cyan)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>
                📁 PixelRAG Source Document Grounding
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9.5px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Source File & Slide Citation</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '13.5px', display: 'block', marginTop: '4px' }}>{selectedBuilderCard.slide_reference || "Veeva Vault Ingest, slide 1"}</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9.5px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Immutable SME Bounding Quotes</span>
                  {selectedBuilderCard.quotes && selectedBuilderCard.quotes.map((q, qIdx) => (
                    <div key={qIdx} style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '8px' }}>
                      "{q.text}" <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--brand-cyan)', marginTop: '6px', fontWeight: 'bold', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.5px' }}>— Area: {q.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* THE COMPLIANCE & AI TRUTH ENGINE MODAL */}
      {showTruthModal && selectedAuditLog && (
        <div className="truth-modal-overlay animate-fade-in" onClick={() => setShowTruthModal(false)}>
          <div className="truth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="truth-modal-header">
              <div className="truth-modal-header-title">
                <h3>Visual Grounding & AI Truth Engine</h3>
                <p>Verifying Step {selectedAuditLog.step_index}: {selectedAuditLog.step_name} • Agent: {selectedAuditLog.agent_name}</p>
              </div>
              <button 
                onClick={() => setShowTruthModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="truth-modal-layout">
              {/* Left Side: Visual Slide Grounding */}
              <div className="truth-modal-left">
                <div className="truth-modal-slide-viewport">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="slide-headline-indicator" style={{ width: '120px', height: '6px' }} />
                    <div style={{ height: '6px', width: '30px', background: '#1e293b', borderRadius: '2px' }} />
                  </div>

                  <div className="slide-bounding-tile-cyan" style={{ margin: '36px 0', borderStyle: 'dashed' }}>
                    <span style={{ background: '#06b6d4', color: '#06080d', fontSize: '6px', fontWeight: 'bold', padding: '2px 4px', borderRadius: '2px', display: 'inline-block', marginBottom: '4px' }}>
                      PIXEL-RAG TILE BOUNDING BOX (Slide 12)
                    </span>
                    <p style={{ fontSize: '9px', margin: 0, lineHeight: '1.4' }}>
                      "The logistics of waiting for customized mRNA vaccines are challenging for community sites without dedicated care coordinators."
                    </p>
                  </div>

                  <div className="slide-footer-coords" style={{ fontSize: '8px' }}>
                    <span>FILE: MarketResearch_Q2_2026.pptx</span>
                    <span>COORDS: [x: 104, y: 342, w: 590, h: 120]</span>
                  </div>
                </div>

                <div className="verbatim-container" style={{ margin: 0 }}>
                  <p style={{ fontSize: '10.5px' }}><strong>Verbatim Grounded Citation:</strong> "{selectedAuditLog.user_input}"</p>
                  <span style={{ fontSize: '8.5px', marginTop: '6px' }}>Audit Row Hash ID: {selectedInsight?.id || "e39f3792-7489-4e7c-86c8-f80e722a2789"}</span>
                </div>
              </div>

              {/* Right Side: Google Interactions API step trail Node Graph */}
              <div className="truth-modal-right">
                <div className="truth-node-graph-box">
                  <h4>Google Interactions API Step Trail</h4>
                  
                  <div className="truth-step-nodes-list">
                    <div className="truth-graph-node-item completed">
                      <span>1. File Ingress & Cryptographic Hash Anchor</span>
                    </div>
                    <div className={`truth-graph-node-item ${selectedAuditLog.step_index >= 2 ? 'completed' : 'active'}`}>
                      <span>2. Vision-Language Layout Understanding (PixelRAG)</span>
                    </div>
                    <div className={`truth-graph-node-item ${selectedAuditLog.step_index >= 3 ? 'completed' : selectedAuditLog.step_index === 2 ? 'active' : ''}`}>
                      <span>3. Structured ITACS Field Mapping & Extraction</span>
                    </div>
                    <div className={`truth-graph-node-item ${selectedAuditLog.step_index >= 4 ? 'completed' : selectedAuditLog.step_index === 3 ? 'active' : ''}`}>
                      <span>4. 'White Line' Compliance Supervisor Keyword Audit</span>
                    </div>
                    <div className={`truth-graph-node-item ${selectedAuditLog.step_index >= 5 ? 'completed' : selectedAuditLog.step_index === 4 ? 'active' : ''}`}>
                      <span>5. Cross-Functional Synthesis & Divergence Check</span>
                    </div>
                    <div className={`truth-graph-node-item ${selectedAuditLog.step_index >= 6 ? 'completed' : selectedAuditLog.step_index === 5 ? 'active' : ''}`}>
                      <span>6. Subject Matter Expert (SME) Review & Verification</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ledger Output</span>
                  <pre style={{ margin: '8px 0 0 0', background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', fontSize: '9px', color: 'var(--brand-cyan)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {selectedAuditLog.model_output}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG/MODAL: CREATE NEW TACTICAL TASK */}
      {isTaskModalOpen && (
        <div className="truth-modal-overlay animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsTaskModalOpen(false)}>
          <div className="truth-modal-card glass-card" style={{ width: '450px', padding: '24px', background: 'var(--bg-tertiary)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <Plus size={16} style={{ color: 'var(--brand-cyan)' }} /> Add Tactical Readiness Task
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Create a new launch readiness milestone. This task will be written to the Postgres database and synced with functional leads.
            </p>
            
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Task Description / Title</label>
                <input 
                  type="text" 
                  required
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Conduct payer advisory board on MK-1084 co-pay card"
                  className="form-input"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              
              <div className="form-group">
                <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Milestone Owner</label>
                <input 
                  type="text" 
                  required
                  value={newTaskOwner} 
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  placeholder="e.g. Patient Access Manager"
                  className="form-input"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Focus Functional Lane</label>
                <select 
                  value={newTaskFunction} 
                  onChange={(e) => setNewTaskFunction(e.target.value)}
                  className="form-select"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', width: '100%', outline: 'none', cursor: 'pointer' }}
                >
                  <option>Market Access</option>
                  <option>Medical Affairs</option>
                  <option>Market Research</option>
                  <option>Competitive Intelligence</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn btn-subtle" style={{ padding: '8px 14px', fontSize: '12px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '12px' }}>Create Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
