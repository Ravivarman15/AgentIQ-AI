-- ═══════════════════════════════════════════════════════════════════════════════
-- AGENTIQ AI — Supabase Migration Script
-- Run this in Supabase SQL Editor BEFORE starting the backend server.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Core Application Tables (previously SQLite)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    file_path VARCHAR(512),
    sample_path VARCHAR(512),
    industry VARCHAR(100),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    is_demo BOOLEAN DEFAULT FALSE
);

-- Index for fast user dataset lookups
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. RAG Embeddings Table (replaces ChromaDB)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rag_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    dataset_id TEXT NOT NULL,
    chunk_id TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding VECTOR(384),          -- sentence-transformers/all-MiniLM-L6-v2 = 384 dims
    cache_key TEXT,                  -- for embedding dedup/cache
    created_at TIMESTAMP DEFAULT NOW()
);

-- IVFFlat index for fast cosine similarity search
-- NOTE: This index requires at least ~100 rows to be effective.
-- For small datasets it will still work, just without index acceleration.
CREATE INDEX IF NOT EXISTS idx_rag_embeddings_cosine
ON rag_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Composite index for multi-tenant data isolation
CREATE INDEX IF NOT EXISTS idx_rag_user_dataset
ON rag_embeddings (user_id, dataset_id);

-- Index for cache key lookups
CREATE INDEX IF NOT EXISTS idx_rag_cache_key
ON rag_embeddings (user_id, dataset_id, cache_key);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Vector Similarity Search Function (called via Supabase RPC)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION match_rag_embeddings(
    query_embedding VECTOR(384),
    match_user_id TEXT,
    match_dataset_id TEXT,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        re.id,
        re.content,
        re.metadata,
        1 - (re.embedding <=> query_embedding) AS similarity
    FROM rag_embeddings re
    WHERE re.user_id = match_user_id
      AND re.dataset_id = match_dataset_id
    ORDER BY re.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
