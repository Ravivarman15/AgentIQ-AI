"""
AGENTIQ AI - RAG Service (ChromaDB)
====================================
Handles vector storage, retrieval, and LLM-based questioning.
Uses ChromaDB for fast local vector search.
"""

import os
import uuid
import hashlib
import logging
from typing import Dict, Any, List, Generator

from app.state import AgentState
from app.utils.llm_factory import get_embeddings
from app.config.settings import CHROMA_DB_DIR
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

import chromadb

# Logging setup
logger = logging.getLogger("agentiq.rag_service")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s [RAG_SERVICE] %(message)s", datefmt="%H:%M:%S"))
    logger.addHandler(handler)


class RAGPipelineService:
    """
    Standardized RAG Service for AGENTIQ AI (ChromaDB).
    Fast local vector search with persistent storage.
    """

    def __init__(self, llm):
        self.llm = llm
        self.embeddings = get_embeddings()

        # Initialize ChromaDB with persistent storage
        try:
            os.makedirs(CHROMA_DB_DIR, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
            logger.info(f"✅ ChromaDB initialized at {CHROMA_DB_DIR}")
        except Exception as e:
            logger.error(f"⚠️ ChromaDB init error: {e}")
            self.chroma_client = chromadb.Client()  # Fallback to in-memory
            logger.info("Using in-memory ChromaDB fallback")

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800, chunk_overlap=150, length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def run(self, state: AgentState) -> Dict[str, Any]:
        """Main RAG pipeline execution during processing"""
        print("--- RUNNING RAG SERVICE (CHROMADB PIPELINE) ---")
        try:
            dataset_name = state.get("dataset_name", "unknown")
            user_id = state.get("user_id", "default")

            # Convert to Documents & Split
            documents = self._create_documents_from_state(state)
            if not documents:
                return {"rag_status": "error", "rag_error": "No documents"}

            chunks = self.text_splitter.split_documents(documents)
            print(f"✅ Split into {len(chunks)} chunks")

            # Generate Embeddings & Store in ChromaDB
            dataset_id = self._get_dataset_id(user_id, dataset_name)
            success = self._store_in_vector_db(chunks, user_id, dataset_id)
            if not success:
                return {"rag_status": "error", "rag_error": "Store failed"}

            # Update state
            new_logs = state.get("logs", [])
            new_logs.append({"agent": "rag_service", "message": f"RAG pipeline complete: {len(chunks)} chunks indexed in ChromaDB."})
            completed = state.get("completed_steps", [])
            completed.append("rag")

            return {
                "vector_db_id": dataset_id,
                "rag_chunks_count": len(chunks),
                "rag_status": "ready",
                "logs": new_logs,
                "completed_steps": completed
            }
        except Exception as e:
            logger.error(f"❌ RAG Error: {e}")
            return {"rag_status": "failed", "rag_error": str(e)}

    def _create_documents_from_state(self, state: AgentState) -> List[Document]:
        documents = []
        col_descriptions = state.get("col_descriptions", [])
        if col_descriptions:
            documents.append(Document(page_content="COLUMNS:\n" + "\n".join(col_descriptions), metadata={"type": "columns"}))
        insights = state.get("eda_insights", [])
        if insights:
            documents.append(Document(page_content="INSIGHTS:\n" + "\n".join(insights), metadata={"type": "insights"}))
        return documents

    def _get_dataset_id(self, user_id: str, dataset_name: str) -> str:
        return f"user_{user_id}_ds_{hashlib.md5(dataset_name.encode()).hexdigest()[:8]}"

    def _get_collection(self, dataset_id: str):
        """Get or create a ChromaDB collection for a dataset."""
        # ChromaDB collection names must be 3-63 chars, alphanumeric + underscores
        safe_name = dataset_id.replace("-", "_")[:63]
        if len(safe_name) < 3:
            safe_name = f"ds_{safe_name}"
        return self.chroma_client.get_or_create_collection(
            name=safe_name,
            metadata={"hnsw:space": "cosine"}
        )

    def _store_in_vector_db(self, chunks: List[Document], user_id: str, dataset_id: str) -> bool:
        try:
            collection = self._get_collection(dataset_id)

            texts = [chunk.page_content for chunk in chunks]
            embeddings = self.embeddings.embed_documents(texts)
            ids = [f"{dataset_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{**{k: str(v) for k, v in chunk.metadata.items()}, "user_id": user_id} for chunk in chunks]

            # Upsert to handle re-runs cleanly
            collection.upsert(
                documents=texts,
                embeddings=embeddings,
                ids=ids,
                metadatas=metadatas,
            )
            logger.info(f"✅ Stored {len(chunks)} chunks in ChromaDB collection '{dataset_id}'")
            return True
        except Exception as e:
            logger.error(f"❌ ChromaDB storage error: {e}")
            return False

    def _retrieve_relevant_chunks(self, dataset_id: str, query_text: str, n_results: int = 5) -> List[str]:
        """Retrieve relevant text chunks from ChromaDB using similarity search."""
        try:
            collection = self._get_collection(dataset_id)
            query_embedding = self.embeddings.embed_query(query_text)

            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, collection.count() or 1),
            )

            if results and results["documents"]:
                return results["documents"][0]  # First (and only) query's results
            return []
        except Exception as e:
            logger.error(f"❌ ChromaDB query error: {e}")
            return []

    def query(self, state, query_text: str) -> str:
        """Answer a query using RAG: retrieve from ChromaDB + generate with LLM."""
        dataset_id = state.get("vector_db_id", "")

        if not dataset_id:
            user_id = state.get("user_id", "default")
            dataset_name = state.get("dataset_name", "unknown")
            dataset_id = self._get_dataset_id(user_id, dataset_name)

        # Retrieve relevant context from ChromaDB
        relevant_chunks = self._retrieve_relevant_chunks(dataset_id, query_text)

        if not relevant_chunks:
            # Fallback: use state insights directly
            insights = state.get("eda_insights", [])
            col_descriptions = state.get("col_descriptions", [])
            context = "\n".join(insights + col_descriptions)
        else:
            context = "\n\n".join(relevant_chunks)

        # Build prompt and call LLM
        prompt = (
            f"You are an AI data analyst for AGENTIQ AI. Based on the following dataset context, "
            f"answer the user's question accurately and concisely.\n\n"
            f"CONTEXT:\n{context}\n\n"
            f"USER QUESTION: {query_text}\n\n"
            f"ANSWER:"
        )

        try:
            response = self.llm.invoke(prompt)
            # Handle different response types
            if hasattr(response, 'content'):
                return response.content
            return str(response)
        except Exception as e:
            logger.error(f"❌ LLM query error: {e}")
            return f"I found relevant information about your dataset but encountered an error generating a response: {str(e)}"

    def query_stream(self, state, query_text: str) -> Generator[str, None, None]:
        """Stream answer tokens using RAG: retrieve from ChromaDB + stream with LLM."""
        dataset_id = state.get("vector_db_id", "")

        if not dataset_id:
            user_id = state.get("user_id", "default")
            dataset_name = state.get("dataset_name", "unknown")
            dataset_id = self._get_dataset_id(user_id, dataset_name)

        # Retrieve relevant context from ChromaDB
        relevant_chunks = self._retrieve_relevant_chunks(dataset_id, query_text)

        if not relevant_chunks:
            insights = state.get("eda_insights", [])
            col_descriptions = state.get("col_descriptions", [])
            context = "\n".join(insights + col_descriptions)
        else:
            context = "\n\n".join(relevant_chunks)

        prompt = (
            f"You are an AI data analyst for AGENTIQ AI. Based on the following dataset context, "
            f"answer the user's question accurately and concisely.\n\n"
            f"CONTEXT:\n{context}\n\n"
            f"USER QUESTION: {query_text}\n\n"
            f"ANSWER:"
        )

        try:
            for chunk in self.llm.stream(prompt):
                if hasattr(chunk, 'content'):
                    yield chunk.content
                else:
                    yield str(chunk)
        except Exception as e:
            logger.error(f"❌ LLM stream error: {e}")
            err = str(e)
            if "getaddrinfo failed" in err or "NameResolutionError" in err or "Max retries exceeded" in err:
                yield (
                    "⚠️ Can't reach the HuggingFace inference API. "
                    "Your machine failed to resolve `huggingface.co`. "
                    "Check your internet/DNS, or set `HF_ENDPOINT=https://hf-mirror.com` "
                    "in backend/.env and restart the server."
                )
            else:
                yield f"Error: {err}"


# Alias
RAGService = RAGPipelineService
