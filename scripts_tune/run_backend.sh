#!/usr/bin/env bash
# set -e
# cd "$(dirname "$0")/.."

# pip install -r requirements.txt

set -a
source .env
set +a

mkdir -p data/uploads data/extracted/text data/extracted/images data/sqlite chroma

uvicorn backend.app.main:app --host 0.0.0.0 --port 8080 --reload
