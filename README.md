# 🌟 Chatbot Mage Setup Guide

> *A mystical journey to summon your AI companion*

## ⚡ Prerequisites

Before beginning your quest, ensure you have:

- **RunPod** instance with exposed ports: `3000`, `8000`, `8080`
- **Linux** environment (recommended)
- **Node.js** v20+ and npm
- **Python** with venv support

---

## 🎭 Chapter 1: Preparing the Ritual Circle

### 1.1 Clone the Sacred Repository

```bash
git clone <repository-url>
cd chatbot-mage
```

### 1.2 Create the Virtual Realm (Python Virtual Environment)

```bash
python -m venv .
source bin/activate
```

### 1.3 Gather the Mystical Dependencies

```bash
pip install -r requirements.txt
pip install -U vllm
```

---

## 🔮 Chapter 2: Awakening the Backend Spirits

### 2.1 Terminal #1 - Summon the VLLM Engine

In your first terminal window:

```bash
source bin/activate
bash ./scripts_tune/run_vllm.sh
```

*The VLLM engine serves as the core magical processor for your AI model.*

### 2.2 Terminal #2 - Invoke the Backend Server

Open a **second terminal** and execute:

```bash
source bin/activate
bash ./scripts_tune/run_backend.sh
```

*This server acts as the bridge between your frontend interface and the AI model.*

---

## ✨ Chapter 3: Manifesting the Frontend Portal

### 3.1 Navigate to the Frontend Realm

Open a **third terminal**:

```bash
cd frontend
```

### 3.2 Install Node.js Dependencies (Linux Method Preferred)

```bash
# Ensure Node.js v20+ is installed
npm install
npm install react-markdown remark-gfm
```

*These packages enable rich markdown rendering for your chat interface.*

### 3.3 Launch the Portal

```bash
npm run dev -- -p 3000
```

*Your frontend portal will materialize at port 3000.*

---

## 🎯 Quick Reference

| Component | Terminal | Port | Command |
|-----------|----------|------|---------|
| VLLM Engine | #1 | 8000 | `bash ./scripts_tune/run_vllm.sh` |
| Backend API | #2 | 8080 | `bash ./scripts_tune/run_backend.sh` |
| Frontend UI | #3 | 3000 | `npm run dev -- -p 3000` |

---

## 📝 Important Notes

- **Virtual Environment**: Always activate with `source bin/activate` before running Python commands
- **Port Configuration**: Ensure RunPod has ports 3000, 8000, and 8080 exposed
- **Terminal Management**: Keep all three terminals running simultaneously
- **Node Version**: Minimum Node.js v20 is required for optimal performance

---

## 🌸 Success Checkpoint

If everything is running correctly, you should see:

- ✅ VLLM engine active on port 8000
- ✅ Backend server responding on port 8080  
- ✅ Frontend interface accessible at port 3000

*Your Chatbot Mage is now ready to serve! May your conversations be enlightening.*

---

**🎴 Made with magic and code**