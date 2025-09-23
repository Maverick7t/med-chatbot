## 📁 **Project Structure**

```
chatapp/
├── 📁 backend/                    # Flask API Server
│   ├── 📁 src/                   # Source modules
│   │   ├── helper.py             # Embedding utilities
│   │   ├── prompt.py             # AI prompt templates
│   │   └── __init__.py
│   ├── 📁 Data/                  # Medical PDF documents
│   │   └── *.pdf                 # Curated medical literature
│   ├── app.py                    # Main Flask application
│   ├── store_index.py            # Vector database setup
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables (local)
│   └── .gitignore               # Git ignore rules
├── 📁 frontend/                  # React Application
│   ├── 📁 src/
│   │   ├── App.jsx              # Main React component
│   │   ├── App.css              # Component styles
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── 📁 public/
│   │   ├── anime1.jpg           # UI assets
│   │   └── index.html           # HTML template
│   ├── package.json             # Node.js dependencies
│   └── vite.config.js           # Vite configuration
├── 📁 research/                  # Development notebooks
│   └── trials.ipynb             # Jupyter experiments
├── 📁 .github/workflows/         # CI/CD pipelines
├── LICENSE                       # MIT License
└── README.md                     # This file
```

# 🏥 MediSora - AI Medical Chatbot

> **An intelligent medical assistant that understands your health questions and provides evidence-based answers using cutting-edge AI technology.**

## 🎯 **What Problem Does This Solve?**

**Problem:** People need quick, reliable medical information but struggle with:
- ❌ Overwhelming Google search results
- ❌ Unreliable health websites  
- ❌ Long waits for doctor appointments for basic questions

**Solution:** MediSora provides instant, AI-powered medical guidance based on verified medical literature.

---

## ✨ **Key Features That Matter**

| Feature | Why It's Cool | Impact |
|---------|---------------|---------|
| 🤖 **Smart AI Responses** | Uses NVIDIA's advanced AI models | Get doctor-quality answers instantly |
| 📚 **Medical Knowledge Base** | Trained on real medical textbooks | Answers backed by actual science |
| 💬 **Natural Conversations** | Chat like you're texting a friend | No medical jargon confusion |
| ⚡ **Lightning Fast** | Responses in under 3 seconds | No waiting, just answers |
| 🛡️ **Always Safe** | Recommends seeing doctors when needed | Your health comes first |

---

## 🚀 **Live Demo - Try It Now!**

**Frontend:** [https://maverick7t.github.io/med-chatbot/](https://maverick7t.github.io/med-chatbot/)

**Try asking:**
- "What causes headaches?"
- "How to treat a cold?"
- "What is diabetes?"

---

## 🛠️ **Technical Excellence**

### **Why This Tech Stack Rocks:**

**🎨 Frontend (React + Vite)**
- **React 18** - Industry standard for modern UIs
- **Vite** - 10x faster than traditional build tools
- **Custom CSS** - Smooth animations, professional design

**⚡ Backend (Flask + AI)**
- **Flask** - Python's most trusted web framework
- **RAG Architecture** - Combines search + AI generation
- **Vector Database** - Semantic search technology

**🧠 AI & Machine Learning**
- **NVIDIA AI** - Enterprise-grade language models
- **HuggingFace** - Industry-standard embeddings
- **Pinecone** - Vector database for lightning-fast search

**☁️ Production Deployment**
- **GitHub Pages** - Frontend hosting
- **Render.com** - Backend API hosting
- **Azure** - Backend API hosting
- **Auto-deployment** - Push code → Live instantly


## Azure Deployment (Backend)

1. **Create Web App**  
   - Go to [portal.azure.com](https://portal.azure.com) → App Services → Create → Web App  
   - Subscription: Student subscription  
   - Resource Group: e.g., `medbot-rg`  
   - Name: e.g., `med-chatbot-12345` (must be unique)  
   - Publish: Code  
   - Runtime: Python 3.11  
   - Region: Match Pinecone region (e.g., East US)  
   - Pricing: B1 (covered by credits)  
   - Click **Review + Create → Create**

2. **Configure Startup Command**  
   - Go to App Service → Configuration → General Settings → Startup Command:  
     ```
     gunicorn --bind=0.0.0.0:$PORT app:app
     ```  
   - Save

3. **Set Environment Variables**  
   - Go to Configuration → Application Settings → add:  
     ```
     PINECONE_API_KEY=<your key>
     NVIDIA_API_KEY=<your key>
     HF_API_TOKEN=<your key>
     USE_HF_API=true
     FLASK_ENV=production
     ```  
   - Save → app restarts

4. **Deploy Code from GitHub**  
   - App Service → Deployment Center → GitHub → sign in  
   - Select repo & branch → Python App Service build (Oryx)  
   - Auto-deploys on push to main

5. **Verify**  
   - Check Logs → Log Stream  
   - Health check: `https://YOUR_APP_NAME.azurewebsites.net/health`  
   - Test chat:  
     ```bash
     curl -X POST https://YOUR_APP_NAME.azurewebsites.net/get \
          -H "Content-Type: application/json" \
          -d '{"msg":"what is acne?"}'
     ```

## Frontend

- Update `.env`:


---

### **🚀 Production-Ready**
- **Scalable architecture** - can handle real users
- **Professional deployment** - CI/CD pipelines

### **🔒 Built with Best Practices**
- **Secure** - API keys protected, CORS configured
- **Fast** - Optimized loading, cached responses
- **Reliable** - Error handling, health monitoring

---

