// daaf-remind-orchestrator.ts — OMP extension: reminds the main session to
// load the daaf-orchestrator skill.
//
// Ported from .claude/hooks/remind-orchestrator.sh. The reminder logic stays
// in the shell hook (battle-tested flag-file detection); this extension is a
// thin adapter that:
//   1. Intercepts the OMP `session_start` event
//   2. Runs the shell hook with empty stdin
//   3. If the hook emits a reminder on stdout, injects it as a steer message
//
// Design: fail-open. The hook always exits 0 (never blocks); a missing flag
// file simply means the reminder is emitted. An error running the hook is
// non-fatal — we just skip the reminder rather than crash session start.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Remind Orchestrator");

  pi.on("session_start", async () => {
    const result = await runHook("remind-orchestrator.sh", "");

    if (result.stdout.trim()) {
      pi.sendMessage(result.stdout.trim(), { deliverAs: "steer" });
    }
  });
}
