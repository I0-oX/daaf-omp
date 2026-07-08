// daaf-enforce-model-ceiling.ts — OMP extension: blocks subagent dispatches
// whose model tier exceeds the session model tier.
//
// Ported from .claude/hooks/enforce-model-ceiling.sh. The ceiling logic stays
// in the shell hook (resolved deterministically from the transcript and agent
// frontmatter); this extension is a thin adapter that:
//   1. Intercepts OMP `tool_call` events for the `task` tool (subagent dispatch)
//   2. Builds the PreToolUse JSON payload the shell hook expects
//   3. Runs the hook and returns { block: true, reason } when the hook DENIES
//
// BLOCK SIGNAL — read this carefully:
// The shell hook is a *fail-open* cost guard, not a fail-closed safety hook.
// Its contract (documented in the hook header) is:
//   Allow: exit 0, NO stdout JSON.
//   Deny:  emit { permissionDecision: "deny", permissionDecisionReason: "…" }
//          on stdout and exit 0 (the hook itself succeeded; the JSON carries
//          the block decision to the orchestrator).
// The hook NEVER exits 2 — every uncertain/bookkeeping-failure path ALLOWS via
// exit 0. Therefore blocking must be driven by the hook's stdout JSON, not by
// exit code. (The exit-2 branch below is a defensive parity fallback in case a
// future hook revision adopts the fail-closed convention; it is not produced by
// the current hook.) A non-zero, non-2 exit with no deny JSON is treated as
// fail-open allow, matching the hook's deliberate rationale.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook, preToolUsePayload } from "./daaf-hook-runner.ts";

interface HookDecision {
  hookSpecificOutput?: {
    permissionDecision?: string;
    permissionDecisionReason?: string;
  };
}

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Enforce Model Ceiling");

  pi.on("tool_call", async (event) => {
    if (event.toolName !== "task") return;

    const payload = preToolUsePayload("Task", event.input);
    const result = await runHook("enforce-model-ceiling.sh", payload);

    // Fail-closed fallback: a revised hook that fail-CLOSES would exit 2 with
    // the reason on stderr (the convention used by the DAAF safety hooks).
    if (result.code === 2) {
      return {
        block: true,
        reason: result.stderr.trim() || "Blocked by DAAF enforce-model-ceiling hook",
      };
    }

    // Primary deny signal for THIS hook: a permissionDecision=deny JSON on
    // stdout, emitted on exit 0.
    if (result.code === 0 && result.stdout.trim()) {
      try {
        const decision = JSON.parse(result.stdout) as HookDecision;
        const out = decision.hookSpecificOutput;
        if (out && out.permissionDecision === "deny") {
          return {
            block: true,
            reason:
              out.permissionDecisionReason?.trim() ||
              "Subagent model tier exceeds the session model ceiling",
          };
        }
      } catch {
        // stdout was not the expected decision JSON; ignore (fail-open).
      }
    }
    // Any other outcome (exit 0 with no JSON, or unexpected non-zero without a
    // deny decision) is treated as ALLOW, per the hook's fail-open rationale.
  });
}
