import chromadb

# Connect to ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# List collections
collections = chroma_client.list_collections()
if collections:
    print("\n🔹 Available Collections in ChromaDB:")
    for collection in collections:
        print(f"  - {collection.name}")
else:
    print("\n⚠️ No collections found in ChromaDB. Your data may not be stored properly.")
