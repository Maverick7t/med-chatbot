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

## 🚫 **Ignored Files & Folders**

The project uses comprehensive `.gitignore` rules to exclude:

### **Python-specific**
- `__pycache__/` - Python bytecode cache
- `*.pyc`, `*.pyo`, `*.pyd` - Compiled Python files
- `build/`, `dist/`, `*.egg-info/` - Build artifacts
- `.pytest_cache/`, `.coverage` - Testing artifacts

### **Environment & Secrets**
- `.env`, `.venv/`, `venv/` - Environment variables and virtual environments
- `.envrc` - Directory environment configuration

### **Development Tools**
- `.ipynb_checkpoints` - Jupyter notebook checkpoints
- `.vscode/` - VS Code settings (optional)
- `.idea/` - PyCharm settings
- `.ruff_cache/` - Ruff linter cache
- `.cursorignore` - Cursor AI editor exclusions

### **Documentation & Logs**
- `*.log` - Application logs
- `docs/_build/` - Sphinx documentation builds
- `.mypy_cache/` - MyPy type checker cache

### **Package Managers**
- `Pipfile.lock`, `poetry.lock` - Lock files (environment-specific)

## 🚫 **Git Ignore Configuration**

The project maintains a comprehensive `.gitignore` file that excludes:

### **🔒 Security & Environment**
```
.env                    # API keys and secrets
.envrc                  # Directory environment config
.venv/, venv/          # Virtual environments
```

### **🐍 Python Artifacts**
```
__pycache__/           # Python bytecode cache
*.pyc, *.pyo, *.pyd   # Compiled Python files  
build/, dist/          # Build distributions
*.egg-info/           # Package metadata
.pytest_cache/        # Testing cache
.coverage             # Coverage reports
```

### **🛠️ Development Tools**
```
.vscode/              # VS Code settings (optional)
.idea/                # PyCharm/IntelliJ settings
.ipynb_checkpoints    # Jupyter notebook checkpoints
.ruff_cache/          # Ruff linter cache
.cursorignore         # Cursor AI editor exclusions
.mypy_cache/          # MyPy type checker cache
```

### **📦 Package Managers**
```
Pipfile.lock          # Pipenv lock file
poetry.lock           # Poetry lock file
.pdm-python           # PDM package manager
.pixi/                # Pixi environment
```

### **📋 Logs & Documentation**
```
*.log                 # Application logs
docs/_build/          # Sphinx documentation builds
/site                 # MkDocs builds
```

**This configuration ensures:**
- ✅ **Clean repository** - No build artifacts or cache files
- ✅ **Security** - API keys and secrets never committed
- ✅ **Cross-platform compatibility** - Ignores OS-specific files
- ✅ **Development efficiency** - Excludes temporary files
- `.pdm-python`, `.pixi/` - PDM and Pixi package manager files

**This ensures clean commits and protects sensitive information like API keys.** 🔒
