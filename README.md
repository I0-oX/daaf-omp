# DAAF for OMP (Oh My Pi)

This is a port of the [Data Analyst Augmentation Framework (DAAF)](https://github.com/DAAF-Contribution-Community/daaf) from Claude Code to OMP (Oh My Pi).

## What is DAAF?

DAAF is a free and open-source instructions framework that helps skilled researchers deepen and extend their expertise across any domain of data analysis with AI assistance — while enhancing the transparency, rigor, and reproducibility that good science demands.

## Structure

```
daaf-omp/
├── .omp/
│   ├── AGENTS.md                    # Project context (ported from CLAUDE.md)
│   ├── config.yml                   # OMP config: extensions list, settings
│   ├── extensions/                  # 14 OMP extensions (ported from .claude/hooks/*.sh)
│   │   ├── daaf-hook-runner.ts       # Shared helper: spawns shell hooks with JSON stdin
│   │   ├── daaf-bash-safety.ts       # Blocks dangerous bash commands
│   │   ├── daaf-enforce-single-command.ts  # Blocks command chaining (&&, ;, ||)
│   │   ├── daaf-enforce-file-first.ts      # Enforces run_with_capture.sh wrapper
│   │   ├── daaf-enforce-model-ceiling.ts   # Cost-control: blocks model tier escalation
│   │   ├── daaf-audit-log.ts               # Audit trail logging
│   │   ├── daaf-output-scanner.ts          # Secret detection in tool output
│   │   ├── daaf-context-reporter.ts        # Context utilization injection
│   │   ├── daaf-remind-orchestrator.ts     # Reminds to load orchestrator skill
│   │   ├── daaf-archive-session.ts         # Session transcript archiving
│   │   ├── daaf-recover-session-logs.ts    # Crash recovery
│   │   ├── daaf-flag-orchestrator-loaded.ts
│   │   ├── daaf-deny-claude-code-guide.ts
│   │   ├── daaf-enforce-explore-model.ts
│   │   └── daaf-statusline.ts              # Live status bar (model, dir, ctx usage)
│   ├── hooks/                       # 13 shell hooks (safety logic, invoked by extensions)
│   ├── skills/                      # 36 skills (data sources, methods, tools)
│   └── agents/                      # 15 agent definition files (behavioral protocols)
├── agent_reference/                 # 23 reference docs (templates, workflows, checkpoints)
└── scripts/                         # Utility scripts (run_with_capture.sh, log viewer, etc.)
```

## Key Design Decisions

### Extension Architecture
DAAF's original 14 Claude Code hooks (`.claude/hooks/*.sh`) are battle-tested shell scripts with complex regex/awk logic. Rather than rewriting all logic in TypeScript (risking bugs in security-critical code), each OMP extension is a **thin adapter** that:
1. Intercepts the appropriate OMP event (`tool_call`, `tool_result`, `session_start`, `session_shutdown`)
2. Builds the JSON payload the shell hook expects
3. Spawns the shell hook via `daaf-hook-runner.ts`
4. Maps exit code 2 → `{ block: true, reason }` (OMP's block contract)

### Path Mapping
| Claude Code | OMP |
|---|---|
| `.claude/` | `.omp/` |
| `CLAUDE.md` | `AGENTS.md` |
| `.claude/settings.json` | `.omp/config.yml` |
| `.claude/hooks/` | `.omp/extensions/` (TS) + `.omp/hooks/` (shell) |
| `$CLAUDE_PROJECT_DIR` | `$(pwd)` |
| `Bash`/`Read`/`Edit`/etc. (tool) | `bash`/`read`/`edit`/etc. |
| `PreToolUse`/`PostToolUse` | `tool_call`/`tool_result` |
| `Skill` tool | `read skill://<name>` |

### Skills
Skills were copied directly — OMP and Claude Code use the same `SKILL.md` frontmatter format (`name`, `description`). The 36 skills (data sources, Python libraries, methodologies) are domain knowledge that is harness-agnostic.

### Agents
14 specialist agents are discovered from `.omp/agents/` and invocable via the `task` tool:

| Agent | Model Tier | Tools | Role |
|---|---|---|---|
| `code-reviewer` | pi/slow | read,write,edit,bash,glob,grep | QA review of executed scripts |
| `data-ingest` | pi/slow | +web_search | Tabular dataset profiling (4-part) |
| `data-planner` | pi/slow | read,write,edit,bash,glob,grep | Analysis plan creation |
| `data-verifier` | pi/slow | read,bash,glob,grep | Adversarial goal-backward verification |
| `debugger` | pi/slow | +web_search | Diagnosis and root-cause analysis |
| `framework-engineer` | pi/slow | read,write,edit,bash,glob,grep | Framework skill/component authoring |
| `integration-checker` | pi/task | read,bash,glob,grep | Cross-artifact wiring verification |
| `notebook-assembler` | pi/task | read,write,edit,bash,glob,grep | Jupyter notebook assembly |
| `plan-checker` | pi/slow | read,bash,glob,grep | Six-dimension plan validation |
| `report-writer` | pi/slow | read,write,edit,bash,glob,grep | Structured research report generation |
| `research-executor` | pi/slow | read,write,edit,bash,glob,grep | Atomic Stage 5-8 task execution |
| `research-synthesizer` | pi/task | read,write,edit,bash,glob,grep | Cross-source synthesis |
| `search-agent` | pi/task | read,bash,glob,grep,web_search | Broad exploration across sources |
| `source-researcher` | pi/task | read,bash,glob,grep | Deep single-source investigation |

Usage: `task(agent: "research-executor", ...)` or `task(agent: "code-reviewer", ...)`.
Model mapping: DAAF `opus` tier → `pi/slow` (most capable), DAAF `sonnet` tier → `pi/task` (standard subagent).

## Usage

```bash
# From this directory, launch OMP
omp

# The 14 extensions load automatically, 36 skills are discovered,
# and AGENTS.md provides the DAAF context.
```

## Verification

- All 15 extension TS files pass `bun --check` (syntax valid)
- All 13 shell hooks pass `bash -n` (syntax valid)
- `run_with_capture.sh` tested end-to-end: executes Python, captures output, appends execution log
- `config.yml` is valid YAML with 14 extensions registered
- 36 skills discovered from `.omp/skills/*/SKILL.md`
- 14 agents discovered from `.omp/agents/*.md` with valid frontmatter (name, description, tools, model)
- No residual functional Claude Code path references (only porting-origin comments remain)

## License

LGPL-3.0-or-later (same as upstream DAAF)
