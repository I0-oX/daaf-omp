// daaf-output-scanner.ts — OMP extension: scans tool output for leaked secrets.
//
// Ported from .claude/hooks/output-scanner.sh. The detection logic stays in the
// shell hook (battle-tested regex); this extension is a thin adapter that:
//   1. Intercepts OMP `tool_result` events
//   2. Builds the PostToolUse JSON payload the shell hook expects
//   3. Runs the hook and, on any stdout, appends the warnings to the result
//
// Design: never blocking. PostToolUse hooks must not stop execution, so the
// original content is always preserved and warnings are appended only.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook, postToolUsePayload } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Output Scanner");

  pi.on("tool_result", async (event) => {
    const payload = postToolUsePayload(event.content);
    const result = await runHook("output-scanner.sh", payload);

    if (result.stdout.trim()) {
      return {
        content: [
          ...event.content,
          { type: "text", text: result.stdout.trim() },
        ],
      };
    }
  });
}
