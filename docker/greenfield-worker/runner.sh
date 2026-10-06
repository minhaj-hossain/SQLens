#!/usr/bin/env bash
# ==============================================================================
# Greenfield Exam Container Execution Script
# ==============================================================================
set -euo pipefail

INPUT_FILE="${1:-/sandbox/input/submission.json}"
OUTPUT_FILE="${2:-/sandbox/output/result.json}"
TIMEOUT_SECS=3

mkdir -p "$(dirname "$OUTPUT_FILE")"

# Execute evaluator under strict resource & time bounds
if command -v timeout >/dev/null 2>&1; then
    timeout --kill-after=1s "${TIMEOUT_SECS}s" npx tsx /sandbox/evaluator.ts "$INPUT_FILE" "$OUTPUT_FILE" || {
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ] || [ $EXIT_CODE -eq 137 ]; then
            echo "{\"passed\":false,\"failedGate\":4,\"feedback\":\"Execution timed out (>1500ms CPU limit exceeded). Check for infinite loops or non-terminating queries.\",\"gateResults\":[],\"totalDurationMs\":1500}" > "$OUTPUT_FILE"
            exit 0
        fi
        exit $EXIT_CODE
    }
else
    npx tsx /sandbox/evaluator.ts "$INPUT_FILE" "$OUTPUT_FILE"
fi
