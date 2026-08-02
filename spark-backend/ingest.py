import uuid
import chromadb

from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="sparkcurv"
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)


def add_document(text: str, source: str):

    chunks = splitter.split_text(text)

    for chunk in chunks:

        embedding = model.encode(chunk).tolist()

        collection.add(
            ids=[str(uuid.uuid4())],
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[
                {
                    "source": source
                }
            ]
        )

    print(
        f"Added {len(chunks)} chunks from {source}"
    )