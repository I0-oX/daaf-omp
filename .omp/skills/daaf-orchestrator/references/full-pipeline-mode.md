# Full Pipeline Mode

Reference loaded after the orchestrator classifies a request as Full Pipeline
mode and the user confirms. Describes *what* the pipeline produces at each
stage — not *how* to orchestrate it. OMP handles dispatch, waves, state,
context, error recovery, and checkpoints natively.

**Path variables:**
- `{BASE_DIR}` = project root where `AGENTS.md` resides
- `{SKILL_REFS}` = `{BASE_DIR}/.omp/skills/daaf-orchestrator/references`

> **Domain Extensibility:** Domain-agnostic. Skill names below
> (`education-data-explorer`, `education-data-query`, `education-data-context`)
> are demo defaults. Resolve real skill names from Plan.md's Domain
> Configuration and pass them in agent prompts.

---

## Pre-Flight

Before Phase 1, present the pre-flight checklist: orient the user (5 phases,
checkpoint after each), then list deliverables + estimated scope (sources,
years, records, geography). End with a confirmation question. STOP until the
user confirms.

**Deliverables:**
- Plan.md + Plan_Tasks.md (methodology + task sequence)
- Analytic scripts (fetch, clean, transform, analyze, QA) — file-first protocol
- Validated datasets (raw + processed)
- Marimo notebook walkthrough of executed scripts + logs
- Key data visualizations
- Stakeholder report
- LEARNINGS.md (reusable insights)

---

## Stage Overview

| Stage | Phase | Name | Agent | Skill |
|-------|-------|------|-------|-------|
| 1 | 1 | Initial Intake | Orchestrator | — |
| 2 | 1 | Data Exploration | search-agent | domain explorer |
| 3 | 1 | Source Deep-Dive | source-researcher | `*-data-source-*` |
| 3.5 | 1 | Findings Synthesis | research-synthesizer | data-scientist |
| 4 | 2 | Plan Creation | data-planner | data-scientist |
| 4.5 | 2 | Plan Validation | plan-checker | data-scientist |
| 5 | 3 | Data Retrieval | research-executor | domain query |
| 6 | 3 | Context Application | research-executor | domain context |
| 7 | 4 | EDA & Transformation | research-executor | data-scientist, polars |
| 8 | 4 | Analysis & Visualization | research-executor | modeling + viz libs |
| 9 | 4 | Notebook Assembly | notebook-assembler | marimo |
| 10 | 4 | QA Aggregation | Orchestrator | — |
| 11 | 5 | Report Generation | report-writer | data-scientist |
| 12 | 5 | Final Review | data-verifier | — |

---

## Per-Script QA Loop (DAAF Quality Layer)

Every Stage 5-8 script is executed by `research-executor`, then **immediately
reviewed** by `code-reviewer` before the next script begins. This is DAAF's
core quality guarantee — OMP does not enforce it. Batching QA to stage end lets
errors compound silently.

**Loop:**
1. `research-executor` runs one script → `scripts/cr/stage{N}_{step}_cr{1..5}.py`
   validates independently
2. `code-reviewer` reviews the script + QA script output: PASSED / WARNING /
   BLOCKER
3. If BLOCKER: `research-executor` revises (`_a.py`, `_b.py`), re-review
4. If still BLOCKER after 2 revisions: escalate to user

Adversarial review expected — the checkpoints are defined in
`agent_reference/QA_CHECKPOINTS.md` (QA1-QA4b). Code must follow IAT standards
(`agent_reference/INLINE_AUDIT_TRAIL.md`).

---

## Skill-to-Stage Mapping

| Stage | Primary Skill(s) | Notes |
|-------|------------------|-------|
| 2-3 | data-scientist + domain skill | search-agent / source-researcher invoke skill |
| 4 | data-scientist | data-planner agent |
| 4.5 | data-scientist | plan-checker (read-only validation) |
| 5-6 | data-scientist + domain query/context | file writes to data/raw, data/processed |
| 7 | data-scientist, polars, geopandas (if spatial) | |
| 8.1 | data-scientist + modeling lib (per Plan) | see selection below |
| 8.2 | data-scientist + plotnine/plotly/geopandas | |
| 9 | marimo | compiles scripts, no new code |
| 11 | data-scientist + science-communication (if non-technical) | |
| 12 | data-scientist | data-verifier (adversarial) |

**Modeling library selection (Stage 8.1):** Plan_Tasks.md `<skill>` element
specifies the lib. Routing: OLS/GLM/logit → `statsmodels`; FE/IV/DiD →
`pyfixest`; RE/Fama-MacBeth/IV-GMM/SUR → `linearmodels`; survey-weighted →
`svy`; spatial → `geopandas`; supervised/unsupervised ML → `scikit-learn`.

**R/Stata backgrounds:** Add translation directive to all Stage 5-8 prompts
when user preference set (see SKILL.md).

---

## Agent Invocation Context

Each subagent prompt must include: absolute script path, methodology context
from Plan.md, task spec from Plan_Tasks.md, research question, years,
geographic scope, filters, expected row count / critical columns, output paths,
coded value + missingness expectations, Risk Register items. All paths absolute.

For code-reviewer prompts, also inline Plan.md expectations (row counts,
tolerances), QA thresholds (BLOCKER/WARNING if), prior QA findings, IAT
compliance expectations.

---

## Deliverable Format References

| Artifact | Template |
|----------|----------|
| Plan | `agent_reference/PLAN_TEMPLATE.md` |
| Tasks | `agent_reference/PLAN_TASKS_TEMPLATE.md` |
| Report | `agent_reference/REPORT_TEMPLATE.md` |
| QA | `agent_reference/QA_CHECKPOINTS.md`, `agent_reference/VALIDATION_CHECKPOINTS.md` |
| Script execution | `agent_reference/SCRIPT_EXECUTION_REFERENCE.md` |
| Audit trail | `agent_reference/INLINE_AUDIT_TRAIL.md` |
| Citations | `agent_reference/CITATION_REFERENCE.md` |
| Disclosure | `agent_reference/AI_DISCLOSURE_REFERENCE.md` |
