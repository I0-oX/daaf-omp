#!/usr/bin/env bash
# setup.sh — Automates copying DAAF agents, skills, and prompts into a target OMP project.

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

# Copy Agents
echo "-> Copying agents..."
cp -r "$SRC_DIR/.omp/agents/"* "$TARGET_DIR/.omp/agents/"

# Copy Skills
echo "-> Copying skills..."
cp -r "$SRC_DIR/.omp/skills/"* "$TARGET_DIR/.omp/skills/"

# Copy AGENTS.md
echo "-> Copying AGENTS.md..."
cp "$SRC_DIR/.omp/AGENTS.md" "$TARGET_DIR/.omp/AGENTS.md"

# Copy Scripts
echo "-> Copying scripts..."
mkdir -p "$TARGET_DIR/scripts"
cp -r "$SRC_DIR/scripts/"* "$TARGET_DIR/scripts/"

echo "-> Copying agent_reference/"
cp -r "$SRC_DIR/agent_reference" "$TARGET_DIR/"

echo "DAAF OMP assets copy completed successfully!"
echo "Make sure to run 'omp plugin install github:DAAF-Contribution-Community/daaf-omp' (or link this local clone) to enable DAAF's extensions."
