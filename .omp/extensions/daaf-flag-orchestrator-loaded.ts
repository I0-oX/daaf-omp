// daaf-flag-orchestrator-loaded.ts — OMP extension: flags when the
// daaf-orchestrator skill loads.
//
// Ported from .claude/hooks/flag-orchestrator-loaded.sh. The skill-detection
// logic stays in the shell hook (it inspects the session and skill name);
// this extension is a thin adapter that:
//   1. Intercepts OMP `tool_result` events (PostToolUse)
//   2. Builds the PostToolUse JSON payload the shell hook expects
//   3. Runs the hook fire-and-forget (it never blocks; exit code ignored)
//
// Design: fire-and-forget. The shell hook always exits 0, so we don't await
// its result for control flow — we just ensure it runs on every tool result.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook, postToolUsePayload } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Flag Orchestrator");

  pi.on("tool_result", async (event) => {
    const payload = postToolUsePayload(event.content);
    // Fire-and-forget: the shell script decides internally whether to set the
    // flag. We don't block on its result.
    void runHook("flag-orchestrator-loaded.sh", payload);
  });
}
