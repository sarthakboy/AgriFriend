"""
knowledge_base.py
Run this ONCE to populate ChromaDB with Sarthak's data.
Command: python knowledge_base.py
"""

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# ── Your Personal Data ─────────────────────────────────────────
DOCUMENTS = [

    # Personal Info
    """
    Name: Sarthak Pandey
    Phone: 9582563715
    Email: pandeysarthak06@gmail.com
    LeetCode: https://leetcode.com/u/Sarataku/
    """,

    # Education
    """
    Sarthak Pandey completed his B.Tech specialised in Electronics 
    and Communication Engineering (ECE) from NIET Greater Noida. 
    He graduated with a CGPA of 7.7 and received an Honours degree.
    """,

    # Skills
    """
    Sarthak Pandey's technical skills include:
    - Data Structures and Algorithms using Python
    - Backend Development with Python frameworks: FastAPI and Django
    - Frontend Development: React.js, HTML, CSS, JavaScript
    - Databases: PostgreSQL, MySQL, SQL
    - AI/ML: Vector Databases, LLM Integration, RAG Pipeline, Prompt Engineering
    - Tools: Git, GitHub, Docker, REST APIs
    """,

    # Project 1 — AgriFriend
    """
    Sarthak Pandey built AgriFriend — an AI-Powered Farming Assistant.
    AgriFriend is a full-stack web application for Indian farmers that provides:
    - Interactive India map with clickable states
    - Live weather data using OpenWeatherMap API
    - Live soil health data using Open-Meteo API
    - AI crop recommendations using Groq API (Llama 3.3 70B)
    - RAG-lite architecture injecting live data into LLM prompts
    - Prompt engineering with role definition, data injection and conversation history
    - Floating AI chat interface with regional context
    Tech stack: FastAPI, React 19, Vite, React Leaflet, Groq API, Vercel, Render
    """,

    # Project 2 — Talk Me App
    """
    Sarthak Pandey built Talk Me App — a communication application.
    Talk Me is a project built by Sarthak Pandey.
    """,

    # AI/ML Knowledge
    """
    Sarthak Pandey has knowledge in modern AI/ML concepts including:
    - RAG Pipeline (Retrieval Augmented Generation)
    - Vector Databases using ChromaDB
    - LLM Integration using Groq API
    - Prompt Engineering techniques
    - LangChain framework for AI orchestration
    - Embeddings and similarity search
    """,

]

def create_knowledge_base():
    print("🔄 Creating knowledge base...")

    # Step 1 — Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    chunks = text_splitter.create_documents(DOCUMENTS)
    print(f"✅ Created {len(chunks)} chunks")

    # Step 2 — Load embedding model
    print("🔄 Loading embedding model...")
    embedding_model = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},  # runs on CPU — no GPU needed
    )
    print("✅ Embedding model loaded")

    # Step 3 — Store in ChromaDB
    print("🔄 Storing in ChromaDB...")
    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory="./chroma_db",  # saved as folder in backend
    )
    print(f"✅ Stored {len(chunks)} chunks in ChromaDB")
    print("🎉 Knowledge base created successfully!")
    print("📁 Saved to: ./chroma_db folder")

if __name__ == "__main__":
    create_knowledge_base()
