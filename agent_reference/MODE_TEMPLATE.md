# Mode Template

Use this template when adding a new engagement mode to the DAAF orchestrator. A mode defines a distinct workflow pattern triggered by a specific category of user request.

> **Comprehensive checklist:** The full registration-point checklist for modes (21 items, mandatory and conditional) is in `agent_reference/FRAMEWORK_INTEGRATION_CHECKLIST.md` § 3. The abbreviated checklist below covers the essential steps; use the comprehensive checklist for production-quality mode additions.

## Adding a New Mode: Abbreviated Checklist

### Mandatory (every new mode)

1. Create mode reference file at `.omp/skills/daaf-orchestrator/references/{mode-name}-mode.md` using the structure below
2. Update orchestrator `SKILL.md` (9 registration points):
   - [ ] YAML frontmatter `description` — update mode count
   - [ ] Expanded Orientation bullet — update mode count + add mode description
   - [ ] Engagement Mode Classification intro — update count word
   - [ ] Mode Decision Framework tree — add new branch
   - [ ] Mode Summary Table — add new row
   - [ ] Confirmation Templates by Mode — add new template block
   - [ ] Mode Escalation Paths — add rows (both FROM and TO the new mode)
   - [ ] Reference File Index — add new row
   - [ ] Documentation Loading Decision Tree — add new branch
3. Add mode-specific boundaries to `agent_reference/BOUNDARIES.md` > Mode-Specific Boundaries
4. Update `README.md` — document the mode and when to use it
5. Update root `README.md` / `.omp/AGENTS.md` orientation text if the mode changes the public surface of DAAF-on-OMP
6. Add mode-specific AI disclosure guidance to `agent_reference/AI_DISCLOSURE_REFERENCE.md`
7. Update session recovery in `.omp/skills/daaf-orchestrator/references/session-recovery.md`

### Conditional

8. Add mode-specific references to `.omp/skills/daaf-orchestrator/references/full-pipeline-mode.md` or the relevant `*-mode.md` only when that mode’s DAG needs it (dispatch is OMP `task`)
9. (OMP owns error recovery / state / session archiving / compaction — do not reintroduce deleted STATE/ERROR templates)
10. Update `AGENTS.md` Reference Files table (if a new template file is created)
11. Update contribution docs (if present and the mode affects contribution workflow)
12. Prefer extending `README.md` FAQs over reintroducing a `user_reference/` tree; this port does not ship `user_reference/`

---

## Mode Reference File Structure

```markdown
# [Mode Name] Mode

[1-2 sentence description of when this mode is used and what it produces.]

## User Orientation

After mode confirmation, briefly orient the user. Key points:

- [What the mode does, in plain language]
- [What the user will receive]
- [How many checkpoints / what level of user interaction to expect]
- [Key constraint or characteristic (e.g., "read-only", "new version created")]

**When to skip:** User has indicated familiarity, or [mode-specific skip condition].

**For more detail:** Consult `{BASE_DIR}/README.md` and `.omp/skills/daaf-orchestrator/SKILL.md`.

---

## [Mode Name] Workflow

[ASCII flowchart showing the stage sequence. Use the box-and-arrow style
consistent with other mode files (┌─┐, │, └─┘, ▼, ★ for checkpoints).
Show user checkpoints explicitly.]

---

## Subagent Invocation

[Dispatch logic: when the orchestrator responds directly vs. dispatches.
Which agents are used, what subagent types, what context to provide.
Include a Standard Agent Prompt Structure template if the mode has
a dedicated agent (like framework-engineer for Framework Development).

If the mode dispatches more than one subagent in a turn via workflowz (`task` batch), add a wave barrier discipline note: mid-wave completion notifications are status-only — do not synthesize, advance the workflow, or present user checkpoints until EVERY dispatched agent has returned. See `SKILL.md` § Subagent Coordination > "Wave Barrier Discipline (Async Dispatch)" and `SKILL.md` > "OMP Tool Integration (workflowz)" for the canonical statement. Use the blockquote convention from existing mode reference files.

---

## Output Format

[Template or table of what the mode delivers to the user. If outputs
vary by request type, use a table mapping request types to outputs.]

---

## Boundaries

[Mode-specific constraints — Always Do / Ask First Before / Never Do.
Pointer to agent_reference/BOUNDARIES.md > [Mode Name] Mode.]

---

## Escalation Triggers

[Table of conditions, target modes, and actions. All escalations
require explicit user confirmation.]
```

### Required Design Decisions

When creating a new mode, explicitly document the following:

- **LEARNINGS.md behavior** — Does this mode create LEARNINGS.md? If yes, when (skeleton vs. full)? If no, document the exemption and where equivalent observations go. If the mode produces reusable insights, it should participate in the LEARNINGS.md lifecycle. Reference existing patterns: Full Pipeline (mandatory, gated at G4 and G12), Data Onboarding (mandatory, initialized at DI-2), Ad Hoc Collaboration (optional, only if reusable insights emerge), Reproducibility Verification (exempt — observations go in Reproduction Report).

### Optional Sections (include when applicable)

- **Orchestrator Skill Loading** — if the orchestrator loads skills directly (exception to standard pattern)
- **Workspace Setup** — if the mode creates or uses a workspace folder
- **Session Notes and Continuity** — if the mode uses SESSION_NOTES.md or a custom state mechanism
- **User Treatment** — if the mode has specific tone/treatment guidance (e.g., "treat as advanced")
- **Session Wrap-Up** — if the mode has a specific wrap-up protocol

---

## Exemplar Mode References

When creating a new mode, read 1-2 existing mode files as structural exemplars:

| Exemplar | Best for | Why |
|----------|----------|-----|
| `full-pipeline-mode.md` | Modes with formal stages, gates, and QA | Most comprehensive — PSU templates, gate definitions, invocation templates, error budgets |
| `data-onboarding-mode.md` | Modes with subagent dispatch and multi-phase profiling | Clear workflow diagram, detailed PSU templates, checkpoint-based user interaction |
| `ad-hoc-collaboration-mode.md` | Lightweight modes with flexible dispatch loops | SESSION_NOTES.md pattern, deferred workspace, direct skill loading exception |
| `framework-development-mode.md` | Modes with mandatory review passes and adaptive design | Adaptive Phase 2, mandatory multi-angle review, integration checklist pattern |

---

## Mode Design Principles

- Each mode should have a **clear, non-overlapping trigger condition** — test against all existing modes' triggers
- Mode workflows should be a **subset of or complement to** the Full Pipeline stages
- All modes require the **Mode Confirmation Protocol** before proceeding (HARD GATE, no exceptions)
- All modes include a **User Orientation** section presented after confirmation (skippable for familiar users)
- Modes should **specify their outputs explicitly** — both the primary deliverable and any supporting artifacts
- **Boundary definitions** prevent mode scope from creeping into other modes' territory
- **Escalation paths** must be bidirectional where applicable (both FROM and TO the new mode)
- The **confirmation template** in SKILL.md should include a "What to Expect" preview with deliverables, checkpoints, and estimated interactions
- Consider the mode's **session state mechanism** — does it need STATE.md, SESSION_NOTES.md, or a custom document?
- Consider the mode's **error recovery pattern** — what kinds of errors are likely and how should they be handled?

---

## Mode Naming Conventions

- Mode reference files: `{kebab-case-mode-name}-mode.md` (e.g., `framework-development-mode.md`)
- Mode names in prose: Title Case with spaces (e.g., "Framework Development")
- Mode names in tables: **Bold** Title Case (e.g., **Framework Development**)

---

## Post-Creation Verification

After completing the checklist, verify:

1. **Count consistency:** Grep for the old count word (e.g., "seven") across all framework files — should be zero occurrences
2. **Cross-references resolve:** Every file path mentioned in the new mode reference file exists
3. **Escalation paths are bidirectional:** Both the "from" and "to" modes in the escalation table acknowledge the path
4. **Confirmation template ends with a question:** The template in SKILL.md must end with an explicit confirmation question in bold
5. **Decision tree branch is correctly positioned:** More specific triggers appear earlier to prevent misclassification
