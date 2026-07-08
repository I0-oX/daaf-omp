// daaf-archive-session.ts — OMP extension: archives the session transcript on exit.
//
// Ported from .claude/hooks/archive-session.sh. The archival logic stays in the
// shell hook; this extension is a thin adapter that:
//   1. Intercepts OMP `session_shutdown` events
//   2. Builds the JSON payload the shell hook expects (session path + cwd)
//   3. Runs the hook fire-and-forget — archival is observability-only, never
//      blocks shutdown and never overrides the result.
//
// Design: fail-open. Archival must not interfere with session teardown, so we
// do not await the hook and ignore its outcome.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Archive Session");

  pi.on("session_shutdown", async (_event, ctx) => {
    const sessionPath = ctx?.sessionManager?.getSessionFile?.() ?? "";
    const payload = JSON.stringify({
      session_id: "",
      transcript_path: sessionPath,
      cwd: process.cwd(),
      reason: "session_end",
    });

    // Fire-and-forget: do not block shutdown, do not override.
    void runHook("archive-session.sh", payload);
  });
}
