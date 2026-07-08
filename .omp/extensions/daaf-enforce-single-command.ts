// daaf-enforce-single-command.ts — OMP extension: blocks chained Bash commands.
//
// Ported from .claude/hooks/enforce-single-command.sh. The chain-detection
// logic stays in the shell hook (battle-tested awk state machine); this
// extension is a thin adapter that:
//   1. Intercepts OMP `tool_call` events for the `bash` tool
//   2. Builds the PreToolUse JSON payload the shell hook expects
//   3. Runs the hook and returns { block: true, reason } when it exits 2
//
// Design: fail-closed. The shell hook exits 2 on any internal error (ERR trap)
// or missing jq, so unexpected failures block execution rather than allow it.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook, preToolUsePayload } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Enforce Single Command");

  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;

    const command = (event.input as { command?: string }).command;
    if (!command) return;

    const payload = preToolUsePayload("Bash", { command });
    const result = await runHook("enforce-single-command.sh", payload);

    if (result.code === 2) {
      return {
        block: true,
        reason: result.stderr.trim() || "Blocked by DAAF enforce-single-command hook",
      };
    }
    // code 0 = allow. Non-zero non-2 is unexpected; the shell hook fail-closes
    // to 2 on error, so this should not happen. Fail open only for 0.
    if (result.code !== 0 && result.stdout.trim()) {
      // Some hooks emit warnings to stdout on exit 0; surface nothing blocking.
    }
  });
}
