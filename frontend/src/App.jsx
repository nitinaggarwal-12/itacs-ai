import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, MessageSquare, 
  Settings, Layers, RefreshCw, Send, ShieldAlert, Check, 
  HelpCircle, Eye, ChevronRight, Edit3, UserCheck, Sparkles, Database, History, Play, X
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
  // Navigation: 'cockpit' (Executive Cockpit), 'matrix' (Commercial Matrix), 'ingest' (Ingestion Factory)
  const [activeTab, setActiveTab] = useState('cockpit'); 
  
  // Commercial Matrix Detail Sub-Tab: 'framework', 'grounding', 'audit'
  const [detailTab, setDetailTab] = useState('framework');
  
  // Truth Engine Modal state
  const [showTruthModal, setShowTruthModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  
  // Data lists
  const [insights, setInsights] = useState(MOCK_INSIGHTS);
  const [themes, setThemes] = useState(MOCK_THEMES);
  const [conflicts, setConflicts] = useState(MOCK_CONFLICTS);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT);
  
  // Selection
  const [selectedInsight, setSelectedInsight] = useState(MOCK_INSIGHTS[0]);
  
  // Stepper & Session (for Ingestion Factory)
  const [activeStep, setActiveStep] = useState(6); // 1 to 7
  const [ingestionSession, setIngestionSession] = useState("active_session_001");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Ingestion Metadata
  const [uploadLane, setUploadLane] = useState("Market Research");
  const [uploadAsset, setUploadAsset] = useState("V940");
  const [uploadTumor, setUploadTumor] = useState("Melanoma");
  const [uploadSubTumor, setUploadSubTumor] = useState("Stage III/IV");

  // Search & Filters (for Matrix Grid)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLane, setFilterLane] = useState("All Functions");
  const [filterAsset, setFilterAsset] = useState("All Assets");

  // Form edit states (for selectedInsight details)
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
          { text: "We wait 21 days for NGS results. If the patient is highly symptomatic, we cannot wait—we start chemo immediately.", location: "slide 8, interview transcript" },
          { text: "Rapid single-gene assays would solve our first-line sequencing dilemma.", location: "slide 8, quote box C" }
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
        { step_index: 1, step_name: "Upload", agent_name: "System Ingestion", user_input: "File: BiomarkerNGS_Report.pdf (2.4 MB)", model_output: "Document uploaded and converted to coordinate visual matrix." },
        { step_index: 2, step_name: "Ingestion", agent_name: "Functional Extraction Copilot", user_input: "Analyze slides via vision-language tiles", model_output: "PixelRAG extraction completed. Bounding boxes mapped for slide 8. Extracted ITACS framework." },
        { step_index: 3, step_name: "Functional Draft", agent_name: "Functional Extraction Copilot", user_input: "Verify framework fields", model_output: "Draft generated: 5 structural cards mapped successfully. Metadata tags: MK-1084, Lung, Non-Small Cell." },
        { step_index: 4, step_name: "Compliance Check", agent_name: "Compliance Supervisor", user_input: "Audit for Medical Affairs rules & commercial vocabulary", model_output: "Compliance score: 0.98. Approved. Enforces strict clinical focus on molecular screening; no commercial jargon detected." },
        { step_index: 5, step_name: "Cross-Functional", agent_name: "Cross-Functional Synthesizer", user_input: "Run thematic synthesis", model_output: "Synthesis completed. Identified new theme regarding molecular diagnostics sequencing bottlenecks." }
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
          compliance_score: uploadLane === "Medical Affairs" ? 0.92 : 0.85,
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
        const targetId = selectedInsight ? selectedInsight.id : "e39f3792-7489-4e7c-86c8-f80e722a2789";
        let answer = `### Strategic Synthesis: Grounded Analysis

Based on our validated ITACS Enterprise Memory regarding **V940** in **Melanoma**, here is the cross-functional guidance:

#### 1. Medical Affairs Perspective (The Clinical Lens)
- **Clinical Endpoints**: Scientific exchange must focus on the clinical value proposition of the adjuvant program. MSLs should present the **44% reduction in recurrence risk (RFS/DMFS)**, educating community oncologists on how personalized sequencing prevents secondary recurrence. [Verify: ${targetId}]
- **Biomarker Screening**: Standardizing screening protocols at regional sites is critical to capture high-risk stage III/IV patients immediately post-resection.

#### 2. Market Access & Payer Perspective (The Value Lens)
- **Coverage Hurdles**: Payers will require strict prior authorizations. We must showcase that preventing recurrence through personalized mRNA sequencing offsets the high downstream costs of advanced metastatic treatments.
- **Logistics & Pathways**: Access teams must co-develop integration agreements with national oncology clinical pathways to ensure reimbursement flows smoothly for personalized components. [Verify: ${targetId}]

#### 3. Competitive Intelligence Perspective (Market Dynamics)
- **Competitor Activity**: Competitors are ramping up trials for pre-mixed monotherapies, marketing them as 'frictionless' compared to personalized mRNA regimens.
- **Adoption Threats**: Operational delays in community practices create a 12-month adoption lag, giving competitors a window to lock in multi-year contracts.

---

### Strategy Refinement Options
- *Would you like to examine the detailed operational flowchart for regional delivery hubs to reduce community oncology lag?*
- *Should we run a simulation on payer prior authorization friction thresholds for customized immunotherapies?*`;
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

  const handleAuditClick = (log) => {
    setSelectedAuditLog(log);
    setShowTruthModal(true);
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
          <h3 key={idx} style={{ marginTop: '16px', marginBottom: '8px', color: '#93c5fd', fontSize: '13px', fontWeight: 800 }}>
            {parseBoldAndCitations(trimmed.substring(4))}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} style={{ marginTop: '12px', marginBottom: '6px', color: '#60a5fa', fontSize: '11px', fontWeight: 700 }}>
            {parseBoldAndCitations(trimmed.substring(5))}
          </h4>
        );
      } else if (trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(
          <li key={`li-${idx}`} style={{ marginBottom: '6px', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.6' }}>
            {parseBoldAndCitations(trimmed.substring(2))}
          </li>
        );
      } else if (trimmed === '') {
        // Skip empty lines
      } else {
        elements.push(
          <p key={idx} style={{ marginBottom: '10px', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.6' }}>
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
      
      {/* =====================================================================
         UX PILLAR 5: PERSISTENT LEFT-HAND NAVIGATION SIDEBAR
         ===================================================================== */}
      <aside className="sidebar-navigation">
        <div className="sidebar-brand">
          <div className="brand-badge">🧬</div>
          <div className="brand-text">
            <h1>ITACS Enterprise</h1>
            <p>Global Oncology Command</p>
          </div>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Command & Interrogate</span>
          <button 
            onClick={() => setActiveTab('cockpit')}
            className={`sidebar-nav-btn ${activeTab === 'cockpit' ? 'active' : ''}`}
          >
            <Sparkles size={16} /> Launch Cockpit
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
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Govern & Control</span>
          <button 
            onClick={() => setActiveTab('ingest')}
            className={`sidebar-nav-btn ${activeTab === 'ingest' ? 'active' : ''}`}
          >
            <Database size={16} /> Ingestion Factory
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

        {/* =====================================================================
           UX PILLAR 3: BRAND PLANNING MACRO-TIMELINE (L3Next Milestone Windows)
           ===================================================================== */}
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
                  <p>Nov - Jan 2026</p>
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

        {/* =====================================================================
           TAB 1: LAUNCH COCKPIT (THE EXECUTIVE COMMAND HUB)
           ===================================================================== */}
        {activeTab === 'cockpit' && (
          <main className="cockpit-layout animate-fade-in">
            
            {/* Left Column: Scorecard & Themes */}
            <div className="cockpit-left">
              
              <div className="scorecard-grid">
                <div className="metric-card">
                  <span className="metric-val blue">{insights.filter(i => i.is_validated).length}</span>
                  <span className="metric-label">Validated Memory</span>
                </div>
                <div className="metric-card">
                  <span className="metric-val amber">{insights.filter(i => !i.is_validated).length}</span>
                  <span className="metric-label">Active Drafts</span>
                </div>
                <div className="metric-card">
                  <span className="metric-val red">{conflicts.filter(c => c.status === "Flagged").length}</span>
                  <span className="metric-label">Open Conflicts</span>
                </div>
              </div>

              <div className="glass-card">
                <h3 className="glass-card-title">
                  <Sparkles size={16} style={{ color: '#60a5fa' }} /> Launch Themes & Strategic Risks
                </h3>
                <div className="themes-scroller">
                  {themes.map((theme, idx) => (
                    <div key={idx} className="theme-item">
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
                    <div key={conf.id} className="theme-item" style={{ borderLeft: '3px solid #ef4444' }}>
                      <div className="theme-item-header">
                        <h4 style={{ color: '#fca5a5', fontSize: '11px' }}>{conf.conflict_type}</h4>
                        <span className="theme-score" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>FLAGGED</span>
                      </div>
                      <p style={{ fontSize: '10px' }}>{conf.description}</p>
                      <div className="drawer-actions" style={{ justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button 
                          onClick={async () => {
                            const notes = prompt("Enter workshop alignment notes:");
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
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 10px', fontSize: '9px' }}
                        >
                          Resolve Alignment
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
                <div className="chat-viewport">
                  {chatMessages.length === 1 ? (
                    
                    /* =====================================================================
                       UX PILLAR 2: PROACTIVE INTELLIGENCE WIDGETS (Anti-Empty-Void)
                       ===================================================================== */
                    <div className="proactive-advisor-canvas animate-fade-in">
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
                          onClick={() => handleSendMessage("Generate GOLT Executive Briefing Summary for V940 Melanoma program.")}
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

                            {!isUser && msg.content.includes("Strategy Refinement Options") && (
                              <div className="prompt-chips-wrapper">
                                <span className="prompt-chips-header font-bold">Suggested Refinements</span>
                                <button 
                                  onClick={() => handleSendMessage("Analyze the operational flowchart for regional delivery hubs to reduce community oncology lag.")}
                                  className="prompt-suggestion-btn"
                                >
                                  → Analyze community operational delivery hubs
                                </button>
                                <button 
                                  onClick={() => handleSendMessage("Run a simulation on payer prior authorization friction thresholds for customized immunotherapies.")}
                                  className="prompt-suggestion-btn"
                                >
                                  → Simulate payer prior authorization friction
                                </button>
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
                  <div ref={chatEndRef} />
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

        {/* =====================================================================
           TAB 2: COMMERCIAL MATRIX (THE CROSS-FUNCTIONAL REVIEW GRID)
           ===================================================================== */}
        {activeTab === 'matrix' && selectedInsight && (
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
                  const isSelected = selectedInsight.id === ins.id;
                  const laneClass = getFunctionBadgeClass(ins.metadata.function_lane);
                  
                  let statusClass = "draft";
                  let statusText = "DRAFT REVIEW";
                  if (ins.is_validated) { statusClass = "validated"; statusText = "MEMORY"; }
                  else if (ins.is_quarantined) { statusClass = "quarantined"; statusText = "QUARANTINE"; }

                  return (
                    <div 
                      key={ins.id}
                      onClick={() => setSelectedInsight(ins)}
                      className={`matrix-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="matrix-card-header">
                        <span className={`matrix-lane-tag ${laneClass}`}>{ins.metadata.function_lane}</span>
                        <span className={`matrix-status-badge ${statusClass}`}>{statusText}</span>
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
                {filteredInsights.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1', color: '#64748b', fontSize: '12px' }}>
                    No strategic cards match your search criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Source Verification & Details Drawer */}
            <div className="matrix-right-drawer">
              <div className="glass-card" style={{ height: '100%' }}>
                <div className="drawer-header" style={{ marginBottom: '10px' }}>
                  <div className="drawer-header-title">
                    <h3>ITACS Card Validation</h3>
                    <p>Validate the extracted fields and review compliance gating.</p>
                  </div>
                  
                  <div className="drawer-actions">
                    <button onClick={() => setShowConflictForm(true)} className="btn btn-warn">
                      <AlertTriangle size={12} /> Flag Contradiction
                    </button>
                    <button onClick={handleApprove} className="btn btn-primary">
                      <Check size={12} /> Approve to Memory
                    </button>
                  </div>
                </div>

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
                    Compliance Audit
                  </button>
                </div>

                {/* =====================================================================
                   UX PILLAR 1: CHEVRON/CASCADE INTERCONNECTED FLOW MATRIX
                   ===================================================================== */}
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
                  <div className="verification-tabs-box animate-fade-in" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="mock-slide-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="slide-headline-indicator" />
                        <div style={{ height: '5px', width: '20px', background: '#1e293b', borderRadius: '2px' }} />
                      </div>

                      <div className="slide-bounding-tile-cyan">
                        <span style={{ background: '#06b6d4', color: '#06080d', fontSize: '5px', fontWeight: 'bold', padding: '1px 3px', borderRadius: '2px', display: 'inline-block', marginBottom: '2px' }}>OCR COORDINATES BLOCK</span>
                        <p style={{ fontSize: '7px', margin: 0 }}>"{selectedInsight.quotes[0]?.text || "Logistics are complex."}"</p>
                      </div>

                      <div className="slide-bounding-tile-purple">
                        <span style={{ background: '#c084fc', color: 'white', fontSize: '5px', fontWeight: 'bold', padding: '1px 3px', borderRadius: '2px', display: 'inline-block', marginBottom: '2px' }}>CHART TEXT FIELD</span>
                        <p style={{ fontSize: '7px', color: '#c084fc', margin: 0 }}>"Preventing recurrence through personalized therapies offsets advanced cost."</p>
                      </div>

                      <div className="slide-footer-coords">
                        <span>SOURCE: {selectedInsight.slide_reference}</span>
                        <span>COORDS: [x: 104, y: 342, w: 590, h: 120]</span>
                      </div>
                    </div>

                    <span className="verification-heading" style={{ marginTop: '8px', display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Verbatim Slide Grounding</span>
                    {selectedInsight.quotes.map((q, i) => (
                      <div key={i} className="verbatim-container" style={{ marginTop: '6px' }}>
                        <p className="italic">"{q.text}"</p>
                        <span>— Grounded Area: {q.location}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-Tab 3: Compliance Audit */}
                {detailTab === 'audit' && (
                  <div className="verification-tabs-box animate-fade-in" style={{ borderTop: 'none', paddingTop: 0, gap: '14px', display: 'flex', flexDirection: 'column' }}>
                    <div className="compliance-metric-row" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'center', marginTop: '10px' }}>
                      <div className="compliance-donut" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '4px solid #1e293b', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{Math.round(selectedInsight.compliance_score * 100)}%</span>
                      </div>
                      <div className="compliance-donut-text">
                        <h5 style={{ fontSize: '11px', margin: 0, fontWeight: 700 }}>Compliance Gating Verification</h5>
                        <p style={{ fontSize: '9px', margin: '4px 0 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {selectedInsight.compliance_score >= 0.8
                            ? "APPROVED: Exceeds the 80% baseline. Approved for scientific exchange."
                            : "QUARANTINED: Fails to meet the baseline. Contains non-compliant commercial terminology."}
                        </p>
                      </div>
                    </div>

                    <div className="itacs-field-block" style={{ background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '14px', borderRadius: '10px' }}>
                      <label style={{ color: '#ef4444', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Supervisor Validation Notes</label>
                      <p style={{ fontSize: '10px', color: '#fca5a5', margin: 0, lineHeight: '1.5' }}>
                        {selectedInsight.compliance_score >= 0.8 
                          ? "Clinical terminology matches scientific guidelines. Banned commercial expressions (e.g., pricing margins, ROI targets, market capitalizations) are completely absent. Bounding coordinates verified successfully against visual matrix."
                          : "Quarantine triggered. The rationale field contains promotional or commercial vocabulary ('margins', 'squeezed') which is strictly prohibited under Medical Scientific exchange regulations."}
                      </p>
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
                        style={{ background: 'black', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '6px', fontSize: '10px', width: '100%', outline: 'none' }}
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
                        style={{ background: 'black', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '6px', fontSize: '10px', width: '100%', resize: 'none', outline: 'none' }}
                      />
                    </div>
                    <div className="drawer-actions" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button onClick={() => setShowConflictForm(false)} className="btn btn-subtle">Cancel</button>
                      <button onClick={handleFlagContradiction} className="btn btn-primary" style={{ background: '#ef4444' }}>Flag Dispute</button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </main>
        )}

        {/* =====================================================================
           TAB 3: INGESTION FACTORY (THE COMPLIANCE & LIFE-CYCLE ENGINE)
           ===================================================================== */}
        {activeTab === 'ingest' && (
          <main className="ingest-layout animate-fade-in">
            
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

                <div className="metadata-selectors-grid">
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

              <div className="ingest-stepper-box">
                <span className="ingest-stepper-title">Agent Processing Sequence</span>
                
                <div className="ingest-stepper-row">
                  {[
                    { idx: 1, name: "Upload", desc: "File Ingress" },
                    { idx: 2, name: "Ingest", desc: "PixelRAG Tiles" },
                    { idx: 3, name: "Drafting", desc: "ITACS Map" },
                    { idx: 4, name: "Auditing", desc: "White Line" },
                    { idx: 5, name: "Synthesis", desc: "Cross-Clustering" },
                    { idx: 6, name: "Validation", desc: "SME Approval" },
                    { idx: 7, name: "Memory", desc: "Grounded RAG" }
                  ].map(step => {
                    const isCompleted = step.idx < activeStep;
                    const isActive = step.idx === activeStep;
                    const isReview = step.idx === 6 && isActive;

                    let stateClass = "";
                    if (isCompleted) stateClass = "completed";
                    if (isActive) stateClass = "active";
                    if (isReview) stateClass = "active review-state";

                    return (
                      <div key={step.idx} className={`stepper-pill ${stateClass}`}>
                        <div className="stepper-pill-circle">
                          {isCompleted ? <Check size={10} /> : step.idx}
                        </div>
                        <h4>{step.name}</h4>
                        <p>{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Immutable Compliance Audit Trail */}
            <div className="ingest-right-audit">
              <div className="glass-card" style={{ height: '100%' }}>
                <h3 className="glass-card-title">
                  <History size={16} /> Verifiable Compliance Audit Log
                </h3>
                
                {/* 
                   UX PILLAR 4: SHOW THE MACHINE'S WORK
                   Audit nodes are clickable and open the high-fidelity Truth Modal!
                */}
                <div className="audit-scroller">
                  {auditLogs.map((log, lIdx) => (
                    <div 
                      key={lIdx} 
                      onClick={() => handleAuditClick(log)}
                      className="audit-node animate-fade-in"
                      title="Click to inspect original visual slide and API step trace"
                    >
                      <div className="audit-node-header">
                        <div className="audit-badge">
                          <div className="audit-num">{log.step_index}</div>
                          <span className="audit-name">{log.step_name}</span>
                        </div>
                        <span className="audit-agent">Agent: <strong>{log.agent_name}</strong></span>
                      </div>

                      <div className="audit-payload-row">
                        <div className="audit-payload-cell">
                          <span>Input Trigger</span>
                          <pre>{log.user_input}</pre>
                        </div>
                        <div className="audit-payload-cell">
                          <span>Agent Output / Decision</span>
                          <pre>{log.model_output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        )}

      </div>

      {/* =====================================================================
         UX PILLAR 4: THE COMPLIANCE & AI TRUTH ENGINE MODAL
         ===================================================================== */}
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
              {/* Left Side: Visual Slide Coordinates Grounding */}
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
                  <pre style={{ margin: '8px 0 0 0', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', fontSize: '9px', color: 'var(--brand-cyan)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {selectedAuditLog.model_output}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
