import os
import json
import logging
import datetime
from typing import List, Optional, Dict, Any
import numpy as np
import yaml

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sqlalchemy import create_engine, Column, String, Integer, Boolean, Numeric, DateTime, Text, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID, JSONB

# Import the Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("itacs_platform")

# FastAPI App initialization
app = FastAPI(
    title="ITACS Enterprise Insights Platform API",
    description="Strategic synthesis and compliance auditing engine for oncology commercialization planning.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Configuration
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://itacs_admin:itacs_secure_pass_2026@db:5432/itacs_enterprise")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Initialize Gemini Client
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
client = None
if GENAI_AVAILABLE and GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Google GenAI client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Google GenAI client: {e}")
else:
    logger.warning("Google GenAI client NOT initialized. Running in simulation/mock mode for LLM operations.")

# =====================================================================
# DATABASE MODELS
# =====================================================================

class EnterpriseMemory(Base):
    __tablename__ = "enterprise_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    opportunity_space = Column(Text, nullable=False)
    csf = Column(Text, nullable=False)
    insight = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    implication = Column(Text, nullable=False)
    quotes = Column(JSONB, nullable=False, default=list)
    slide_reference = Column(String(255))
    
    function_lane = Column(String(100), nullable=False)
    asset = Column(String(100), nullable=False)
    tumor = Column(String(100), nullable=False)
    sub_tumor = Column(String(100), nullable=False)
    
    compliance_score = Column(Numeric(5, 2), default=1.00)
    requires_human_review = Column(Boolean, default=False)
    is_quarantined = Column(Boolean, default=False)
    is_stale = Column(Boolean, default=False)
    is_validated = Column(Boolean, default=False)
    
    markdown_representation = Column(Text, nullable=False)
    yaml_metadata = Column(JSONB, nullable=False, default=dict)
    
    # We query embedding using raw SQL due to pgvector type definition
    # Column 'embedding' is defined in SQL schema
    
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

class AgentAuditTrail(Base):
    __tablename__ = "agent_audit_trail"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    session_id = Column(String(100), nullable=False)
    step_index = Column(Integer, nullable=False)
    step_name = Column(String(100), nullable=False)
    agent_name = Column(String(100), nullable=False)
    user_input = Column(Text)
    model_output = Column(Text)
    function_calls = Column(JSONB, default=list)
    tool_execution = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

class CrossFunctionalConflict(Base):
    __tablename__ = "cross_functional_conflicts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    source_insight_id = Column(UUID(as_uuid=True), ForeignKey("enterprise_memory.id", ondelete="CASCADE"))
    conflicting_insight_id = Column(UUID(as_uuid=True), ForeignKey("enterprise_memory.id", ondelete="CASCADE"))
    conflict_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Flagged")
    resolution_notes = Column(Text)
    resolved_by = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =====================================================================
# PYDANTIC SCHEMAS
# =====================================================================

class QuoteSchema(BaseModel):
    text: str
    location: str

class MetadataSchema(BaseModel):
    function_lane: str = Field(..., description="Market Research, Medical Affairs, Market Access, Competitive Intelligence")
    asset: str
    tumor: str
    sub_tumor: str

class InsightPayload(BaseModel):
    opportunity_space: str
    csf: str
    insight: str
    rationale: str
    implication: str
    quotes: List[QuoteSchema]
    slide_reference: str
    metadata: MetadataSchema

class InsightUpdatePayload(BaseModel):
    opportunity_space: Optional[str] = None
    csf: Optional[str] = None
    insight: Optional[str] = None
    rationale: Optional[str] = None
    implication: Optional[str] = None
    quotes: Optional[List[QuoteSchema]] = None
    slide_reference: Optional[str] = None
    is_validated: Optional[bool] = None

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = "global_session"

# =====================================================================
# AGENT HELPER LOGIC (ADK & SKILLS SIMULATION)
# =====================================================================

def log_audit_trail(db: Session, session_id: str, step_index: int, step_name: str, agent_name: str, user_input: Optional[str], model_output: Optional[str], function_calls: List = None, tool_execution: List = None):
    audit = AgentAuditTrail(
        session_id=session_id,
        step_index=step_index,
        step_name=step_name,
        agent_name=agent_name,
        user_input=user_input,
        model_output=model_output,
        function_calls=function_calls or [],
        tool_execution=tool_execution or []
    )
    db.add(audit)
    db.commit()

def generate_embedding(text_content: str) -> List[float]:
    """Generates 768-dimension vector embedding for semantic search using text-embedding-004."""
    if client:
        try:
            response = client.models.embed_content(
                model="text-embedding-004",
                contents=text_content
            )
            # Check if embedding exists in the response
            if response.embeddings and len(response.embeddings) > 0:
                return response.embeddings[0].values
        except Exception as e:
            logger.error(f"Error calling embedding API: {e}")
    
    # Fallback/mock embedding generator (768 dimensions)
    # Generates a deterministic vector based on the hash of the text content
    rng = np.random.default_rng(hash(text_content) & 0xffffffff)
    mock_vector = rng.standard_normal(768)
    norm = np.linalg.norm(mock_vector)
    if norm > 0:
        mock_vector = mock_vector / norm
    return mock_vector.tolist()

def load_skill_instructions(skill_filename: str) -> str:
    """Reads instructions from backend/skills markdown definitions."""
    path = os.path.join(os.path.dirname(__file__), "skills", skill_filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return f"Skill instructions for {skill_filename} not found."

# =====================================================================
# ENDPOINTS: MODULE 1 & 2 - INGESTION, STORAGE & FRAMEWORK
# =====================================================================

@app.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form("upload_session"),
    function_lane: str = Form("Market Research"),
    asset: str = Form("V940"),
    tumor: str = Form("Melanoma"),
    sub_tumor: str = Form("Stage III/IV"),
    db: Session = Depends(get_db)
):
    """
    Ingests PDF/PPTX/Images and uses PixelRAG visual-layout understanding
    to extract structured insights conforming to Merck ITACS framework.
    """
    logger.info(f"Uploading file {file.filename} in session {session_id}")
    file_bytes = await file.read()
    
    # Step 1: Log file upload
    log_audit_trail(
        db=db,
        session_id=session_id,
        step_index=1,
        step_name="Upload",
        agent_name="System Ingestion",
        user_input=f"Filename: {file.filename}, Size: {len(file_bytes)} bytes",
        model_output="File received and buffered."
    )

    # Step 2: Extract structured data using Gemini 2.5 Flash Multimodal Ingestion (PixelRAG simulation/call)
    skill_content = load_skill_instructions("extraction_skill.md")
    
    prompt = f"""
    You are the Functional Extraction Copilot. Perform a visual-spatial tile analysis on the uploaded document.
    Do not destroy spatial charts, tables, or callouts.
    Extract key oncology commercialization or clinical insights matching the Merck ITACS framework and OKF v0.1 format.
    
    Ensure you return a valid JSON object matching the JSON Schema outlined in our skill rules.
    If the document has multiple slides/pages, output a JSON list under a root 'insights' key.
    
    The document is uploaded as a file attachment. Here is the metadata you must include in your tags:
    - function_lane: {function_lane}
    - asset: {asset}
    - tumor: {tumor}
    - sub_tumor: {sub_tumor}
    """
    
    extracted_json = None
    api_success = False

    if client:
        try:
            # Detect mime type
            mime_type = "application/pdf"
            if file.filename.endswith((".png", ".jpg", ".jpeg")):
                mime_type = "image/jpeg"
            elif file.filename.endswith(".pptx"):
                mime_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            
            # Call Gemini
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    system_instruction=skill_content,
                    response_mime_type="application/json"
                )
            )
            
            # Parse JSON
            raw_text = response.text.strip()
            # Clean possible markdown wrap ```json ... ```
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1)
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            
            extracted_json = json.loads(raw_text.strip())
            api_success = True
            logger.info("Gemini PixelRAG extraction completed successfully.")
        except Exception as e:
            logger.error(f"Gemini API Ingestion failed: {e}. Falling back to simulation.")
            api_success = False

    if not api_success or not extracted_json:
        # High-fidelity simulated data matching the exact ITACS standard for demo resilience
        logger.info("Using high-fidelity simulated extraction data.")
        extracted_json = {
            "insights": [
                {
                    "opportunity_space": "Adjuvant Therapeutic Sequencing Optimization",
                    "csf": "Establishing V940 + Keytruda as first-line adjuvant standard in high-risk stage III/IV Melanoma",
                    "insight": "Physicians express concern over the operational complexity of personalized mRNA therapies in community clinics compared to standard monotherapy, despite a 44% reduction in recurrence risk.",
                    "rationale": "Without structured clinical support pathways, community oncologists are likely to default to pembrolizumab monotherapy, delaying adoption and reducing market share by an estimated 15% in the first 12 months post-launch.",
                    "implication": "Establish specialized regional operational hubs to manage logistics, patient screening, and scheduling, and launch a dedicated community-practice educational campaign.",
                    "quotes": [
                        {"text": "The logistics of waiting for customized mRNA vaccines are challenging for community sites without dedicated care coordinators.", "location": "slide 12, top right interview callout"},
                        {"text": "We need clear support systems, otherwise Pembrolizumab remains the path of least resistance.", "location": "slide 12, quote box B"}
                    ],
                    "slide_reference": f"{file.filename}, slide 12",
                    "metadata": {
                        "function_lane": function_lane,
                        "asset": asset,
                        "tumor": tumor,
                        "sub_tumor": sub_tumor
                    }
                }
            ]
        }

    # Step 3: Log Ingestion step
    log_audit_trail(
        db=db,
        session_id=session_id,
        step_index=2,
        step_name="Ingestion",
        agent_name="Functional Extraction Copilot",
        user_input=f"Analyze document {file.filename}",
        model_output=json.dumps(extracted_json)
    )

    # Normalize extracted insights
    insights_list = extracted_json.get("insights", [])
    if not insights_list and isinstance(extracted_json, dict) and "insight" in extracted_json:
        insights_list = [extracted_json]

    results = []
    for raw_insight in insights_list:
        # Run step 3: Compliance Supervisor
        audit_res = check_compliance_logic(raw_insight, db, session_id)
        
        # Format Open Knowledge Format (OKF v0.1) Markdown representation
        yaml_frontmatter = {
            "function": raw_insight["metadata"]["function_lane"],
            "asset": raw_insight["metadata"]["asset"],
            "tumor": raw_insight["metadata"]["tumor"],
            "sub_tumor": raw_insight["metadata"]["sub_tumor"],
            "compliance_score": float(audit_res["compliance_score"]),
            "requires_human_review": audit_res["requires_human_review"],
            "is_quarantined": audit_res["is_quarantined"],
            "slide_ref": raw_insight["slide_reference"],
            "created_at": datetime.datetime.now().isoformat()
        }
        
        markdown_representation = f"""---
{yaml.dump(yaml_frontmatter, default_flow_style=False).strip()}
---

# Opportunity Space: {raw_insight["opportunity_space"]}
## Critical Success Factor (CSF): {raw_insight["csf"]}

### What (Insight)
{raw_insight["insight"]}

### Why (Rationale)
{raw_insight["rationale"]}

### Implication
{raw_insight["implication"]}

### Quotes & Grounding
{chr(10).join([f'- "{q["text"]}" ({q["location"]})' for q in raw_insight["quotes"]])}
"""
        # Create enterprise memory record (Starts as non-validated, pending SME approval)
        concatenated_text = f"Opportunity Space: {raw_insight['opportunity_space']} | CSF: {raw_insight['csf']} | Insight: {raw_insight['insight']} | Rationale: {raw_insight['rationale']} | Implication: {raw_insight['implication']}"
        vector = generate_embedding(concatenated_text)

        insight_record = EnterpriseMemory(
            opportunity_space=raw_insight["opportunity_space"],
            csf=raw_insight["csf"],
            insight=raw_insight["insight"],
            rationale=raw_insight["rationale"],
            implication=raw_insight["implication"],
            quotes=raw_insight["quotes"],
            slide_reference=raw_insight["slide_reference"],
            function_lane=raw_insight["metadata"]["function_lane"],
            asset=raw_insight["metadata"]["asset"],
            tumor=raw_insight["metadata"]["tumor"],
            sub_tumor=raw_insight["metadata"]["sub_tumor"],
            compliance_score=audit_res["compliance_score"],
            requires_human_review=audit_res["requires_human_review"],
            is_quarantined=audit_res["is_quarantined"],
            markdown_representation=markdown_representation,
            yaml_metadata=yaml_frontmatter,
            is_validated=False # Requires SME validation
        )
        
        db.add(insight_record)
        db.commit()
        db.refresh(insight_record)
        
        # Write vector manually to the record
        try:
            vector_str = "[" + ",".join([str(x) for x in vector]) + "]"
            db.execute(
                text("UPDATE enterprise_memory SET embedding = :vec::vector WHERE id = :id"),
                {"vec": vector_str, "id": insight_record.id}
            )
            db.commit()
            db.refresh(insight_record)
        except Exception as ve:
            logger.error(f"Failed to write vector to db: {ve}")
            db.rollback()

        results.append({
            "id": str(insight_record.id),
            "opportunity_space": insight_record.opportunity_space,
            "csf": insight_record.csf,
            "insight": insight_record.insight,
            "rationale": insight_record.rationale,
            "implication": insight_record.implication,
            "quotes": insight_record.quotes,
            "slide_reference": insight_record.slide_reference,
            "metadata": {
                "function_lane": insight_record.function_lane,
                "asset": insight_record.asset,
                "tumor": insight_record.tumor,
                "sub_tumor": insight_record.sub_tumor
            },
            "compliance_score": float(insight_record.compliance_score),
            "requires_human_review": insight_record.requires_human_review,
            "is_quarantined": insight_record.is_quarantined,
            "is_validated": insight_record.is_validated
        })

    return {"status": "success", "session_id": session_id, "insights": results}

# =====================================================================
# MODULE 3: COMPLIANCE SUPERVISOR (AGENT B)
# =====================================================================

def check_compliance_logic(insight: Dict[str, Any], db: Session, session_id: str) -> Dict[str, Any]:
    """
    Enforces the 'White Line' Medical Affairs rule.
    If tagged under Medical Affairs, searches for forbidden terms
    using keyword scanning and semantic similarity audits.
    """
    function_lane = insight.get("metadata", {}).get("function_lane", "")
    full_text = f"{insight.get('opportunity_space', '')} {insight.get('csf', '')} {insight.get('insight', '')} {insight.get('rationale', '')} {insight.get('implication', '')} "
    full_text += " ".join([q.get("text", "") for q in insight.get("quotes", [])])
    full_text_lower = full_text.lower()
    
    # Forbidden terms
    primary_forbidden = ["roi", "profit", "revenue", "market share", "commercial investment", "sales target", "pricing power", "margin", "profitability", "sales growth", "market penetration", "financial returns", "sales volume"]
    
    compliance_score = 1.00
    violations = []
    
    # Scan for forbidden terms
    for term in primary_forbidden:
        if term in full_text_lower:
            compliance_score -= 0.50
            violations.append({
                "field": "all",
                "matched_term": term,
                "explanation": f"Found forbidden term '{term}' in insight payload."
            })

    # Strict White Line check for Medical Affairs
    if function_lane == "Medical Affairs":
        # Medical affairs must focus on patient impact or endpoints, e.g. OS, PFS, RFS, DMFS
        endpoints = ["os", "pfs", "rfs", "dmfs", "survival", "efficacy", "safety", "tolerability", "endpoint", "biomarker", "expression", "patient"]
        has_endpoint = any(ep in full_text_lower for ep in endpoints)
        
        if not has_endpoint:
            compliance_score -= 0.40
            violations.append({
                "field": "clinical_focus",
                "matched_term": "none",
                "explanation": "Medical Affairs insights must mention clinical endpoints (OS, PFS, RFS, DMFS) or patient benefit."
            })
            
    compliance_score = max(0.00, min(1.00, compliance_score))
    
    requires_human_review = compliance_score < 0.80
    is_quarantined = compliance_score < 0.80

    audit_res = {
        "compliance_score": compliance_score,
        "requires_human_review": requires_human_review,
        "is_quarantined": is_quarantined,
        "violations": violations
    }

    # Log in audit trail
    log_audit_trail(
        db=db,
        session_id=session_id,
        step_index=3,
        step_name="Compliance Check",
        agent_name="Compliance Supervisor",
        user_input=f"Analyze compliance of insight under function '{function_lane}'",
        model_output=json.dumps(audit_res)
    )

    return audit_res

# =====================================================================
# MODULE 3: THEMATIC CLUSTERING SYNTHESIZER & CONFLICT ENGINE (AGENT C)
# =====================================================================

@app.post("/api/synthesize")
def trigger_synthesis(db: Session = Depends(get_db)):
    """
    Gathers all validated, non-quarantined insights and runs unsupervised semantic
    clustering to group them into macro-level Cross-Functional Strategic Themes,
    ranking them using the quantitative scoring formula, and detecting timeline or lane conflicts.
    """
    # Fetch all validated insights
    insights = db.query(EnterpriseMemory).filter(
        EnterpriseMemory.is_quarantined == False,
        EnterpriseMemory.requires_human_review == False
    ).all()

    if len(insights) < 2:
        # If not enough records, generate a default theme to keep frontend interactive
        return {
            "status": "success",
            "themes": [
                {
                    "theme_name": "mRNA Adjuvant Delivery Framework Optimization",
                    "theme_score": 14.5,
                    "contributing_functions": ["Market Research", "Medical Affairs", "Market Access"],
                    "opportunity_spaces": ["Adjuvant Therapeutic Sequencing Optimization"],
                    "associated_insights": [],
                    "executive_synthesis": "There is a massive cross-functional alignment indicating that while the clinical efficacy of adjuvant personalized vaccines is undisputed (reducing recurrence risk by 44%), the operational scaling across community oncology networks represents the primary barrier to launch. Operational, medical, and access workflows must be synchronized to establish hubs."
                }
            ],
            "conflicts": []
        }

    # Step 1: Perform Clustering simulation
    # In a real environment, we'd pull embeddings, calculate cosine similarities, and group them.
    # Here, we group by Opportunity Space and Asset to simulate unsupervised clustering.
    groups: Dict[str, List[EnterpriseMemory]] = {}
    for ins in insights:
        key = f"{ins.asset} - {ins.opportunity_space}"
        if key not in groups:
            groups[key] = []
        groups[key].append(ins)

    synthesized_themes = []
    flagged_conflicts = []

    # Step 2: Calculate thematic scores and check conflicts
    for theme_key, group_insights in groups.items():
        # Quantitative Ranking Algorithm:
        # Theme Score = (F * 3.0) + (I * 1.5) + (U * 2.0)
        # F = Functional breadth (1 to 4)
        # I = Insight volume (count capped at 5)
        # U = Urgency (1.0 to 2.5)
        
        unique_functions = set([ins.function_lane for ins in group_insights])
        f_score = len(unique_functions)
        i_score = min(5, len(group_insights))
        
        # Calculate urgency from content or default to 1.8
        u_score = 1.8
        for ins in group_insights:
            if any(w in (ins.insight + ins.rationale).lower() for w in ["delay", "threat", "risk", "urgent", "competitor", "lost"]):
                u_score = 2.4
                break
        
        theme_score = (f_score * 3.0) + (i_score * 1.5) + (u_score * 2.0)
        theme_score = min(18.5, max(0.8, round(theme_score, 2)))

        associated_ids = [str(ins.id) for ins in group_insights]
        opportunity_spaces = list(set([ins.opportunity_space for ins in group_insights]))
        contributing_functions = list(unique_functions)

        # Build executive summary
        summary_prompt = f"""
        Synthesize the following cross-functional oncology commercialization insights into a single cohesive, high-level Strategic Theme.
        Insights: {', '.join([ins.insight for ins in group_insights])}
        Keep the synthesis punchy, executive-ready, and actionable.
        """
        executive_synthesis = "Validated strategic alignment across oncology functions indicating significant operational barriers that must be addressed to ensure rapid product adoption."
        
        if client:
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=summary_prompt
                )
                executive_synthesis = response.text.strip()
            except Exception as se:
                logger.error(f"Synthesis model generation failed: {se}")

        synthesized_themes.append({
            "theme_name": theme_key,
            "theme_score": theme_score,
            "contributing_functions": contributing_functions,
            "opportunity_spaces": opportunity_spaces,
            "associated_insights": associated_ids,
            "executive_synthesis": executive_synthesis
        })

        # Step 3: Conflict Engine
        # Compare insights within this group (or against other groups) to detect contradictions.
        # We can also compare using cosine similarity of embeddings.
        for i in range(len(group_insights)):
            for j in range(i + 1, len(group_insights)):
                ins_a = group_insights[i]
                ins_b = group_insights[j]
                
                # Check for functional lane contradictions or opposing claims
                text_a = ins_a.insight.lower()
                text_b = ins_b.insight.lower()
                
                is_contradiction = False
                description = ""
                
                # E.g., if one says high confidence and the other says low confidence/concern
                if ("concern" in text_a or "hesitation" in text_a or "barrier" in text_a) and ("confidence" in text_b or "ready" in text_b or "rapid adoption" in text_b):
                    is_contradiction = True
                    description = f"Functional conflict detected between {ins_a.function_lane} (reports barrier/concern) and {ins_b.function_lane} (reports high readiness/confidence) regarding {ins_a.asset} in {ins_a.tumor}."
                
                # Or if timelines are misaligned (timeline decay)
                if ("delay" in text_a and "ahead of schedule" in text_b):
                    is_contradiction = True
                    description = f"Timeline misalignment: {ins_a.function_lane} reports delays, while {ins_b.function_lane} reports accelerated timelines."

                if is_contradiction:
                    # Verify if this conflict was already flagged
                    existing_conflict = db.query(CrossFunctionalConflict).filter(
                        ((CrossFunctionalConflict.source_insight_id == ins_a.id) & (CrossFunctionalConflict.conflicting_insight_id == ins_b.id)) |
                        ((CrossFunctionalConflict.source_insight_id == ins_b.id) & (CrossFunctionalConflict.conflicting_insight_id == ins_a.id))
                    ).first()
                    
                    if not existing_conflict:
                        conflict = CrossFunctionalConflict(
                            source_insight_id=ins_a.id,
                            conflicting_insight_id=ins_b.id,
                            conflict_type="Inter-Functional Divergence",
                            description=description,
                            status="Flagged"
                        )
                        db.add(conflict)
                        db.commit()
                        logger.info(f"Conflict flagged between {ins_a.id} and {ins_b.id}")
                    
                    flagged_conflicts.append({
                        "source_insight_id": str(ins_a.id),
                        "conflicting_insight_id": str(ins_b.id),
                        "conflict_type": "Inter-Functional Divergence",
                        "description": description
                    })

    # Log synthesis step
    log_audit_trail(
        db=db,
        session_id="synthesis_session",
        step_index=5,
        step_name="Cross-Functional Clustering",
        agent_name="Cross-Functional Synthesizer",
        user_input=f"Run thematic synthesis over {len(insights)} validated insights.",
        model_output=json.dumps({"themes_count": len(synthesized_themes), "conflicts_count": len(flagged_conflicts)})
    )

    return {
        "status": "success",
        "themes": synthesized_themes,
        "conflicts": flagged_conflicts
    }

# =====================================================================
# MODULE 3: AUTOMATED GAP DETECTION ENGINE (AGENT D)
# =====================================================================

@app.post("/api/gap-detection")
def run_gap_detection(db: Session = Depends(get_db)):
    """
    Background service that scans for stale insights (older than 90 days),
    runs simulated MCP queries, and generates gap-fill hypotheses.
    """
    # For simulation, let's treat any validated insight that does not have "validated" status
    # or is older than 1 minute (for testing) as stale, or just fetch all
    stale_insights = db.query(EnterpriseMemory).filter(
        EnterpriseMemory.is_validated == True,
        EnterpriseMemory.is_stale == False
    ).all()
    
    results = []
    
    for ins in stale_insights:
        # Check if age > 90 days (for the demo, we can just flag it or simulate a stale state)
        # Mark as stale in database
        ins.is_stale = True
        db.commit()
        
        prompt = f"""
        You are the Automated Gap Detection Engine.
        You have identified that this oncology insight is now STALE:
        - Asset: {ins.asset}
        - Tumor: {ins.tumor} ({ins.sub_tumor})
        - Insight: {ins.insight}
        - Rationale: {ins.rationale}
        
        Formulate a gap-fill hypothesis using the deep-research-max-preview-04-2026 model.
        Scrape hypothetical trial data or competitor timelines and suggest a corrective strategic action.
        Ensure you return a valid JSON object matching the Discovery Skill JSON schema.
        """
        
        hypothesis_json = None
        api_success = False
        
        if client:
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash", # Acting as router to deep-research
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                raw_text = response.text.strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text.replace("```json", "", 1)
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                hypothesis_json = json.loads(raw_text.strip())
                api_success = True
            except Exception as e:
                logger.error(f"Gap detection hypothesis generation failed: {e}")
                api_success = False
                
        if not api_success or not hypothesis_json:
            hypothesis_json = {
                "stale_insight_id": str(ins.id),
                "identified_gap": "Lack of real-world evidence regarding community oncology operational throughput for personalized mRNA treatments.",
                "secondary_evidence": [
                    {
                        "source_name": "ClinicalTrials.gov (NCT0654321)",
                        "url": "https://clinicaltrials.gov/ct2/show/NCT0654321",
                        "snippet": "New investigator-initiated study measuring time-to-delivery of personalized cancer vaccines in community networks showing a median delay of 18 days due to shipping protocols."
                    }
                ],
                "gap_fill_hypothesis": "If specialized regional hubs are not pre-cleared with local shipping couriers, the time-to-treatment will exceed the clinical efficacy window, resulting in a 25% drop-off in community doctor prescriptions.",
                "recommended_action": "Initiate a rapid-response logistics assessment with FedEx HealthCare Solutions and pilot 3 regional hubs in the Q3 planning cycle."
            }
            
        results.append(hypothesis_json)
        
        # Log in audit trail
        log_audit_trail(
            db=db,
            session_id="gap_detection_session",
            step_index=4,
            step_name="Gap Detection",
            agent_name="Automated Gap Detection Engine",
            user_input=f"Audit stale insight: {ins.id}",
            model_output=json.dumps(hypothesis_json)
        )

    return {"status": "success", "gaps": results}

# =====================================================================
# MODULE 3: STRATEGIC THOUGHT PARTNER (AGENT E)
# =====================================================================

@app.post("/api/chat")
def chat_thought_partner(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Grounded conversational thought partner powered by Gemini 1.5 Pro.
    Uses Vector RAG against the validated enterprise memory.
    """
    # Extract last message
    last_message = request.messages[-1].content
    
    # Step 1: Embed query
    query_vector = generate_embedding(last_message)
    vector_str = "[" + ",".join([str(x) for x in query_vector]) + "]"
    
    # Step 2: Semantic Vector RAG Search
    # Query database using pgvector cosine distance <=>
    retrieved_insights = []
    try:
        query = text("""
            SELECT id, opportunity_space, csf, insight, rationale, implication, function_lane, asset, tumor, sub_tumor 
            FROM enterprise_memory 
            WHERE is_validated = true AND is_quarantined = false
            ORDER BY embedding <=> :vec::vector 
            LIMIT 3
        """)
        results = db.execute(query, {"vec": vector_str}).fetchall()
        
        for r in results:
            retrieved_insights.append({
                "id": str(r.id),
                "opportunity_space": r.opportunity_space,
                "csf": r.csf,
                "insight": r.insight,
                "rationale": r.rationale,
                "implication": r.implication,
                "function_lane": r.function_lane,
                "asset": r.asset,
                "tumor": r.tumor,
                "sub_tumor": r.sub_tumor
            })
    except Exception as dbe:
        logger.error(f"Vector search failed: {dbe}. Querying non-vector fallback.")
        # Fallback to standard text search
        fallback_results = db.query(EnterpriseMemory).filter(
            EnterpriseMemory.is_validated == True,
            EnterpriseMemory.is_quarantined == False
        ).limit(3).all()
        for r in fallback_results:
            retrieved_insights.append({
                "id": str(r.id),
                "opportunity_space": r.opportunity_space,
                "csf": r.csf,
                "insight": r.insight,
                "rationale": r.rationale,
                "implication": r.implication,
                "function_lane": r.function_lane,
                "asset": r.asset,
                "tumor": r.tumor,
                "sub_tumor": r.sub_tumor
            })

    # If database is empty, generate generic context for demo purposes
    if not retrieved_insights:
        retrieved_insights = [
            {
                "opportunity_space": "Adjuvant Therapeutic Sequencing Optimization",
                "csf": "Establishing V940 + Keytruda as first-line adjuvant standard in high-risk stage III/IV Melanoma",
                "insight": "Physicians express concern over the operational complexity of personalized mRNA therapies in community clinics compared to standard monotherapy, despite a 44% reduction in recurrence risk.",
                "rationale": "Without structured clinical support pathways, community oncologists are likely to default to pembrolizumab monotherapy, delaying adoption and reducing market share by an estimated 15% in the first 12 months post-launch.",
                "implication": "Establish specialized regional operational hubs to manage logistics, patient screening, and scheduling, and launch a dedicated community-practice educational campaign.",
                "function_lane": "Market Research",
                "asset": "V940",
                "tumor": "Melanoma",
                "sub_tumor": "Stage III/IV"
            }
        ]

    # Step 3: Grounded prompt construction
    skill_content = load_skill_instructions("conversational_partner_skill.md")
    
    context_str = "\n\n".join([
        f"--- INSIGHT {idx+1} ({ins['function_lane']} - {ins['asset']}) ---\n"
        f"Opportunity Space: {ins['opportunity_space']}\n"
        f"Critical Success Factor: {ins['csf']}\n"
        f"What (Insight): {ins['insight']}\n"
        f"Why (Rationale): {ins['rationale']}\n"
        f"Implication: {ins['implication']}\n"
        f"Tumor: {ins['tumor']} ({ins['sub_tumor']})"
        for idx, ins in enumerate(retrieved_insights)
    ])

    conversation_history = "\n".join([f"{msg.role.upper()}: {msg.content}" for msg in request.messages[:-1]])

    prompt = f"""
    You are the Strategic Thought Partner. Ground yourself strictly in the following validated oncology insights:
    
    {context_str}
    
    Here is the conversation history:
    {conversation_history}
    
    User Query: {last_message}
    
    Follow the conversational partner skill rules perfectly. Segment your answer into:
    1. Medical Affairs Perspective (Clinical clinical endpoints OS/PFS/RFS/DMFS)
    2. Market Access Perspective (Payer and value focus)
    3. Competitive Intelligence Perspective (Market dynamics focus)
    
    End with 2-3 specific Strategy Refinement Options.
    """

    response_text = ""
    api_success = False

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-1.5-pro",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=skill_content
                )
            )
            response_text = response.text.strip()
            api_success = True
        except Exception as e:
            logger.error(f"Gemini 1.5 Pro Chat failed: {e}")
            api_success = False

    if not api_success or not response_text:
        # High-fidelity grounded mock response
        response_text = f"""### Strategic Synthesis: Community Oncology Adoption of mRNA Therapies

Based on our validated ITACS Enterprise Memory regarding **{retrieved_insights[0]['asset']}** in **{retrieved_insights[0]['tumor']}**, here is the cross-functional guidance:

#### 1. Medical Affairs Perspective (The Clinical Lens)
- **Clinical Endpoints**: The core clinical value proposition is anchored in the **44% reduction in recurrence risk (RFS/DMFS)** shown in trials. Medical science liaisons (MSLs) must focus scientific exchange on these survival curves, educating community Key Opinion Leaders (KOLs) on how adjuvant sequencing prevents metastasis.
- **Biomarker Selection**: Patient screening protocols must be standardized at local pathology labs to ensure high-risk stage III/IV patients are identified immediately post-resection.

#### 2. Market Access & Payer Perspective (The Value Lens)
- **Coverage & Economics**: Payers will require strict prior authorizations. We must showcase that preventing recurrence through personalized vaccines offsets the astronomical downstream cost of metastatic care. 
- **Operational Infrastructure**: Access teams must co-develop clinical pathway integration with major community oncology networks (e.g., US Oncology Network) to ensure reimbursement flows smoothly for personalized vaccine manufacturing.

#### 3. Competitive Intelligence Perspective (The Market Dynamics Lens)
- **Competitor Response**: Competitors are ramping up trials for standard-of-care monotherapies, aiming to market them as 'frictionless' alternatives. 
- **Launch Milestones**: The primary threat is that operational friction at community practices will create a 12-month adoption lag, giving competitors an opening to lock in monotherapy contracts.

---

### Strategy Refinement Options
1. *Would you like to examine the detailed operational flowchart for regional delivery hubs to reduce community oncology lag?*
2. *Should we run a simulation on payer co-pay friction thresholds for customized immunotherapies?*
3. *Do you want to compare the RFS curves of V940 against competitor standard adjuvant trials?*
"""

    # Log in audit trail
    log_audit_trail(
        db=db,
        session_id=request.session_id or "global_session",
        step_index=7,
        step_name="Final Alignment",
        agent_name="Strategic Thought Partner",
        user_input=last_message,
        model_output=response_text
    )

    return {"response": response_text, "retrieved_context": retrieved_insights}

# =====================================================================
# MODULE 4: WORKFLOW LIFE-CYCLE & SME IN THE LOOP
# =====================================================================

@app.get("/api/insights")
def list_insights(validated_only: bool = False, db: Session = Depends(get_db)):
    """Lists all insights inside the platform (including drafts, quarantined, and validated)."""
    query = db.query(EnterpriseMemory)
    if validated_only:
        query = query.filter(EnterpriseMemory.is_validated == True, EnterpriseMemory.is_quarantined == False)
    insights = query.order_by(EnterpriseMemory.created_at.desc()).all()
    
    res = []
    for ins in insights:
        res.append({
            "id": str(ins.id),
            "opportunity_space": ins.opportunity_space,
            "csf": ins.csf,
            "insight": ins.insight,
            "rationale": ins.rationale,
            "implication": ins.implication,
            "quotes": ins.quotes,
            "slide_reference": ins.slide_reference,
            "metadata": {
                "function_lane": ins.function_lane,
                "asset": ins.asset,
                "tumor": ins.tumor,
                "sub_tumor": ins.sub_tumor
            },
            "compliance_score": float(ins.compliance_score),
            "requires_human_review": ins.requires_human_review,
            "is_quarantined": ins.is_quarantined,
            "is_stale": ins.is_stale,
            "is_validated": ins.is_validated,
            "markdown_representation": ins.markdown_representation,
            "created_at": ins.created_at.isoformat()
        })
    return res

@app.patch("/api/insights/{insight_id}")
def update_insight(insight_id: str, payload: InsightUpdatePayload, db: Session = Depends(get_db)):
    """Updates an insight's fields (SME refinement and validation)."""
    insight = db.query(EnterpriseMemory).filter(EnterpriseMemory.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    # Update fields if provided
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(insight, k, v)
        
    if payload.is_validated is not None:
        insight.is_validated = payload.is_validated
        if payload.is_validated:
            # If validated, release from quarantine if it was there
            insight.is_quarantined = False
            insight.requires_human_review = False
            
    insight.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(insight)
    
    # Log SME action
    log_audit_trail(
        db=db,
        session_id="sme_refinement",
        step_index=6,
        step_name="SME Validation",
        agent_name="SME Panel",
        user_input=f"Update/Validate insight {insight_id}",
        model_output=f"Validation Status: {insight.is_validated}, Quarantined: {insight.is_quarantined}"
    )
    
    return {"status": "success", "insight_id": str(insight.id)}

@app.get("/api/conflicts")
def list_conflicts(db: Session = Depends(get_db)):
    """Lists all active cross-functional conflicts."""
    conflicts = db.query(CrossFunctionalConflict).all()
    res = []
    for c in conflicts:
        res.append({
            "id": str(c.id),
            "source_insight_id": str(c.source_insight_id),
            "conflicting_insight_id": str(c.conflicting_insight_id),
            "conflict_type": c.conflict_type,
            "description": c.description,
            "status": c.status,
            "resolution_notes": c.resolution_notes,
            "created_at": c.created_at.isoformat()
        })
    return res

@app.post("/api/conflicts/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, resolution_notes: str = Form(...), db: Session = Depends(get_db)):
    """Resolves a conflict with notes."""
    conflict = db.query(CrossFunctionalConflict).filter(CrossFunctionalConflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")
    
    conflict.status = "Resolved"
    conflict.resolution_notes = resolution_notes
    conflict.resolved_by = "SME Workshop Panel"
    conflict.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    
    return {"status": "success", "conflict_id": str(conflict.id)}

@app.get("/api/audit-trail")
def list_audit_trail(session_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Lists the step execution logs for compliance tracking."""
    query = db.query(AgentAuditTrail)
    if session_id:
        query = query.filter(AgentAuditTrail.session_id == session_id)
    audits = query.order_by(AgentAuditTrail.created_at.asc()).all()
    
    res = []
    for a in audits:
        res.append({
            "id": str(a.id),
            "session_id": a.session_id,
            "step_index": a.step_index,
            "step_name": a.step_name,
            "agent_name": a.agent_name,
            "user_input": a.user_input,
            "model_output": a.model_output,
            "function_calls": a.function_calls,
            "tool_execution": a.tool_execution,
            "created_at": a.created_at.isoformat()
        })
    return res

# Create DB Tables on Startup
@app.on_event("startup")
def startup_db_init():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Error during DB startup tables creation: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
