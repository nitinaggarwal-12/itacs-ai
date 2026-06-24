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
    is_quarantined: true,
    is_stale: false,
    is_validated: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
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
  // Navigation
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace', 'themes', 'audit'
  
  // Data lists
  const [insights, setInsights] = useState(MOCK_INSIGHTS);
  const [themes, setThemes] = useState(MOCK_THEMES);
  const [conflicts, setConflicts] = useState(MOCK_CONFLICTS);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT);
  const [selectedInsight, setSelectedInsight] = useState(MOCK_INSIGHTS[0]);
  
  // Stepper & Session
  const [activeStep, setActiveStep] = useState(6); // 1 to 7
  const [ingestionSession, setIngestionSession] = useState("active_session_001");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Ingestion Metadata
  const [uploadLane, setUploadLane] = useState("Market Research");
  const [uploadAsset, setUploadAsset] = useState("V940");
  const [uploadTumor, setUploadTumor] = useState("Melanoma");
  const [uploadSubTumor, setUploadSubTumor] = useState("Stage III/IV");

  // Form edit states (for selectedInsight)
  const [editOpportunity, setEditOpportunity] = useState("");
  const [editCSF, setEditCSF] = useState("");
  const [editInsight, setEditInsight] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [editImplication, setEditImplication] = useState("");

  // Conflict state
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

  const chatEndRef = useRef(null);

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
        const data = await insRes.ok ? await insRes.json() : [];
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
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback
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
        setActiveStep(7);
        setTimeout(() => setActiveStep(6), 3000);
        
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
        
        triggerSynthesisAPI();
        alert("Insight approved and committed to Enterprise Memory!");
      }
    } catch (e) {
      console.error("Approve API call failed.", e);
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
2. *Should we run a simulation on payer prior authorization friction thresholds for customized immunotherapies?*`;
        setChatMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        setRetrievedContext([selectedInsight]);
      }, 1500);
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

  return (
    <div className="app-layout">
      {/* HEADER */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-badge">🧬</div>
          <div className="logo-text">
            <h1>ITACS Enterprise Insights</h1>
            <p>Strategic Synthesis Engine • Merck Oncology</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-chip">
            <Database className="stat-icon" size={14} />
            <span>Memory Pool: <strong>{insights.filter(i => i.is_validated).length} Validated</strong></span>
          </div>
          <div className="stat-chip">
            <ShieldAlert className="stat-icon-warn" size={14} />
            <span>Quarantined: <strong>{insights.filter(i => i.is_quarantined).length} Drafts</strong></span>
          </div>
          <div className="stat-chip">
            <AlertTriangle className="stat-icon-alert" size={14} />
            <span>Conflicts: <strong>{conflicts.filter(c => c.status === "Flagged").length} Flagged</strong></span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
          >
            <Layers size={14} /> SME Workspace
          </button>
          <button 
            onClick={() => setActiveTab('themes')}
            className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
          >
            <Sparkles size={14} /> Strategic Synthesis
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <History size={14} /> Audit Logs
          </button>
        </nav>
      </header>

      {/* COMPONENT A: PIPELINE STEPPER */}
      <section className="stepper-section">
        <div className="section-header">
          <h2 className="section-title">
            <Settings className="animate-spin-slow" size={14} /> Real-time Ingestion & Synthesis Pipeline
          </h2>
          <span className="session-badge">Session: {ingestionSession}</span>
        </div>
        
        <div className="stepper-container">
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
            const isReview = step.idx === 6 && isActive;
            
            let stateClass = "";
            if (isCompleted) stateClass = "completed";
            if (isActive) stateClass = "active";
            if (isReview) stateClass = "active active-review";

            return (
              <div key={step.idx} className={`step-node ${stateClass}`}>
                <div className="step-circle">
                  {isCompleted ? <Check size={12} /> : step.idx}
                </div>
                <h3>{step.name}</h3>
                <p>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DASHBOARD BODY */}
      <main className="dashboard-grid">
        
        {/* LEFT COLUMN: UPLOADER & QUEUE */}
        <div className="sidebar-panel">
          
          {/* Uploader Card */}
          <div className="glass-card">
            <h3 className="glass-card-title">
              <Upload size={16} /> Ingest Strategic Assets
            </h3>
            
            <div className="meta-inputs">
              <div className="form-group">
                <label>Function</label>
                <select 
                  value={uploadLane} 
                  onChange={(e) => setUploadLane(e.target.value)}
                  className="form-select"
                >
                  <option>Market Research</option>
                  <option>Medical Affairs</option>
                  <option>Market Access</option>
                  <option>Competitive Intelligence</option>
                </select>
              </div>
              <div className="form-group">
                <label>Asset</label>
                <select 
                  value={uploadAsset} 
                  onChange={(e) => setUploadAsset(e.target.value)}
                  className="form-select"
                >
                  <option>V940</option>
                  <option>MK-1084</option>
                  <option>Keytruda</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tumor</label>
                <input 
                  type="text" 
                  value={uploadTumor}
                  onChange={(e) => setUploadTumor(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Indication</label>
                <input 
                  type="text" 
                  value={uploadSubTumor}
                  onChange={(e) => setUploadSubTumor(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="upload-dropzone">
              <input 
                type="file" 
                onChange={handleFileUpload} 
                disabled={isUploading}
              />
              <Upload size={24} style={{ color: '#818cf8', margin: '0 auto' }} />
              <p>Select presentation or document</p>
              <span>Supports PPTX, PDF, PNG (PixelRAG Ingestion)</span>
            </div>

            {isUploading && (
              <div className="progress-container">
                <div className="progress-header">
                  <span>Extracting ITACS Hierarchy...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Queue List Card */}
          <div className="glass-card queue-container">
            <h3 className="glass-card-title">
              <FileText size={16} /> Intelligence Queue
            </h3>
            
            <div className="queue-list">
              {insights.map(ins => {
                const isSelected = selectedInsight && selectedInsight.id === ins.id;
                const laneClass = getFunctionBadgeClass(ins.metadata.function_lane);
                
                let statusClass = "draft";
                let statusText = "DRAFT REVIEW";
                if (ins.is_validated) { statusClass = "validated"; statusText = "MEMORY"; }
                else if (ins.is_quarantined) { statusClass = "quarantined"; statusText = "QUARANTINE"; }

                return (
                  <div 
                    key={ins.id}
                    onClick={() => setSelectedInsight(ins)}
                    className={`queue-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="queue-item-header">
                      <span className={`lane-tag ${laneClass}`}>{ins.metadata.function_lane}</span>
                      <span className={`status-badge ${statusClass}`}>{statusText}</span>
                    </div>
                    
                    <div className="queue-item-body">
                      <h4>{ins.opportunity_space}</h4>
                      <p>{ins.insight}</p>
                    </div>

                    <div className="queue-item-footer">
                      <span>Asset: <strong>{ins.metadata.asset}</strong> ({ins.metadata.tumor})</span>
                      <span>Compliance: <strong style={{ color: ins.compliance_score >= 0.8 ? '#34d399' : '#f43f5e' }}>{Math.round(ins.compliance_score * 100)}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TAB-CONTENT PANELS */}
        <div className="content-panel">

          {/* TAB 1: SME WORKSPACE */}
          {activeTab === 'workspace' && selectedInsight && (
            <div className="workspace-split animate-fade-in">
              
              {/* Form card */}
              <div className="glass-card workspace-form-card">
                <div className="workspace-header">
                  <div className="workspace-header-title">
                    <h3>SME Validation Workspace</h3>
                    <p>Refine, align, and validate oncology insights for Merck ITACS compliance.</p>
                  </div>

                  <div className="action-group">
                    <button onClick={() => setShowConflictForm(true)} className="btn btn-warn">
                      <AlertTriangle size={12} /> Flag Contradiction
                    </button>
                    <button onClick={handleApprove} className="btn btn-primary">
                      <Check size={12} /> Approve to Memory
                    </button>
                  </div>
                </div>

                <div className="itacs-form-fields">
                  <div className="form-group">
                    <label className="label-os">1. Opportunity Space</label>
                    <input 
                      type="text" 
                      value={editOpportunity}
                      onChange={(e) => setEditOpportunity(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-csf">2. Critical Success Factor (CSF)</label>
                    <input 
                      type="text" 
                      value={editCSF}
                      onChange={(e) => setEditCSF(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-insight">3. What (Insight)</label>
                    <textarea 
                      rows={3}
                      value={editInsight}
                      onChange={(e) => setEditInsight(e.target.value)}
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-rationale">4. Why (Rationale)</label>
                    <textarea 
                      rows={3}
                      value={editRationale}
                      onChange={(e) => setEditRationale(e.target.value)}
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-implication">5. Implication</label>
                    <textarea 
                      rows={3}
                      value={editImplication}
                      onChange={(e) => setEditImplication(e.target.value)}
                      className="form-textarea"
                    />
                  </div>
                </div>

                {showConflictForm && (
                  <div className="conflict-flag-box">
                    <h4 className="conflict-flag-title">
                      <AlertTriangle size={14} /> Flag Analytical Disagreement
                    </h4>
                    <div className="form-group">
                      <label>Conflict Type</label>
                      <select 
                        value={conflictType} 
                        onChange={(e) => setConflictType(e.target.value)}
                        className="form-select"
                      >
                        <option>Inter-Functional Divergence</option>
                        <option>Timeline Contradiction</option>
                        <option>Decay Discrepancy</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Conflict Details (Explain why this conflicts)</label>
                      <textarea 
                        rows={2}
                        value={conflictDesc}
                        onChange={(e) => setConflictDesc(e.target.value)}
                        placeholder="Describe the opposing timelines or research discrepancies..."
                        className="form-textarea"
                      />
                    </div>
                    <div className="action-group" style={{ justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button onClick={() => setShowConflictForm(false)} className="btn btn-subtle">Cancel</button>
                      <button onClick={handleFlagContradiction} className="btn btn-primary" style={{ background: '#f43f5e', boxShadow: 'none' }}>Flag Dispute</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Spatial Canvas side */}
              <div className="canvas-panel">
                
                {/* Canvas card */}
                <div className="glass-card">
                  <h3 className="glass-card-title">
                    <Eye size={16} /> PixelRAG Ingestion Grounding
                  </h3>
                  <p style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '12px' }}>
                    OCR spatial bounding boxes and extracted text tiles coordinates mapped from source.
                  </p>
                  
                  <div className="mock-slide-canvas">
                    <div className="canvas-header">
                      <div className="canvas-header-title" />
                      <div style={{ height: '6px', width: '20px', background: '#374151', borderRadius: '2px' }} />
                    </div>
                    
                    <div className="canvas-tile-box-cyan">
                      <div style={{ background: '#22d3ee', color: '#070a10', fontSize: '6px', fontWeight: 'bold', padding: '1px 3px', borderRadius: '2px', display: 'inline-block', marginBottom: '4px' }}>OCR TILE BLOCK</div>
                      <p>"{selectedInsight.quotes[0]?.text || "Personalized vaccine logistics are complex."}"</p>
                    </div>

                    <div className="canvas-tile-box-purple">
                      <div style={{ background: '#c084fc', color: 'white', fontSize: '6px', fontWeight: 'bold', padding: '1px 3px', borderRadius: '2px', display: 'inline-block', marginBottom: '4px' }}>CHART CAPTION TILE</div>
                      <p style={{ color: '#c084fc' }}>"Preventing recurrence through personalized therapies offsets advanced cost."</p>
                    </div>

                    <div className="canvas-footer">
                      <span>SOURCE: {selectedInsight.slide_reference}</span>
                      <span>COORDS: [x: 104, y: 342, w: 590, h: 120]</span>
                    </div>
                  </div>
                </div>

                {/* Audit & Compliance summary */}
                <div className="glass-card compliance-summary-box">
                  <h3 className="glass-card-title">Compliance Audit Summary</h3>
                  
                  <div className="compliance-gauge-wrapper">
                    <div className="compliance-circle">
                      <div 
                        className={`compliance-fill-height ${selectedInsight.compliance_score >= 0.8 ? '' : 'low'}`} 
                        style={{ height: `${selectedInsight.compliance_score * 100}%` }}
                      />
                      <span>{Math.round(selectedInsight.compliance_score * 100)}%</span>
                    </div>

                    <div className="compliance-text">
                      <h5>Compliance Verification Rating</h5>
                      <p>
                        {selectedInsight.compliance_score >= 0.80 
                          ? "Compliant. Exceeds the 80% baseline. Approved for scientific exchange."
                          : "Non-Compliant. Quarantined due to commercial jargon or missing clinical endpoints."}
                      </p>
                    </div>
                  </div>

                  <div className="verbatim-quotes-title">Verbatim Source Grounding</div>
                  {selectedInsight.quotes.map((q, i) => (
                    <div key={i} className="verbatim-quote-box">
                      <p className="italic">"{q.text}"</p>
                      <span>— Bounding Area: {q.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYNTHESIS & THOUGHT PARTNER */}
          {activeTab === 'themes' && (
            <div className="synthesis-split animate-fade-in">
              
              {/* Left pane: Themes & Conflicts */}
              <div className="synthesis-left-panel">
                
                {/* Themes card */}
                <div className="glass-card">
                  <div className="section-header" style={{ marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <h3 className="glass-card-title" style={{ marginBottom: 0 }}>
                      <Sparkles size={16} /> Cross-Functional Themes
                    </h3>
                    <button 
                      onClick={triggerSynthesisAPI}
                      className="tab-btn" 
                      style={{ padding: '4px', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent' }}
                      title="Force Recalculate Themes"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>

                  <div className="themes-list">
                    {themes.map((theme, idx) => (
                      <div key={idx} className="theme-card">
                        <div className="theme-card-header">
                          <h4>{theme.theme_name}</h4>
                          <span className="theme-rank-badge">Rank: {theme.theme_score}</span>
                        </div>
                        <p>{theme.executive_synthesis}</p>
                        <div className="theme-tags">
                          {theme.contributing_functions.map((fn, fIdx) => (
                            <span key={fIdx} className="theme-tag-chip">{fn}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflicts queue card */}
                <div className="glass-card">
                  <h3 className="glass-card-title">
                    <AlertTriangle size={16} /> Conflict Workshop Queue
                  </h3>
                  
                  <div className="conflicts-queue">
                    {conflicts.map(conf => (
                      <div key={conf.id} className="conflict-card">
                        <div className="conflict-card-header">
                          <span className="conflict-tag">{conf.conflict_type}</span>
                          <span className="conflict-status">FLAGGED</span>
                        </div>
                        <p>{conf.description}</p>
                        <div className="conflict-card-footer">
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
                            className="btn btn-primary"
                            style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', boxShadow: 'none', padding: '4px 10px' }}
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                    {conflicts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', fontSize: '11px', color: '#6b7280' }}>
                        No active contradictions detected. Consensus achieved!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right pane: Chat Terminal */}
              <div className="glass-card chat-terminal-card">
                <div className="workspace-header" style={{ marginBottom: '12px' }}>
                  <div className="workspace-header-title">
                    <h3>Strategic Thought Partner</h3>
                    <p>Powered by Gemini 1.5 Pro • Grounded strictly in validated memory.</p>
                  </div>
                  <div className="chat-header-status">
                    <div className="chat-dot" />
                    <span>Grounded (OKF Pool)</span>
                  </div>
                </div>

                {/* Messages Viewport */}
                <div className="chat-messages-viewport">
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div 
                        key={index}
                        className={`chat-bubble-wrapper ${isUser ? 'user' : 'assistant'}`}
                      >
                        <div className={`chat-avatar ${isUser ? 'user' : 'assistant'}`}>
                          {isUser ? 'ME' : '🤖'}
                        </div>
                        
                        <div className="chat-bubble">
                          {msg.content}
                          
                          {!isUser && msg.content.includes("Strategy Refinement Options") && (
                            <div className="chat-refinement-options">
                              <span className="refinement-header">Refinement Pathways</span>
                              <button 
                                onClick={() => setChatInput("Analyze the operational flowchart for regional delivery hubs to reduce community oncology lag.")}
                                className="refinement-btn"
                              >
                                → Analyze operational delivery hub flowchart
                              </button>
                              <button 
                                onClick={() => setChatInput("Run a simulation on payer prior authorization friction thresholds for customized immunotherapies.")}
                                className="refinement-btn"
                              >
                                → Simulate payer prior authorization friction
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && (
                    <div style={{ fontSize: '10px', color: '#9ca3af', display: 'flex', gap: '6px', alignItems: 'center', margin: '8px 0' }}>
                      <RefreshCw className="animate-spin" size={12} style={{ color: '#22d3ee' }} />
                      Gemini 1.5 Pro pressure-testing perspectives...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Grounding Context */}
                {retrievedContext.length > 0 && (
                  <div className="chat-grounding-context">
                    <div className="grounding-title">
                      <Database size={12} /> Grounded Source Nodes ({retrievedContext.length})
                    </div>
                    <div className="grounding-scroller">
                      {retrievedContext.map((c, i) => (
                        <span key={i} className="grounding-tag">
                          {c.asset} - {c.tumor} ({c.function_lane})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="chat-input-area">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about clinical adoption, access barriers, or competitive timeline alignment..."
                    className="chat-input-field"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={chatLoading}
                    className="chat-send-btn"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="glass-card animate-fade-in">
              <div className="workspace-header" style={{ marginBottom: '20px' }}>
                <div className="workspace-header-title">
                  <h3>Immutable Compliance Audit Trail</h3>
                  <p>Verifiable logging of every agent decision, tool execution, and LLM reasoning step for compliance auditing.</p>
                </div>
              </div>

              <div className="audit-list">
                {auditLogs.map((log, lIdx) => (
                  <div key={lIdx} className="audit-card">
                    <div className="audit-card-header">
                      <div className="audit-step-badge">
                        <div className="audit-step-number">{log.step_index}</div>
                        <span className="audit-step-name">{log.step_name}</span>
                      </div>
                      <span className="audit-agent-tag">Agent: <strong>{log.agent_name}</strong></span>
                    </div>

                    <div className="audit-payloads-grid">
                      <div className="audit-payload-box">
                        <span>Input Payload / Trigger</span>
                        <pre>{log.user_input}</pre>
                      </div>
                      <div className="audit-payload-box">
                        <span>Model Output / Decision</span>
                        <pre>{log.model_output}</pre>
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
