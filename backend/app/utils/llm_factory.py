import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint, HuggingFaceEmbeddings, ChatHuggingFace

load_dotenv()

def get_llm():
    """
    Returns a HuggingFace ChatLLM instance.
    Requires HUGGINGFACEHUB_API_TOKEN in .env
    """
    load_dotenv(override=True)
    repo_id = os.getenv("HF_MODEL_REPO", "meta-llama/Meta-Llama-3-8B-Instruct")
    
    llm = HuggingFaceEndpoint(
        repo_id=repo_id,
        huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
        temperature=0.1,
        max_new_tokens=1024,
    )
    
    # Wrap in ChatHuggingFace for better 'conversational' task compatibility
    return ChatHuggingFace(llm=llm)

def get_embeddings():
    """
    Returns HuggingFace embeddings.
    """
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
