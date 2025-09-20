import os
from typing import Any, List, Optional
from dotenv import load_dotenv
from flask import Flask, request, send_from_directory
from flask_cors import CORS

from src.helper import download_hugging_face_embeddings
from src.prompt import system_prompt
from langchain_pinecone import PineconeVectorStore
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.language_models.llms import LLM
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.outputs import LLMResult
from openai import OpenAI

# --- Load environment variables ---
load_dotenv()
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY") or ""
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY") or ""
os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["NVIDIA_API_KEY"] = NVIDIA_API_KEY

# --- Flask app ---
app = Flask(__name__, static_folder="dist", static_url_path="")
CORS(app)

# --- Embeddings ---
embeddings = download_hugging_face_embeddings()

# --- Pinecone VectorStore ---
index_name = "medical-bot"
docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

# --- NVIDIA Client ---
nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY"),
)

class NvidiaLLM(LLM):
    model: str = "openai/gpt-oss-20b"
    temperature: float = 0.4
    max_tokens: int = 500

    @property
    def _llm_type(self) -> str:
        return "nvidia-llm"

    def _call(self, prompt: str, stop: Optional[List[str]] = None, **kwargs: Any) -> str:
        if isinstance(prompt, dict):
            prompt = str(prompt)
        completion = nvidia_client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return completion.choices[0].message.content

    def _generate(self, prompts: List[str], stop: Optional[List[str]] = None, **kwargs: Any):
        responses = [self._call(p, stop=stop, **kwargs) for p in prompts]
        return LLMResult(generations=[[{"text": r}] for r in responses])

# --- Initialize chain ---
chatModel = NvidiaLLM()
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])
question_answer_chain = create_stuff_documents_chain(chatModel, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

# --- Flask routes ---

# Serve React frontend
@app.route("/")
def serve_react():
    return send_from_directory(app.static_folder, "index.html")

# Chat endpoint
@app.route("/get", methods=["POST"])
def chat():
    msg = request.form["msg"]
    print("User:", msg)
    response = rag_chain.invoke({"input": msg})
    print("Response:", response["answer"])
    return str(response["answer"])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
