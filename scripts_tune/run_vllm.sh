#!/usr/bin/env bash
# set -e

# cd "$(dirname "$0")/.."

# Load env
set -a
source .env
set +a

mkdir -p hf_cache/hub hf_cache/assets hf_cache/vllm

# vLLM OpenAI-compatible server
# Tip: adjust --max-model-len and --gpu-memory-utilization for A100 and your context needs.
python -m vllm.entrypoints.openai.api_server \
  --model "${CHAT_VLM_MODEL}" \
  --host 0.0.0.0 \
  --port 8000 \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.90
