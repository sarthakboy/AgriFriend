from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Load embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
)

# Load existing ChromaDB
vectordb = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embedding_model,
)

# Test search
query = "What are Sarthak's skills?"
results = vectordb.similarity_search(query, k=2)

print(f"\n🔍 Query: {query}")
print(f"\n📄 Results found: {len(results)}")
for i, doc in enumerate(results):
    print(f"\n--- Result {i+1} ---")
    print(doc.page_content)