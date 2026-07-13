#!/usr/bin/env bash
# setup.sh — Copy DAAF agents, skills, AGENTS.md, scripts, and agent_reference
# into a target OMP project. This package ships no custom OMP extensions.

set -euo pipefail

TARGET_DIR="${1:-$(pwd)}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory '$TARGET_DIR' does not exist."
  exit 1
fi

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up DAAF assets in: $TARGET_DIR"
mkdir -p "$TARGET_DIR/.omp/agents"
mkdir -p "$TARGET_DIR/.omp/skills"
mkdir -p "$TARGET_DIR/scripts"

echo "-> Copying agents..."
cp -r "$SRC_DIR/.omp/agents/"* "$TARGET_DIR/.omp/agents/"

echo "-> Copying skills..."
cp -r "$SRC_DIR/.omp/skills/"* "$TARGET_DIR/.omp/skills/"

echo "-> Copying AGENTS.md..."
cp "$SRC_DIR/.omp/AGENTS.md" "$TARGET_DIR/.omp/AGENTS.md"

echo "-> Copying scripts (includes run_with_capture.sh)..."
cp -r "$SRC_DIR/scripts/"* "$TARGET_DIR/scripts/"
if [ -f "$TARGET_DIR/scripts/run_with_capture.sh" ]; then
  chmod +x "$TARGET_DIR/scripts/run_with_capture.sh"
fi

echo "-> Copying agent_reference/"
cp -r "$SRC_DIR/agent_reference" "$TARGET_DIR/"

echo "DAAF OMP assets copy completed successfully."
echo "Notes:"
echo "  - Configure modelRoles / advisor in $TARGET_DIR/.omp/config.yml or ~/.omp/agent/config.yml"
echo "  - Run research scripts via: bash scripts/run_with_capture.sh <script.py>"
echo "  - This package does not install OMP extensions (none are required for DAAF methodology)."
