# 🆓 Ollama Setup Guide - Free & Open Source LLM

This guide will help you set up **Ollama** to use completely **FREE and OPEN SOURCE** language models with your RAG backend.

## 🎯 **What is Ollama?**

Ollama is a free, open-source tool that allows you to run large language models **locally on your machine** without any API costs or usage limits.

## 🚀 **Quick Start (5 minutes)**

### 1. Install Ollama

**macOS:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai/download)

### 2. Start Ollama Service
```bash
ollama serve
```

### 3. Download a Model
```bash
# Download Llama 2 (7B parameters - good balance of quality/speed)
ollama pull llama2

# Or try other free models:
ollama pull mistral      # Fast and efficient
ollama pull codellama    # Great for code
ollama pull phi2         # Lightweight and fast
```

### 4. Test Ollama
```bash
ollama run llama2 "Hello, how are you?"
```

## 🔧 **RAG Backend Integration**

### 1. Update Environment Variables
```bash
# In your .env file:
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 2. Start Your RAG Backend
```bash
python main.py
```

### 3. Test the Integration
```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main topic?"}'
```

## 📊 **Available Free Models**

| Model | Size | Quality | Speed | Use Case |
|-------|------|---------|-------|----------|
| **llama2** | 7B | ⭐⭐⭐⭐ | ⭐⭐⭐ | General purpose |
| **mistral** | 7B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Fast & efficient |
| **codellama** | 7B | ⭐⭐⭐⭐ | ⭐⭐⭐ | Code & technical |
| **phi2** | 2.7B | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Lightweight & fast |
| **llama2:13b** | 13B | ⭐⭐⭐⭐⭐ | ⭐⭐ | High quality |
| **mistral:7b-instruct** | 7B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Instruction following |

## 💡 **Model Selection Guide**

- **For Development/Testing**: Use `phi2` (fastest, smallest)
- **For Production**: Use `llama2` or `mistral` (good balance)
- **For Code Documents**: Use `codellama`
- **For High Quality**: Use `llama2:13b` (slower but better)

## 🔄 **Switching Models**

### Via Environment Variable
```bash
# Change in .env file
OLLAMA_MODEL=phi3
```

### Via API (Runtime)
```python
from services.llm_service import LLMService

llm_service = LLMService()
llm_service.set_model("phi3")
```

## 📱 **Performance Tips**

### 1. **Hardware Requirements**
- **Minimum**: 8GB RAM, 4GB free disk
- **Recommended**: 16GB+ RAM, 8GB+ free disk
- **Optimal**: 32GB+ RAM, dedicated GPU

### 2. **Speed Optimization**
```bash
# Use smaller models for faster responses
ollama pull phi2        # 2.7B parameters
ollama pull mistral     # 7B parameters

# Use larger models for better quality
ollama pull llama2:13b  # 13B parameters
```

### 3. **Memory Management**
```bash
# Check model memory usage
ollama list

# Remove unused models
ollama rm model_name
```

## 🐛 **Troubleshooting**

### Common Issues

**1. Ollama not responding**
```bash
# Restart Ollama service
ollama serve

# Check if running
ps aux | grep ollama
```

**2. Model not found**
```bash
# List available models
ollama list

# Pull the model again
ollama pull llama2
```

**3. Out of memory**
```bash
# Use smaller model
ollama pull phi2

# Check system memory
free -h
```

**4. Slow responses**
```bash
# Use faster model
ollama pull phi2

# Check CPU usage
htop
```

## 🔒 **Security & Privacy**

✅ **100% Private** - All processing happens on your machine  
✅ **No Data Sharing** - No data sent to external services  
✅ **No Usage Limits** - Unlimited queries  
✅ **Offline Capable** - Works without internet after setup  

## 💰 **Cost Comparison**

| Service | Cost per 1M tokens | Privacy | Speed |
|---------|-------------------|---------|-------|
| **Ollama (Local)** | $0.00 | 100% Private | Medium |
| **OpenAI GPT-3.5** | $0.002 | Data shared | Fast |
| **OpenAI GPT-4** | $0.03 | Data shared | Fast |
| **Anthropic Claude** | $0.015 | Data shared | Fast |

## 🚀 **Advanced Configuration**

### Custom Model Parameters
```python
llm_service.set_parameters(
    max_tokens=2000,
    temperature=0.5
)
```

## 📚 **Additional Resources**

- [Ollama Documentation](https://ollama.ai/docs)
- [Model Library](https://ollama.ai/library)
- [Community Models](https://ollama.ai/library)
- [Performance Benchmarks](https://ollama.ai/benchmarks)

## 🎉 **You're All Set!**

Your RAG backend now uses **completely free and open source** language models! 

- ✅ **No API costs**
- ✅ **No usage limits** 
- ✅ **100% private**
- ✅ **Offline capable**
- ✅ **Enterprise ready**

Enjoy your free, powerful RAG system! 🚀
