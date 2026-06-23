-- Enable the pgvector extension to support high-performance vector search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS cross_functional_conflicts CASCADE;
DROP TABLE IF EXISTS agent_audit_trail CASCADE;
DROP TABLE IF EXISTS enterprise_memory CASCADE;

-- 1. Table: enterprise_memory (Stores validated OKF state and raw drafts)
CREATE TABLE enterprise_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Merck ITACS Core Framework Data Hierarchy
    opportunity_space TEXT NOT NULL,
    csf TEXT NOT NULL,
    insight TEXT NOT NULL,
    rationale TEXT NOT NULL,
    implication TEXT NOT NULL,
    
    -- Grounding & Sources
    quotes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {text: string, reference: string}
    slide_reference VARCHAR(255),               -- e.g., "MR-2, slide 14"
    
    -- OKF v0.1 Multidimensional Metadata Tags
    function_lane VARCHAR(100) NOT NULL,        -- Market Research, Medical Affairs, Market Access, Competitive Intelligence
    asset VARCHAR(100) NOT NULL,                -- e.g., V940, MK-1084
    tumor VARCHAR(100) NOT NULL,                -- e.g., Lung, Melanoma
    sub_tumor VARCHAR(100) NOT NULL,            -- e.g., Non-Small Cell, Stage III/IV
    
    -- Workflow, Compliance & Review Status
    compliance_score NUMERIC(5, 2) DEFAULT 1.00,-- Probabilistic compliance score (0.00 to 1.00)
    requires_human_review BOOLEAN DEFAULT FALSE,
    is_quarantined BOOLEAN DEFAULT FALSE,
    is_stale BOOLEAN DEFAULT FALSE,
    is_validated BOOLEAN DEFAULT FALSE,        -- True if approved by SME Panel (Enterprise Memory state)
    
    -- Raw OKF Document representations
    markdown_representation TEXT NOT NULL,      -- Full OKF Markdown containing YAML + Content
    yaml_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Vector Embeddings for Semantic RAG Search (768 dimensions for gemini text embeddings)
    embedding vector(768),
    
    -- Audit & Timekeeping
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: agent_audit_trail (Compliance tracking for Gemini Interactions/ADK execution loops)
CREATE TABLE agent_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,           -- Identifies a specific document ingestion or synthesis session
    step_index INTEGER NOT NULL,                -- 1 to 7 representation of workflow stages
    step_name VARCHAR(100) NOT NULL,            -- e.g., "Upload", "Ingestion", "Compliance Check", etc.
    agent_name VARCHAR(100) NOT NULL,           -- e.g., "Functional Extraction Copilot", "Compliance Supervisor"
    user_input TEXT,
    model_output TEXT,
    function_calls JSONB DEFAULT '[]'::jsonb,   -- Exact tool/function calls made in step
    tool_execution JSONB DEFAULT '[]'::jsonb,   -- Results returned by tools
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: cross_functional_conflicts (Queue for flagging timeline and lane alignment conflicts)
CREATE TABLE cross_functional_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_insight_id UUID REFERENCES enterprise_memory(id) ON DELETE CASCADE,
    conflicting_insight_id UUID REFERENCES enterprise_memory(id) ON DELETE CASCADE,
    conflict_type VARCHAR(100) NOT NULL,        -- "Timeline Contradiction", "Inter-Functional Divergence", "Decay Discrepancy"
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Flagged',        -- 'Flagged', 'Resolved', 'Dismissed'
    resolution_notes TEXT,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for dimensional querying (OKF Dimensional Tags)
CREATE INDEX idx_em_function ON enterprise_memory(function_lane);
CREATE INDEX idx_em_asset ON enterprise_memory(asset);
CREATE INDEX idx_em_tumor ON enterprise_memory(tumor);
CREATE INDEX idx_em_sub_tumor ON enterprise_memory(sub_tumor);
CREATE INDEX idx_em_validation ON enterprise_memory(is_validated, is_quarantined);

-- Index for session audit searches
CREATE INDEX idx_audit_session ON agent_audit_trail(session_id);
CREATE INDEX idx_audit_step ON agent_audit_trail(step_index);

-- HNSW Vector Index for fast semantic similarity search (using cosine distance)
CREATE INDEX idx_em_embedding_cosine ON enterprise_memory USING hnsw (embedding vector_cosine_ops);
