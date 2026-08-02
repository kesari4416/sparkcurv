import chromadb

from sentence_transformers import SentenceTransformer

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="sparkcurv"
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def reterive_context(query: str, k: int = 5):

    query_embedding = model.encode(
        query
    ).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )

    docs = results["documents"][0]

    return "\n\n".join(docs)