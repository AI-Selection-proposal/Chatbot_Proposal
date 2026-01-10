python3 -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen2-VL-7B-Instruct \
    --host 0.0.0.0 \
    --port 8002 \
    --trust-remote-code \
    --gpu-memory-utilization 0.9 &