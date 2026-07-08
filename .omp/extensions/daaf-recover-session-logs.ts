// daaf-recover-session-logs.ts — OMP extension: SessionStart crash recovery + activity logging.
//
// Ported from .claude/hooks/recover-session-logs.sh. The recovery and logging
// logic stays in the shell hook (observability, fail-open); this extension is a
// thin adapter that:
//   1. Intercepts OMP `session_start` events
//   2. Runs the shell hook with minimal/empty stdin
//   3. Fire-and-forget: session start is never blocked (the hook exits 0 always)
//
// Design: fire-and-forget. We do not await the hook result, so session startup
// latency is unaffected. The shell hook itself backgrounds the heavy recovery
// work.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Recover Session Logs");

  pi.on("session_start", () => {
    // Fire-and-forget: run the recovery/activity hook without blocking startup.
    void runHook("recover-session-logs.sh", "");
  });
}
