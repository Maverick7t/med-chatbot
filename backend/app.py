import os
import logging
from typing import Any, List, Optional
from dotenv import load_dotenv
from flask import Flask, request, send_from_directory, jsonify
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Load environment variables ---
load_dotenv()
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY") or ""
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY") or ""

if not PINECONE_API_KEY or not NVIDIA_API_KEY:
    logger.error("Missing required API keys!")
    exit(1)

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["NVIDIA_API_KEY"] = NVIDIA_API_KEY

# --- Flask app with enhanced CORS ---
app = Flask(__name__, static_folder="dist", static_url_path="")
CORS(app, origins=["https://maverick7t.github.io", "http://localhost:3000"], supports_credentials=True)

# --- Initialize components with error handling ---
try:
    # Embeddings
    embeddings = download_hugging_face_embeddings()
    logger.info("✅ Embeddings loaded successfully")

    # Pinecone VectorStore
    index_name = "medical-bot"
    docsearch = PineconeVectorStore.from_existing_index(
        index_name=index_name,
        embedding=embeddings
    )
    retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    logger.info("✅ Pinecone vector store connected")

    # NVIDIA Client
    nvidia_client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=NVIDIA_API_KEY,
    )
    logger.info("✅ NVIDIA client initialized")

except Exception as e:
    logger.error(f"❌ Initialization failed: {str(e)}")
    exit(1)

class NvidiaLLM(LLM):
    """Enhanced NVIDIA LLM with better error handling and logging"""
    model: str = "openai/gpt-oss-20b"  # Fixed to use 20B model
    temperature: float = 0.4
    max_tokens: int = 500

    @property
    def _llm_type(self) -> str:
        return "nvidia-llm"

    def _call(self, prompt: str, stop: Optional[List[str]] = None, **kwargs: Any) -> str:
        try:
            if isinstance(prompt, dict):
                prompt = str(prompt)
            
            completion = nvidia_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )
            
            # Fixed: Use attribute access instead of dictionary access
            response = completion.choices[0].message.content
            
            if not response:
                logger.warning("Empty response from NVIDIA API")
                return "I apologize, but I didn't receive a proper response. Please try again."
            
            logger.info(f"Generated response of {len(response)} characters")
            return response
            
        except AttributeError as e:
            logger.error(f"Response structure error: {str(e)}")
            return "I'm having trouble processing the response. Please try again."
        except Exception as e:
            logger.error(f"NVIDIA API error: {str(e)}")
            return "I apologize, but I'm experiencing technical difficulties. Please try again later."

    def _generate(self, prompts: List[str], stop: Optional[List[str]] = None, **kwargs: Any):
        responses = [self._call(p, stop=stop, **kwargs) for p in prompts]
        return LLMResult(generations=[[{"text": r}] for r in responses])

# --- Initialize RAG chain ---
try:
    chatModel = NvidiaLLM()
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    question_answer_chain = create_stuff_documents_chain(chatModel, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    logger.info("✅ RAG chain initialized successfully")
except Exception as e:
    logger.error(f"❌ RAG chain initialization failed: {str(e)}")
    exit(1)

# --- Enhanced Flask routes ---

@app.route("/")
def root():
    return jsonify({"status": "Backend running"})


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    try:
        # Test NVIDIA API
        test_response = nvidia_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=10
        )
        
        return jsonify({
            "status": "healthy",
            "nvidia_api": "connected",
            "pinecone": "connected",
            "model": "openai/gpt-oss-20b"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route("/get", methods=["POST"])
def chat():
    """Enhanced chat endpoint with better error handling"""
    try:
        # Get message from request
        if request.is_json:
            data = request.get_json()
            msg = data.get("msg", "").strip()
        else:
            msg = request.form.get("msg", "").strip()
        
        if not msg:
            return jsonify({"error": "Empty message"}), 400
        
        logger.info(f"🔍 User query: {msg[:100]}...")
        
        # Generate response using RAG chain
        response = rag_chain.invoke({"input": msg})
        answer = response["answer"]
        
        logger.info(f"✅ Generated response: {answer[:100]}...")
        
        # Return JSON response for better frontend handling
        if request.is_json:
            return jsonify({
                "response": answer,
                "sources": len(response.get("context", []))
            })
        else:
            # Maintain compatibility with existing frontend
            return str(answer)
            
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {str(e)}")
        error_msg = "I apologize, but I'm experiencing technical difficulties. Please try again later."
        
        if request.is_json:
            return jsonify({"error": error_msg}), 500
        else:
            return error_msg, 500

@app.route("/models", methods=["GET"])
def available_models():
    """Get information about available models"""
    return jsonify({
        "current_model": "openai/gpt-oss-20b",
        "description": "NVIDIA's free GPT model for medical queries",
        "max_tokens": 500,
        "temperature": 0.4
    })

@app.errorhandler(404)
def not_found(error):
    """Custom 404 handler"""
    logger.warning(f"404 error: {request.url}")
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(500)
def internal_error(error):
    """Custom 500 handler"""
    logger.error(f"500 error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    debug = os.environ.get("FLASK_ENV") == "development"
    
    logger.info(f"🚀 Starting MediSora backend on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    
    app.run(host="0.0.0.0", port=port, debug=debug)