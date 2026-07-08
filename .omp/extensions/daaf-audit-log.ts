// daaf-audit-log.ts — OMP extension: fire-and-forget audit logging of tool calls.
//
// Ported from .claude/hooks/audit-log.sh. The logging logic stays in the
// shell hook (it writes an append-only JSONL audit trail); this extension is
// a thin adapter that:
//   1. Intercepts OMP `tool_result` events (PostToolUse equivalent)
//   2. Builds the PostToolUse JSON payload the shell hook expects
//   3. Runs the hook for its side effect (logging only)
//
// Design: fire-and-forget. The hook always exits 0 and must never block
// execution, so we run it without returning any block/override and discard
// the result.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook, postToolUsePayload } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Audit Log");

  pi.on("tool_result", async (event) => {
    const payload = postToolUsePayload(event.content);
    // Audit logging is fire-and-forget: never block, never patch output.
    // Discard the result — the hook always exits 0.
    void runHook("audit-log.sh", payload);
  });
}
