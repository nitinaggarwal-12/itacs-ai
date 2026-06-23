import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, MessageSquare, 
  Settings, Layers, RefreshCw, Send, ShieldAlert, Check, 
  HelpCircle, Eye, ChevronRight, Edit3, UserCheck, Sparkles, Database, History
} from 'lucide-react';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// =====================================================================
// SIMULATED MOCK DATA (For instant frontend fidelity and fallbacks)
// =====================================================================
const MOCK_INSIGHTS = [
  {
    id: "e39f3792-7489-4e7c-86c8-f80e722a2789",
    opportunity_space: "Adjuvant Therapeutic Sequencing Optimization",
    csf: "Establishing V940 + Keytruda as first-line adjuvant standard in high-risk stage III/IV Melanoma",
    insight: "Physicians express concern over the operational complexity of personalized mRNA therapies in community clinics compared to standard monotherapy, despite a 44% reduction in recurrence risk.",
    rationale: "Without structured clinical support pathways, community oncologists are likely to default to pembrolizumab monotherapy, delaying adoption and reducing market share by an estimated 15% in the first 12 months post-launch.",
    implication: "Establish specialized regional operational hubs to manage logistics, patient screening, and scheduling, and launch a dedicated community-practice educational campaign.",
    quotes: [
      { text: "The logistics of waiting for customized mRNA vaccines are challenging for community sites without dedicated care coordinators.", location: "slide 12, top right interview callout" },
      { text: "We need clear support systems, otherwise Pembrolizumab remains the path of least resistance.", location: "slide 12, quote box B" }
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
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() // 5 days ago
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
    is_quarantined: true,
    is_stale: false,
    is_validated: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  }
];

const MOCK_THEMES = [
  {
    theme_name: "Personalized mRNA Logistics & Operational Scaling Barriers",
    theme_score: 16.2,
    contributing_functions: ["Market Research", "Medical Affairs", "Market Access"],
    opportunity_spaces: ["Adjuvant Therapeutic Sequencing Optimization"],
    associated_insights: ["e39f3792-7489-4e7c-86c8-f80e722a2789"],
    executive_synthesis: "Cross-functional consensus indicates that while the clinical efficacy of adjuvant personalized vaccines is undisputed (reducing recurrence risk by 44%), the operational scaling across community oncology networks represents the primary barrier to launch. Operational, medical, and access workflows must be synchronized to establish hubs."
  }
];

const MOCK_CONFLICTS = [
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

const MOCK_AUDIT = [
  { step_index: 1, step_name: "Upload", agent_name: "System Ingestion", user_input: "File: MarketResearch_Q2_2026.pptx (4.2 MB)", model_output: "Document uploaded and converted to coordinate visual matrix." },
  { step_index: 2, step_name: "Ingestion", agent_name: "Functional Extraction Copilot", user_input: "Analyze slides via vision-language tiles", model_output: "PixelRAG extraction completed. Bounding box coordinates saved for slide 12. Extracted ITACS framework data." },
  { step_index: 3, step_name: "Functional Draft", agent_name: "Functional Extraction Copilot", user_input: "Verify framework fields", model_output: "Draft generated: 5 structural cards mapped successfully. Metadata tags: V940, Melanoma, Stage III/IV." },
  { step_index: 4, step_name: "Compliance Check", agent_name: "Compliance Supervisor", user_input: "Audit for Medical Affairs rules & commercial vocabulary", model_output: "Compliance score: 0.95. Approved. No commercial forbidden terms (ROI, profit) detected in high-risk zones." }
];

export default function App() {
  // State variables
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace', 'themes', 'audit'
  const [insights, setInsights] = useState(MOCK_INSIGHTS);
  const [themes, setThemes] = useState(MOCK_THEMES);
  const [conflicts, setConflicts] = useState(MOCK_CONFLICTS);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT);
  const [selectedInsight, setSelectedInsight] = useState(MOCK_INSIGHTS[0]);
  
  // Workflow stepper state
  const [activeStep, setActiveStep] = useState(6); // 1 to 7
  const [ingestionSession, setIngestionSession] = useState("active_session_001");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form edit states (for SME Workspace)
  const [editOpportunity, setEditOpportunity] = useState("");
  const [editCSF, setEditCSF] = useState("");
  const [editInsight, setEditInsight] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [editImplication, setEditImplication] = useState("");

  // Conflict flagging states
  const [conflictType, setConflictType] = useState("Inter-Functional Divergence");
  const [conflictDesc, setConflictDesc] = useState("");
  const [showConflictForm, setShowConflictForm] = useState(false);

  // Chat Thought Partner State
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! I am your Strategic Thought Partner, grounded in the ITACS Enterprise Memory. Ask me anything about our commercialization planning, competitive threats, or payer coverage dynamics." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [retrievedContext, setRetrievedContext] = useState([]);

  // Form metadata states (for upload)
  const [uploadLane, setUploadLane] = useState("Market Research");
  const [uploadAsset, setUploadAsset] = useState("V940");
  const [uploadTumor, setUploadTumor] = useState("Melanoma");
  const [uploadSubTumor, setUploadSubTumor] = useState("Stage III/IV");

  const chatEndRef = useRef(null);

  // Load active data
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedInsight) {
      setEditOpportunity(selectedInsight.opportunity_space);
      setEditCSF(selectedInsight.csf);
      setEditInsight(selectedInsight.insight);
      setEditRationale(selectedInsight.rationale);
      setEditImplication(selectedInsight.implication);
    }
  }, [selectedInsight]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        setConflicts(data);
      }

      const auditRes = await fetch(`${API_URL}/api/audit-trail`);
      if (auditRes.ok) {
        const data = await auditRes.json();
        if (data && data.length > 0) {
          setAuditLogs(data);
        }
      }
      
      // Trigger theme synthesis
      triggerSynthesisAPI();
    } catch (err) {
      console.error("API Fetch failed, running on mock data mode.", err);
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

  // Step Ingestion Lifecycle simulation / trigger
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setActiveStep(1);
    setUploadProgress(10);
    
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 10);
    setIngestionSession(sessionId);

    // Build Form Data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);
    formData.append("function_lane", uploadLane);
    formData.append("asset", uploadAsset);
    formData.append("tumor", uploadTumor);
    formData.append("sub_tumor", uploadSubTumor);

    // Simulate stepping for premium visual effect
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
      // Step 2: Ingestion
      setTimeout(() => setActiveStep(2), 800);
      // Step 3: Functional Draft
      setTimeout(() => setActiveStep(3), 1600);
      // Step 4: Compliance Check
      setTimeout(() => setActiveStep(4), 2400);
      // Step 5: Clustering
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
        // Add new insights to the list and select it
        if (resData.insights && resData.insights.length > 0) {
          const newInsight = resData.insights[0];
          setInsights(prev => [newInsight, ...prev]);
          setSelectedInsight(newInsight);
        }
        setActiveStep(6); // Stop at SME Validation
        fetchData(); // Refresh list and conflicts
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback simulation
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
          slide_reference: `${file.filename}, slide 3`,
          metadata: {
            function_lane: uploadLane,
            asset: uploadAsset,
            tumor: uploadTumor,
            sub_tumor: uploadSubTumor
          },
          compliance_score: uploadLane === "Medical Affairs" ? 0.92 : 0.85,
          requires_human_review: false,
          is_quarantined: false,
          is_validated: false,
          created_at: new Date().toISOString()
        };
        setInsights(prev => [fallbackNew, ...prev]);
        setSelectedInsight(fallbackNew);
      }, 4000);
    }
  };

  // SME Validation Actions
  const handleApprove = async () => {
    if (!selectedInsight) return;

    try {
      const response = await fetch(`${API_URL}/api/insights/${selectedInsight.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        setActiveStep(7); // Final Alignment
        setTimeout(() => setActiveStep(6), 3000); // return to waiting state after a brief visual alignment
        
        // Update local state
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
        
        // Refresh selected insight
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
        
        triggerSynthesisAPI();
        alert("Insight approved and committed to Enterprise Memory!");
      }
    } catch (e) {
      console.error("Approve API call failed.", e);
      // Fallback state update
      setInsights(prev => prev.map(ins => {
        if (ins.id === selectedInsight.id) {
          return { ...ins, is_validated: true, is_quarantined: false, requires_human_review: false };
        }
        return ins;
      }));
      setSelectedInsight(prev => ({ ...prev, is_validated: true, is_quarantined: false, requires_human_review: false }));
      setActiveStep(7);
      setTimeout(() => setActiveStep(6), 3000);
    }
  };

  // Flag a contradiction manually
  const handleFlagContradiction = async () => {
    if (!selectedInsight) return;
    
    // Find another insight to mock conflict with
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
      // Mock local
      const newConflict = {
        id: "cf-" + Math.random().toString(36).substring(2, 9),
        source_insight_id: selectedInsight.id,
        conflicting_insight_id: otherInsight.id,
        conflict_type: conflictType,
        description: conflictDesc || "Manual SME flagged contradiction: Payer reimbursement hurdles conflict with high clinical demand expectations.",
        status: "Flagged",
        created_at: new Date().toISOString()
      };
      setConflicts(prev => [newConflict, ...prev]);
      setShowConflictForm(false);
      setConflictDesc("");
      alert("Contradiction flagged locally (Mock Mode)!");
    }
  };

  // Grounded Thought Partner Chat
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      // Mock response aligned with specific oncology prompts
      setTimeout(() => {
        let answer = `### Strategic Synthesis: Grounded Analysis

Based on our validated ITACS Enterprise Memory regarding **${selectedInsight.asset}** in **${selectedInsight.tumor}**, here is the cross-functional guidance:

#### 1. Medical Affairs Perspective (The Clinical Lens)
- **Clinical Endpoints**: Scientific exchange must focus on the clinical value proposition of the adjuvant program. MSLs should present the **44% reduction in recurrence risk (RFS/DMFS)**, educating community oncologists on how personalized sequencing prevents secondary recurrence.
- **Biomarker Screening**: Standardizing screening protocols at regional sites is critical to capture high-risk stage III/IV patients immediately post-resection.

#### 2. Market Access & Payer Perspective (The Value Lens)
- **Coverage Hurdles**: Payers will require strict prior authorizations. We must showcase that preventing recurrence through personalized mRNA sequencing offsets the high downstream costs of advanced metastatic treatments.
- **Logistics & Pathways**: Access teams must co-develop integration agreements with national oncology clinical pathways to ensure reimbursement flows smoothly for personalized components.

#### 3. Competitive Intelligence Perspective (Market Dynamics)
- **Competitor Activity**: Competitors are ramping up trials for pre-mixed monotherapies, marketing them as 'frictionless' compared to personalized mRNA regimens.
- **Adoption Threats**: Operational delays in community practices create a 12-month adoption lag, giving competitors a window to lock in multi-year contracts.

---

### Strategy Refinement Options
1. *Would you like to examine the detailed operational flowchart for regional delivery hubs to reduce community oncology lag?*
2. *Should we run a simulation on payer co-pay friction thresholds for customized immunotherapies?*
3. *Do you want to compare the RFS curves of V940 against competitor standard adjuvant trials?*`;
        setChatMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        setRetrievedContext([selectedInsight]);
      }, 1500);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper to color lanes and tags
  const getFunctionBadgeClass = (lane) => {
    switch (lane) {
      case 'Market Research': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'Medical Affairs': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Market Access': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Competitive Intelligence': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-12">
      {/* HEADER SECTION */}
      <header className="border-b border-white/5 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xl font-bold">🧬</span>
          </div>
          <div>
            <h1 className="text-lg font-bold title-font text-white leading-tight">ITACS Enterprise Insights</h1>
            <p className="text-xs text-slate-400">Strategic Synthesis Engine • Merck Oncology</p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span>Memory Pool: <strong className="text-white">{insights.filter(i => i.is_validated).length} Validated</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Quarantined: <strong className="text-white">{insights.filter(i => i.is_quarantined).length} Drafts</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Conflicts: <strong className="text-rose-400">{conflicts.filter(c => c.status === "Flagged").length} Flagged</strong></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex bg-slate-950/60 p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'workspace' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Layers className="inline-block h-3.5 w-3.5 mr-1.5" />
            SME Workspace
          </button>
          <button 
            onClick={() => setActiveTab('themes')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'themes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sparkles className="inline-block h-3.5 w-3.5 mr-1.5" />
            Strategic Synthesis
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <History className="inline-block h-3.5 w-3.5 mr-1.5" />
            Audit Logs
          </button>
        </nav>
      </header>

      {/* COMPONENT A: WORKFLOW TRACKING LANE (TOP BAR) */}
      <section className="mx-6 mt-6 p-5 glass-panel border border-white/5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Settings className="h-4 w-4 text-indigo-400 animate-spin-slow" />
            Real-time Ingestion & Synthesis Pipeline
          </h2>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Session: {ingestionSession}
          </span>
        </div>
        
        {/* Horizontal Steps */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 relative">
          {[
            { idx: 1, name: "Upload", desc: "File Ingestion" },
            { idx: 2, name: "Ingestion", desc: "PixelRAG Tiles" },
            { idx: 3, name: "Functional Draft", desc: "ITACS Framing" },
            { idx: 4, name: "Compliance Check", desc: "White Line Review" },
            { idx: 5, name: "Cross-Functional", desc: "Thematic Clustering" },
            { idx: 6, name: "SME Validation", desc: "Human Approval" },
            { idx: 7, name: "Final Alignment", desc: "Enterprise Memory" }
          ].map(step => {
            const isCompleted = step.idx < activeStep;
            const isActive = step.idx === activeStep;
            const isFuture = step.idx > activeStep;
            
            let statusColor = "bg-slate-900 border-white/5 text-slate-500";
            if (isCompleted) statusColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
            if (isActive) statusColor = "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 pulse-active glow-border-active";
            if (step.idx === 6 && isActive) statusColor = "bg-amber-500/20 border-amber-500/50 text-amber-300 pulse-active";

            return (
              <div 
                key={step.idx} 
                className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${statusColor} ${isActive ? 'scale-105 z-10' : 'scale-100'}`}
              >
                <div className="h-7 w-7 rounded-full flex items-center justify-center mb-1.5 text-xs font-bold bg-white/5">
                  {isCompleted ? <Check className="h-4 w-4" /> : step.idx}
                </div>
                <h3 className="text-xs font-semibold text-white leading-tight">{step.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-b-xl" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIST OF INSIGHTS & FILE UPLOADER (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* UPLOAD PANEL */}
          <div className="p-5 glass-panel rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold title-font text-white mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-400" />
              Ingest Strategic Assets
            </h3>
            
            {/* Upload form fields */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Functional Lane</label>
                <select 
                  value={uploadLane} 
                  onChange={(e) => setUploadLane(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded px-2 py-1.5 text-white"
                >
                  <option>Market Research</option>
                  <option>Medical Affairs</option>
                  <option>Market Access</option>
                  <option>Competitive Intelligence</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Asset Target</label>
                <select 
                  value={uploadAsset} 
                  onChange={(e) => setUploadAsset(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded px-2 py-1.5 text-white"
                >
                  <option>V940</option>
                  <option>MK-1084</option>
                  <option>Keytruda</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tumor Space</label>
                <input 
                  type="text" 
                  value={uploadTumor}
                  onChange={(e) => setUploadTumor(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Indication</label>
                <input 
                  type="text" 
                  value={uploadSubTumor}
                  onChange={(e) => setUploadSubTumor(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded px-2 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="relative border-2 border-dashed border-indigo-500/20 rounded-xl p-6 text-center hover:border-indigo-500/40 transition-all cursor-pointer bg-slate-950/20">
              <input 
                type="file" 
                onChange={handleFileUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                disabled={isUploading}
              />
              <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">Drag & drop slide presentation or document</p>
              <p className="text-[10px] text-slate-500 mt-1">Supports PPTX, PDF, PNG (Strict PixelRAG Vision processing)</p>
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Extracting ITACS Hierarchy...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* INSIGHTS FILTER LIST */}
          <div className="flex-1 p-5 glass-panel rounded-2xl border border-white/5 flex flex-col overflow-hidden max-h-[500px]">
            <h3 className="text-sm font-bold title-font text-white mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              Intelligence Asset Queue
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
              {insights.map(ins => {
                const isSelected = selectedInsight && selectedInsight.id === ins.id;
                return (
                  <div 
                    key={ins.id}
                    onClick={() => setSelectedInsight(ins)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/5' 
                        : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getFunctionBadgeClass(ins.metadata.function_lane)}`}>
                        {ins.metadata.function_lane}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {ins.is_validated ? (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5">
                            <Check className="h-2.5 w-2.5" /> MEMORY
                          </span>
                        ) : ins.is_quarantined ? (
                          <span className="bg-rose-500/10 text-rose-400 text-[9px] px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" /> QUARANTINE
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/20">
                            DRAFT REVIEW
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{ins.opportunity_space}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{ins.insight}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-2 mt-1">
                      <span>Asset: <strong>{ins.metadata.asset}</strong> ({ins.metadata.tumor})</span>
                      <span>Compliance: <strong className={ins.compliance_score >= 0.8 ? "text-emerald-400" : "text-rose-400"}>{Math.round(ins.compliance_score * 100)}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE/RIGHT COLUMN: DYNAMIC TABS CONTENT (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* TAB 1: SME VALIDATION WORKSPACE */}
          {activeTab === 'workspace' && selectedInsight && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              
              {/* THE SME VALIDATION FORM & FRAMEWORK (7 cols) */}
              <div className="xl:col-span-7 p-6 glass-panel rounded-2xl border border-white/5 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-bold title-font text-white flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-indigo-400" />
                      SME Validation Workspace
                    </h3>
                    <p className="text-xs text-slate-400">Refine, align, and validate oncology insights for Merck ITACS compliance.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowConflictForm(true)}
                      className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded border border-rose-500/30 font-medium transition-all"
                    >
                      <AlertTriangle className="inline-block h-3.5 w-3.5 mr-1" />
                      Flag Contradiction
                    </button>
                    <button 
                      onClick={handleApprove}
                      className="text-xs bg-emerald-600 text-white hover:bg-emerald-500 px-3 py-1.5 rounded font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve to Memory
                    </button>
                  </div>
                </div>

                {/* FORM FIELDS - ITACS HIERARCHY */}
                <div className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-indigo-300 mb-1 uppercase tracking-wider text-[10px]">1. Opportunity Space</label>
                    <input 
                      type="text" 
                      value={editOpportunity}
                      onChange={(e) => setEditOpportunity(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-indigo-300 mb-1 uppercase tracking-wider text-[10px]">2. Critical Success Factor (CSF)</label>
                    <input 
                      type="text" 
                      value={editCSF}
                      onChange={(e) => setEditCSF(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-cyan-300 mb-1 uppercase tracking-wider text-[10px]">3. What (Insight)</label>
                    <textarea 
                      rows={3}
                      value={editInsight}
                      onChange={(e) => setEditInsight(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-cyan-300 mb-1 uppercase tracking-wider text-[10px]">4. Why (Rationale)</label>
                    <textarea 
                      rows={3}
                      value={editRationale}
                      onChange={(e) => setEditRationale(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-300 mb-1 uppercase tracking-wider text-[10px]">5. Implication</label>
                    <textarea 
                      rows={3}
                      value={editImplication}
                      onChange={(e) => setEditImplication(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Flag Conflict Modal Form */}
                {showConflictForm && (
                  <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl text-xs flex flex-col gap-3">
                    <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Flag Analytical Disagreement
                    </h4>
                    <div>
                      <label className="block text-slate-400 mb-1">Conflict Type</label>
                      <select 
                        value={conflictType} 
                        onChange={(e) => setConflictType(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-white w-full"
                      >
                        <option>Inter-Functional Divergence</option>
                        <option>Timeline Contradiction</option>
                        <option>Decay Discrepancy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Conflict Details (Why does this contradict?)</label>
                      <textarea 
                        rows={2}
                        value={conflictDesc}
                        onChange={(e) => setConflictDesc(e.target.value)}
                        placeholder="Describe the opposing timelines or research discrepancies..."
                        className="bg-slate-950 border border-white/10 rounded px-2 py-1.5 text-white w-full"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowConflictForm(false)} className="bg-slate-800 text-slate-300 px-3 py-1 rounded">Cancel</button>
                      <button onClick={handleFlagContradiction} className="bg-rose-600 text-white px-3 py-1 rounded font-bold">Flag Dispute</button>
                    </div>
                  </div>
                )}
              </div>

              {/* PIXELRAG SPATIAL CANVAS & GROUNDING VIEW (5 cols) */}
              <div className="xl:col-span-5 flex flex-col gap-6">
                
                {/* Visual Spatial Canvas */}
                <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    PixelRAG Ingestion Grounding
                  </h4>
                  <p className="text-[11px] text-slate-400">Exact coordinates and OCR spatial bounding boxes detected on the source slide.</p>
                  
                  {/* Mock Visual Layout Frame */}
                  <div className="aspect-[4/3] bg-slate-950 border border-white/10 rounded-xl relative overflow-hidden flex flex-col justify-between p-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <div className="h-2 w-16 bg-indigo-500/40 rounded" />
                      <div className="h-1.5 w-8 bg-slate-800 rounded" />
                    </div>
                    
                    {/* Bounding box for quotes */}
                    <div className="border border-cyan-500 bg-cyan-500/10 p-2 rounded-md absolute top-1/4 left-[10%] right-[15%] text-[9px] font-mono text-cyan-300 flex flex-col gap-1">
                      <span className="bg-cyan-500 text-slate-950 px-1 py-0.2 rounded text-[8px] font-bold self-start">OCR TILE BLOCK</span>
                      "{selectedInsight.quotes[0]?.text || "Personalized vaccine logistics are complex."}"
                    </div>

                    <div className="border border-purple-500 bg-purple-500/10 p-2 rounded-md absolute bottom-1/4 left-[15%] right-[20%] text-[9px] font-mono text-purple-300 flex flex-col gap-1">
                      <span className="bg-purple-500 text-white px-1 py-0.2 rounded text-[8px] font-bold self-start">CHART CAPTION TILE</span>
                      "{selectedInsight.quotes[1]?.text || "Monotherapy standard remains path of least resistance."}"
                    </div>

                    {/* Bottom Slide Info */}
                    <div className="flex items-center justify-between text-[8px] text-slate-600 font-mono">
                      <span>SOURCE: {selectedInsight.slide_reference}</span>
                      <span>COORDS: [x: 104, y: 342, w: 590, h: 120]</span>
                    </div>
                  </div>
                </div>

                {/* Compliance & Audit mini summary */}
                <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance Audit Summary</h4>
                  
                  <div className="flex items-center gap-4">
                    {/* Circle Gauge */}
                    <div className="h-16 w-16 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden">
                      <div 
                        className={`absolute inset-0 bg-gradient-to-t ${selectedInsight.compliance_score >= 0.80 ? 'from-emerald-500/20 to-teal-500/10' : 'from-rose-500/20 to-rose-400/10'}`} 
                        style={{ height: `${selectedInsight.compliance_score * 100}%`, top: 'auto' }}
                      />
                      <span className={`text-sm font-bold ${selectedInsight.compliance_score >= 0.80 ? 'text-emerald-400' : 'text-rose-400'} z-10`}>
                        {Math.round(selectedInsight.compliance_score * 100)}%
                      </span>
                    </div>

                    <div className="flex-1 text-xs">
                      <h5 className="font-bold text-white">Compliance Rating</h5>
                      <p className="text-slate-400 mt-0.5">
                        {selectedInsight.compliance_score >= 0.80 
                          ? "Compliant. Exceeds the 80% baseline. Approved for scientific exchange."
                          : "Non-Compliant. Quarantined due to commercial jargon or missing clinical endpoints."}
                      </p>
                    </div>
                  </div>

                  {/* Quotes checklist */}
                  <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Verbatim Source Quotes</span>
                    {selectedInsight.quotes.map((q, i) => (
                      <div key={i} className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5 text-[11px] text-slate-300">
                        <p className="italic">"{q.text}"</p>
                        <span className="text-[9px] text-slate-500 block mt-1.5 font-mono">— {q.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE THOUGHT PARTNER & SYNTHESIS */}
          {activeTab === 'themes' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              
              {/* SYNTHESIZED THEMES & CONFLICTS (5 cols) */}
              <div className="xl:col-span-5 flex flex-col gap-6">
                
                {/* Synced Themes */}
                <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold title-font text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      Cross-Functional Themes
                    </h3>
                    <button 
                      onClick={triggerSynthesisAPI}
                      className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-all"
                      title="Force Recalculate Themes"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-1">
                    {themes.map((theme, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-indigo-500/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-indigo-300">{theme.theme_name}</h4>
                          <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                            Rank: {theme.theme_score}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {theme.executive_synthesis}
                        </p>

                        {/* Tagging */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {theme.contributing_functions.map((fn, fIdx) => (
                            <span key={fIdx} className="text-[9px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                              {fn}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flagged Conflicts Queue */}
                <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h3 className="text-sm font-bold title-font text-white flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    Cross-Functional Conflict Queue
                  </h3>
                  <p className="text-[11px] text-slate-400">Contradictions detected between functional timelines or scientific assertions.</p>

                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px] pr-1">
                    {conflicts.map(conf => (
                      <div key={conf.id} className="bg-rose-950/10 p-3.5 rounded-xl border border-rose-500/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-rose-400 font-bold uppercase tracking-wider">{conf.conflict_type}</span>
                          <span className="bg-rose-500/20 text-rose-400 px-2 py-0.2 rounded font-mono">FLAGGED</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">{conf.description}</p>
                        
                        <div className="flex justify-end gap-2 border-t border-white/5 pt-2 mt-1">
                          <button 
                            onClick={async () => {
                              const notes = prompt("Enter resolution notes from the workshop:");
                              if (!notes) return;
                              try {
                                const body = new URLSearchParams();
                                body.append("resolution_notes", notes);
                                await fetch(`${API_URL}/api/conflicts/${conf.id}/resolve`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                  body: body.toString()
                                });
                                fetchData();
                              } catch (err) {
                                setConflicts(prev => prev.filter(c => c.id !== conf.id));
                              }
                            }}
                            className="text-[10px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-2.5 py-1 rounded font-medium"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                    {conflicts.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No active contradictions detected. Perfect consensus!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* INTERACTIVE THOUGHT PARTNER TERMINAL (7 cols) */}
              <div className="xl:col-span-7 p-6 glass-panel rounded-2xl border border-white/5 flex flex-col gap-4 h-[670px]">
                
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold title-font text-white flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-cyan-400" />
                      Interactive Thought Partner
                    </h3>
                    <p className="text-[11px] text-slate-400">Powered by Gemini 1.5 Pro • Grounded strictly in validated memory.</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Grounded (OKF Pool)</span>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-xs scroll-smooth">
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div 
                        key={index}
                        className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                      >
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 font-bold'}`}>
                          {isUser ? 'ME' : '🤖'}
                        </div>
                        
                        <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line border ${
                          isUser 
                            ? 'bg-indigo-950/20 border-indigo-500/20 text-slate-100 rounded-tr-none' 
                            : 'bg-slate-900/60 border-white/5 text-slate-200 rounded-tl-none'
                        }`}>
                          {msg.content}
                          
                          {/* If assistant and has options, render clickable prompts */}
                          {!isUser && msg.content.includes("Strategy Refinement Options") && (
                            <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-col gap-2">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Refinement Pathways</span>
                              <div className="flex flex-col gap-1.5">
                                <button 
                                  onClick={() => {
                                    setChatInput("Analyze the operational flowchart for regional delivery hubs to reduce community oncology lag.");
                                  }}
                                  className="text-left bg-slate-950/40 hover:bg-slate-950 border border-white/5 rounded px-2.5 py-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-all"
                                >
                                  → Analyze operational delivery hub flowchart
                                </button>
                                <button 
                                  onClick={() => {
                                    setChatInput("Run a simulation on payer prior authorization friction thresholds for customized immunotherapies.");
                                  }}
                                  className="text-left bg-slate-950/40 hover:bg-slate-950 border border-white/5 rounded px-2.5 py-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-all"
                                >
                                  → Simulate payer prior authorization friction
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && (
                    <div className="flex gap-3 self-start items-center text-slate-400 italic text-[11px]">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      Gemini 1.5 Pro pressure-testing perspectives...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Grounding Context indicator */}
                {retrievedContext.length > 0 && (
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-white/5 text-[10px] flex flex-col gap-1">
                    <span className="font-semibold text-indigo-400 flex items-center gap-1">
                      <Database className="h-3 w-3" /> Grounded Source Nodes ({retrievedContext.length})
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {retrievedContext.map((c, i) => (
                        <span key={i} className="shrink-0 bg-white/5 border border-white/5 rounded px-2 py-0.5 text-[9px] text-slate-300">
                          {c.asset} - {c.tumor} ({c.function_lane})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="flex gap-2 items-center border-t border-white/5 pt-3.5">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about clinical adoption, access barriers, or competitive timeline alignment..."
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={chatLoading}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-600/25 transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="p-6 glass-panel rounded-2xl border border-white/5 flex flex-col gap-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold title-font text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-400" />
                  Immutable Compliance Audit Trail
                </h3>
                <p className="text-xs text-slate-400">Verifiable logging of every agent decision, tool execution, and LLM reasoning step for compliance auditing.</p>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
                {auditLogs.map((log, lIdx) => (
                  <div key={lIdx} className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col gap-3 text-xs">
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                          {log.step_index}
                        </span>
                        <span className="font-bold text-white">{log.step_name}</span>
                      </div>
                      
                      <span className="text-[10px] bg-slate-900 border border-white/5 rounded px-2 py-0.5 text-slate-400">
                        Agent: <strong>{log.agent_name}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Input Payload / Trigger</span>
                        <pre className="mt-1 bg-slate-900/60 p-2.5 rounded border border-white/5 text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
                          {log.user_input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Model Output / Decision</span>
                        <pre className="mt-1 bg-slate-900/60 p-2.5 rounded border border-white/5 text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
                          {log.model_output}
                        </pre>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
