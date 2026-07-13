# DAAF for OMP (Oh My Pi)

Port of the [Data Analyst Augmentation Framework (DAAF)](https://github.com/DAAF-Contribution-Community/daaf) to [OMP (Oh My Pi)](https://github.com/nicobailon/oh-my-pi).

**This is not a 1:1 Claude Code port.** Claude-only hooks, shell enforcers, and a second orchestration layer that OMP already owns were removed. DAAF here is:

- domain skills + agent protocols
- research methodology (modes, stages, QA, IAT, file-first capture)
- dispatch via OMP’s native `task` tool

OMP owns: sessions, compaction, tool interception settings, subagent concurrency, model roles.

## Structure

```text
daaf-omp/
├── .omp/
│   ├── AGENTS.md                 # Project DAAF context (auto-loaded)
│   ├── config.yml                # Project OMP settings (models, advisor, …)
│   ├── agents/                   # 14 specialist agent definitions
│   ├── skills/                   # Domain + method skills (SKILL.md)
│   └── scripts/run_with_capture.sh  # Packaged copy of capture wrapper
├── scripts/
│   └── run_with_capture.sh       # Canonical capture wrapper (use this path)
├── agent_reference/              # Templates, QA, validation, IAT, …
├── setup.sh                      # Copy assets into another OMP project
└── package.json                  # Plugin metadata (no custom extensions)
```

## What OMP owns vs DAAF

| Concern | Owner |
|---------|--------|
| Session JSONL, resume, tree | OMP |
| Compaction / context monitoring | OMP |
| `task` dispatch, `task.maxConcurrency` | OMP |
| Model roles (`pi/slow`, `pi/task`, …) | OMP settings + agent frontmatter |
| Bash misuse interceptor (cat/grep/find → tools) | OMP settings |
| File-first + `run_with_capture.sh` | **DAAF policy** (audit trail) |
| IAT, QA1–QA4b, checkpoints CP1–CP4 | **DAAF quality layer** |
| Mode classification + stage methodology | **DAAF orchestrator skill** |

There are **no** DAAF TypeScript extensions or `.omp/hooks/` shell enforcers in this tree.

## Agents

Discovered from `.omp/agents/*.md`, invoked with OMP `task` (`agent: "<name>"`).

| Agent | Model role | Role |
|-------|------------|------|
| `code-reviewer` | `pi/slow` | Per-script QA |
| `data-planner` | `pi/slow` | Plan.md + Plan_Tasks.md |
| `plan-checker` | `pi/slow` | Six-dimension plan validation |
| `data-verifier` | `pi/slow` | Final adversarial review |
| `debugger` | `pi/slow` | Root-cause diagnosis |
| `framework-engineer` | `pi/slow` | Framework artifact edits |
| `report-writer` | `pi/slow` | Stakeholder report |
| `research-executor` | `pi/task` | Atomic Stage 5–8 execution |
| `data-ingest` | `pi/task` | Onboarding profiling |
| `notebook-assembler` | `pi/task` | Marimo compile of executed scripts |
| `integration-checker` | `pi/task` | Wiring checks |
| `research-synthesizer` | `pi/task` | Cross-source synthesis |
| `search-agent` | `pi/task` | Broad exploration |
| `source-researcher` | `pi/task` | Single-source deep dive |

DAAF docs still say “opus/sonnet” as judgment tiers; frontmatter maps them to OMP roles `pi/slow` / `pi/task` via your `modelRoles` in settings.

## File-first capture

Research Python is never “run to show me”. Protocol:

```bash
bash scripts/run_with_capture.sh {PROJECT_DIR}/scripts/stage5_fetch/01_example.py
```

Full protocol: `agent_reference/SCRIPT_EXECUTION_REFERENCE.md`.

## Usage

### Standalone (this repo)

```bash
cd /path/to/daaf-omp
omp
```

Loads `.omp/AGENTS.md`, discovers agents/skills. Configure models in `.omp/config.yml` and/or `~/.omp/agent/config.yml`.

### Copy assets into another project

```bash
./setup.sh /path/to/your-project
```

Copies agents, skills, `AGENTS.md`, `scripts/`, and `agent_reference/`.

Optional plugin metadata (`package.json` → `omp`) is present for install conventions, but this package ships **zero custom extensions**.

### Credentials / data-source API keys

Do **not** put API keys in committed project files or create `.env` from research scripts.

Typical host-injection pattern (dockerized DAAF hosts):

1. On the **host**, set keys in `environment_settings.txt` (often from `environment_settings_example.txt`).
2. Recreate/restart the runtime so keys are injected as environment variables.
3. Scripts read them with `os.environ["KEY_NAME"]`.

For pure OMP desktop/native sessions, export the same variables in the shell/profile that launches `omp`, or use your provider auth flow (`omp` provider auth / env vars documented in `omp://providers.md` and `omp://environment-variables.md`).

Skill templates that need a key must name the exact env var in their Prerequisites table.

### Advisor (optional)

Advisor needs **both**:

```yaml
advisor:
  enabled: true
modelRoles:
  advisor: openrouter/openai/gpt-5.6-sol:medium   # thinking with ':' not '-'
```

Invalid: `…/gpt-5.6-sol-low` (treated as a model id that does not exist).
See `/advisor status` inside a session (`omp://advisor-watchdog.md`).

## Verification

- [x] No `.omp/extensions/` or `.omp/hooks/` enforcers
- [x] `scripts/run_with_capture.sh` present + executable
- [x] Agents/skills under `.omp/` with frontmatter
- [x] Orchestration refs point at `full-pipeline-mode.md` + OMP `task` (not deleted WORKFLOW_PHASE files)

## License

LGPL-3.0-or-later (same as upstream DAAF).
