# Framework Integration Checklist

> **Purpose:** Comprehensive registration-point checklists for every DAAF framework component type. Used by the `framework-engineer` agent and the orchestrator during Framework Development mode to ensure no wiring point is missed.
>
> **Canonical authority:** This document is the single authoritative integration checklist for all component types. Per-skill supplementary checklists (e.g., in `agent-authoring` or `MODE_TEMPLATE.md`) provide walkthrough detail and contextual guidance but should not be used as the primary checklist. When discrepancies exist, this document governs.
>
> **When to read:** Every framework-engineer invocation. Also useful for manual framework modifications.

---

## How to Use This Document

Each section covers one component type (Skill, Agent, Mode, Reference File, Extension, Host-Facing Script). Items are marked:
- **[M]** = Mandatory (must be completed for every instance)
- **[C]** = Conditional (required only when the stated condition applies)

After completing each item, note the status: Done, Skipped (with reason), or N/A.

---

## 1. Adding or Modifying a Skill

### New Skill Checklist

| # | Item | Req | File | Section / Location |
|---|------|-----|------|--------------------|
| S1 | Create skill directory `.omp/skills/{skill-name}/` | [M] | — | Directory name must exactly match `name` field in frontmatter |
| S2 | Create `SKILL.md` with valid YAML frontmatter (`name`, `description`) | [M] | `.omp/skills/{skill-name}/SKILL.md` | Frontmatter: `name` (lowercase-hyphen, 1-64 chars), `description` (1-1024 chars, what + when, third person) |
| S3 | Add `metadata` dict if applicable (`audience`, `domain`) | [C] | `.omp/skills/{skill-name}/SKILL.md` | Controlled vocabulary per `skill-authoring` skill |
| S4 | Create `references/` subdirectory with reference files | [C] | `.omp/skills/{skill-name}/references/` | Flat structure (no nesting). For data source skills: 3x+ SKILL.md lines |
| S5 | For data source skills: follow `DATA_SOURCE_SKILL_TEMPLATE.md` (13 sections) | [C] | `.omp/skills/{skill-name}/SKILL.md` | Mandatory sections in exact order; Truth Hierarchy blockquote; provenance metadata |
| S6 | Verify SKILL.md body is under 500 lines / 5000 words | [M] | `.omp/skills/{skill-name}/SKILL.md` | Extract overflow to `references/` |
| S7 | Verify description triggers appropriately (no undertriggering or overtriggering) | [M] | `.omp/skills/{skill-name}/SKILL.md` | Test with realistic prompts |
| S8 | If skill should be preloaded by an agent, add to that agent's `skills:` frontmatter | [C] | `.omp/agents/{agent-name}.md` | YAML frontmatter `skills` field |
| S9 | If skill is used in a specific pipeline stage, add to `full-pipeline-mode.md` > Skill-to-Stage Mapping | [C] | `.omp/skills/daaf-orchestrator/references/full-pipeline-mode.md` | Skill-to-Stage Mapping table |
| S10 | If skill is used in mode/reference invocation templates, add reference there | [C] | `.omp/skills/daaf-orchestrator/references/full-pipeline-mode.md` and `.omp/agents/README.md` | Stage-specific invocation template |

### Modifying an Existing Skill

| # | Item | Req | File | What to Check |
|---|------|-----|------|----|
| SM1 | Read the full SKILL.md before editing | [M] | Target skill | Understand structure and content flow |
| SM2 | If changing the description, verify triggering behavior hasn't degraded | [M] | Target skill | Test with prompts that should and should not trigger |
| SM3 | If adding references, verify `references/` stays flat (no nested dirs) | [C] | Target skill | Directory structure |
| SM4 | If changing the name, rename the directory to match | [M] | Target skill | Directory name = frontmatter `name` |
| SM5 | Check if any agents preload this skill (search for skill name in `skills:` fields) | [C] | `.omp/agents/*.md` | Grep for skill name in agent frontmatter |
| SM6 | If changing routing or decision-tree content, find and synchronize files that restate the routing | [C] | `.omp/agents/*.md`, `.omp/skills/daaf-orchestrator/references/*.md` | Grep for library/skill names enumerated in the changed routing (duplicated summaries drift silently) |

---

## 2. Adding or Modifying an Agent

### New Agent Checklist

> For the complete section-by-section walkthrough, invoke the `agent-authoring` skill and read `references/integration-checklist.md`. This checklist covers registration points only.

| # | Item | Req | File | Section / Location |
|---|------|-----|------|--------------------|
| A1 | Create agent file following AGENT_TEMPLATE.md (all 12 sections) | [M] | `.omp/agents/{agent-name}.md` | 400-700 lines target |
| A1b | Assign `model:` frontmatter role (`pi/slow` high-judgment or `pi/task` execution) per orchestrator SKILL.md Default Model Tiers | [M] | `.omp/agents/{agent-name}.md` | YAML frontmatter `model` field |
| A2 | Verify Core Distinction table differentiates from closest neighbors | [M] | `.omp/agents/{agent-name}.md` | Section 2: Identity |
| A3 | Add to Agent Index table | [M] | `.omp/agents/README.md` | Agent Index table |
| A4 | Add "When to Use" subsection | [M] | `.omp/agents/README.md` | When to Use section |
| A5 | Add to Agent Coordination Matrix (producer/consumer rows) | [M] | `.omp/agents/README.md` | Agent Coordination Matrix table |
| A6 | Add to Commonly Confused Pairs if applicable | [C] | `.omp/agents/README.md` | Commonly Confused Pairs table |
| A7 | Update Orchestration Flow diagram if agent participates in pipeline | [C] | `.omp/agents/README.md` | Orchestration Flow ASCII diagram |
| A8 | Add to Subagent Type Selection table in orchestrator SKILL.md | [C] | `.omp/skills/daaf-orchestrator/SKILL.md` | Named Agents table |
| A9 | Add to `full-pipeline-mode.md` Core Workflow tables if stage-specific | [C] | `.omp/skills/daaf-orchestrator/references/full-pipeline-mode.md` | Core Workflow, Handoffs, Stage Gates tables |
| A10 | Add invocation pattern to full-pipeline-mode.md when the agent needs stage-specific context beyond agents README | [C] | `.omp/skills/daaf-orchestrator/references/full-pipeline-mode.md` | Stage / context sections |
| A11 | Add to BOUNDARIES.md if agent has unique boundary considerations | [C] | `agent_reference/BOUNDARIES.md` | Appropriate section |
| A12 | (Handled by OMP harness — no DAAF-level error recovery registration needed) | — | — | — |
| A13 | Prefer instructional policy over per-agent shell extensions (this port has no `.omp/extensions/` hooks) | [C] | `.omp/agents/{agent-name}.md` | Document file-first / tool constraints in agent body |
| A14 | Update root `README.md` agent table and agent count | [M] | `README.md` (project root) | Agents section |
| A15 | Update AGENTS.md if agent affects documented workflows | [C] | `.omp/AGENTS.md` | Relevant section |
| A16 | *(N/A in this port)* `user_reference/` is not shipped — put user-visible notes in `README.md` | [C] | `README.md` | Usage / agents |

### Modifying an Existing Agent

| # | Item | Req | File | What to Check |
|---|------|-----|------|----|
| AM1 | Read the full agent file before editing | [M] | Target agent | Understand structure |
| AM2 | Verify changes don't overlap with another agent's responsibilities | [M] | `.omp/agents/README.md` | Commonly Confused Pairs |
| AM3 | If changing the agent's scope, update README.md When to Use + Coordination Matrix | [C] | `.omp/agents/README.md` | Affected sections |
| AM4 | If changing inputs/outputs, update consumer/producer entries | [C] | `.omp/agents/README.md` | Agent Coordination Matrix |
| AM5 | If changing the name, update all references (SKILL.md, mode/reference, etc.) | [M] | Multiple files | Grep for old name |

---

## 3. Adding or Modifying a Mode

### New Mode Checklist

| # | Item | Req | File | Section / Location |
|---|------|-----|------|--------------------|
| M1 | Create mode reference file following MODE_TEMPLATE.md | [M] | `.omp/skills/daaf-orchestrator/references/{mode-name}-mode.md` | Required sections: description, User Orientation, Workflow, Subagent Invocation, Output Format, Boundaries, Escalation Triggers |
| M1a | If the mode dispatches subagents, include the wave barrier discipline note in the Subagent Invocation section (mid-wave completion notifications are status-only; no synthesis, gates, or checkpoints until the whole wave returns), citing `SKILL.md` § Subagent Coordination > "Wave Barrier Discipline (Async Dispatch)" | [C] | `.omp/skills/daaf-orchestrator/references/{mode-name}-mode.md` | Subagent Invocation section |
| M2 | Update YAML frontmatter description (mode count) | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Frontmatter `description` field |
| M3 | Update Expanded Orientation bullet (mode count + description) | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Welcome Preamble > Expanded Orientation |
| M4 | Update Engagement Mode Classification count word | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | "classify it into one of N engagement modes" |
| M5 | Add branch to Mode Decision Framework tree | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Mode Decision Framework code block |
| M6 | Add row to Mode Summary Table | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Mode Summary Table |
| M7 | Add confirmation template | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Confirmation Templates by Mode |
| M8 | Add escalation paths (from AND to new mode) | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Mode Escalation Paths table |
| M9 | Add row to Reference File Index | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | What to Load Next > Reference File Index |
| M10 | Add branch to Documentation Loading Decision Tree | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Documentation Loading Decision Tree code block |
| M11 | Add mode-specific boundaries | [M] | `agent_reference/BOUNDARIES.md` | Mode-Specific Boundaries section |
| M12 | Update README.md mode count and table | [M] | `README.md` | Engagement Modes section |
| M13 | Document the mode in root `README.md` (this port has no `user_reference/02_*.md`) | [M] | `README.md` | Modes / usage |
| M14 | Add mode-specific AI disclosure guidance | [M] | `agent_reference/AI_DISCLOSURE_REFERENCE.md` | Mode-Specific Disclosure Guidance section |
| M15 | Update session-recovery.md with recovery pattern | [M] | `.omp/skills/daaf-orchestrator/references/session-recovery.md` | Purpose section + conditional recovery steps |
| M16 | (Handled by OMP harness — no DAAF-level error recovery needed) | — | — | — |
| M17 | (Handled by OMP harness — no DAAF-level state template needed) | — | — | — |
| M19 | FAQ: update `README.md` or support-mode refs (no `user_reference/07_*.md` in this port) | [C] | `README.md` / `user-support-mode.md` | Q&A |
| M20 | Progressive orientation lives in mode files + README (no `user_reference/02`) | [C] | `README.md` / mode refs | Orientation |
| M21 | Extension-model notes: this package ships zero OMP extensions; document in README | [C] | `README.md` | Packaging |

### Modifying an Existing Mode

| # | Item | Req | File | What to Check |
|---|------|-----|------|----|
| MM1 | Read the full mode reference file before editing | [M] | Target mode | Understand workflow and structure |
| MM2 | If changing trigger conditions, verify no overlap with other modes | [M] | `.omp/skills/daaf-orchestrator/SKILL.md` | Mode Decision Framework tree |
| MM3 | If changing outputs, update Mode Summary Table | [C] | `.omp/skills/daaf-orchestrator/SKILL.md` | Mode Summary Table |
| MM4 | If changing escalation paths, update both directions | [C] | `.omp/skills/daaf-orchestrator/SKILL.md` | Mode Escalation Paths |
| MM5 | If changing boundaries, update BOUNDARIES.md | [C] | `agent_reference/BOUNDARIES.md` | Mode-Specific Boundaries |
| MM6 | If changing user-facing description, update root `README.md` (no `user_reference/` in this port) | [C] | `README.md` | Modes / usage |

---

## 4. Adding or Modifying a Reference File

### New Reference File Checklist

| # | Item | Req | File | Section / Location |
|---|------|-----|------|--------------------|
| R1 | Create file in `agent_reference/` with clear purpose statement | [M] | `agent_reference/{file-name}.md` | First paragraph states purpose and audience |
| R2 | Add to AGENTS.md Reference Files table | [M] | `AGENTS.md` | Reference Files table |
| R3 | Add trigger conditions ("When to Read") in all referencing documents | [M] | Various | Agent Section 12, mode reference files, orchestrator SKILL.md |
| R4 | Wire into Documentation Loading Decision Tree if loaded by orchestrator | [C] | `.omp/skills/daaf-orchestrator/SKILL.md` | Documentation Loading Decision Tree |
| R5 | Wire into agent Section 12 if used by specific agents | [C] | `.omp/agents/{agent-name}.md` | Section 12: References table |
| R6 | Wire into mode/reference file if stage-specific | [C] | `.omp/skills/daaf-orchestrator/references/full-pipeline-mode.md` and `.omp/agents/README.md` | Progressive loading notes |

### Modifying an Existing Reference File

| # | Item | Req | File | What to Check |
|---|------|-----|------|----|
| RM1 | Read the full file before editing | [M] | Target file | Understand structure |
| RM2 | Check which agents and skills reference this file | [M] | Multiple | Grep for filename |
| RM3 | If changing the file's scope or purpose, update AGENTS.md table description | [C] | `AGENTS.md` | Reference Files table |
| RM4 | If renaming, update all references across codebase | [M] | Multiple | Grep for old name |

---


## 6. Adding or Modifying a Host-Facing Script

> **Scope:** Files under `scripts/host/` — the launchers and lifecycle tools that run on the **user's own machine** (macOS/Linux/Windows), not inside the container. These have distribution and portability registration points that in-container scripts do not.

### New Host-Facing Script Checklist

| # | Item | Req | File | Section / Location |
|---|------|-----|------|--------------------|
| HS1 | Create the `.sh` script under `scripts/host/` following Bash 3.2 + BSD portability standards | [M] | `scripts/host/{name}.sh` | See `shell-scripting` skill > `bash-standards.md` "Host-Script Portability" — host scripts run on macOS `/bin/bash` 3.2 |
| HS2 | Create the matching `.ps1` cross-platform pair (or document why none is needed) | [M] | `scripts/host/{name}.ps1` | The hygiene-checks CI job enforces `.sh`/`.ps1` pair parity for `scripts/host/` |
| HS3 | Set executable bit and record it in Git | [M] | `scripts/host/{name}.sh` | `chmod +x`, then `git update-index --chmod=+x`; verify `git ls-files -s` shows `100755` (see § 5 note) |
| HS4 | Add the script to the **fresh-install download list** in `install.sh` | [M] | `scripts/host/install.sh` | The `curl … -o` download block that fetches host scripts via GitHub raw. A file missing here will not exist for fresh installs |
| HS5 | Add the script to the fresh-install download list in `install.ps1` | [M] | `scripts/host/install.ps1` | The PowerShell equivalent download block (`.ps1` files, plus `daaf.sh`/`daaf_lib.sh` which Windows runs via Git Bash/WSL) |
| HS6 | **Updater sync — usually no action needed.** The updater self-derives its host-script list from the post-update repository state, so newly added `scripts/host/` files matching the platform filter (`*.sh` on Unix, `*.ps1` on Windows) are picked up automatically. **Exception:** files of any *other* type (e.g., `.txt` like `README.txt` and `environment_settings_example.txt`) must be explicitly added to the platform filter in **both** updaters or they will be silently excluded from sync | [M] | `scripts/host/update_daaf.sh`, `update_daaf.ps1` | Do **not** hand-edit a per-file sync allowlist for scripts — the updater intentionally reads the file list from the new repo state (not a hardcoded list in the old script), which is what heals the historical chicken-and-egg where a hardcoded allowlist in the *running* (old) updater could never deliver a file it did not already know about. The platform *filter* (file-type rules) is the one part that still requires a hand edit, and only for novel file types |
| HS7 | Add `DAAF_NESTED` handling and a `DAAF_DRY_RUN` smoke path so CI can exercise it | [M] | `scripts/host/{name}.sh` / `.ps1` | Required by the `daaf-conventions` linter (DAAF_NESTED) and consumed by the smoke-tests / bats-bash32 CI jobs |
| HS8 | Add the script to the smoke-test lists in `ci-scripts.yml` (bash, pwsh 7, PS 5.1, and the `bash:3.2` job) | [M] | `.github/workflows/ci-scripts.yml` | Smoke-tests job + bats-bash32 job. Interactive menu-loop scripts must be driven with input on stdin and any state their code paths require |
| HS9 | Create a `.bats` (and Pester `.Tests.ps1`) unit test | [C] | `tests/bash/{name}.bats`, `tests/powershell/{name}.Tests.ps1` | Required if the script has non-trivial logic beyond a thin launcher |
| HS10 | Add to the migration fetch list if it is a bootstrap tool users may lack | [C] | `scripts/host/migrate_daaf.sh` / `.ps1` | Only for one-time migration tooling; most scripts are covered by install + updater self-sync |
| HS11 | Document user-facing scripts in root `README.md` (no quickstart `user_reference/` tree in this port) | [C] | `README.md` | Usage / scripts |

> **Why the install lists are hand-maintained but the updater is not:** Fresh installs download host scripts before any repo exists on the host, so `install.sh`/`install.ps1` must name each file explicitly (there is nothing to derive a list from yet). The updater, by contrast, runs *after* pulling the new repo state into the container, so it can and does enumerate the current `scripts/host/` contents itself — making a hardcoded updater list both redundant and a recurring source of "new file silently never delivered" bugs. Register new host scripts in the two install lists; leave the updater alone.

### Modifying an Existing Host-Facing Script

| # | Item | Req | File | What to Check |
|---|------|-----|------|----|
| HSM1 | Read the full script (and its `.ps1` pair) before editing | [M] | Target script(s) | Keep the pair behaviorally in sync |
| HSM2 | Re-run the portability gate after editing | [M] | — | `bash tests/lint/check-daaf-conventions.sh` — no Bash-4.x-only constructs in `scripts/host/*.sh` |
| HSM3 | If renaming, update both install download lists and the CI smoke lists | [M] | `install.sh`, `install.ps1`, `ci-scripts.yml` | The updater self-heals renames on next update, but installs and CI reference the name directly |
| HSM4 | Keep `.sh` and `.ps1` behavior aligned | [M] | Both pair members | Parity is enforced for existence by CI, but not for behavior — that is on the author |

---

## 7. Cross-Cutting Consistency Checks

After completing any component checklist above, run these universal verification steps:

| # | Check | How |
|---|-------|-----|
| CC1 | Count words are consistent | Grep for "N engagement modes", "N agents", etc. across all files |
| CC2 | Cross-references resolve | Verify every file path mentioned in any document actually exists |
| CC3 | Table schemas match | New rows have the same columns as existing rows |
| CC4 | Escalation paths are bidirectional | Both "from" and "to" modes acknowledge each path |
| CC5 | Naming conventions are followed | Skill dirs match frontmatter names; agent files are lowercase-hyphenated; mode refs end in `-mode.md` |
| CC6 | No orphaned components | Every new file is referenced by at least one other file |
| CC7 | No stale references | If anything was renamed or removed, old names don't appear elsewhere |
