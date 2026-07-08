// daaf-context-reporter.ts — OMP extension: injects context utilization data.
//
// Ported from .claude/hooks/context-reporter.sh. In Claude Code this hook
// fired on PreToolUse and UserPromptSubmit. In OMP we run it on every
// tool_call event and inject the resulting context utilization as a steering
// message the model can see, so it can make informed decisions about
// delegation, state persistence, and session recovery.
//
// Design: informational only. The hook never blocks — this extension always
// allows the tool call to proceed. If the hook emits context data on stdout
// (a JSON envelope carrying `additionalContext`), we steer with that text.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { runHook, preToolUsePayload } from "./daaf-hook-runner.ts";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Context Reporter");

  pi.on("tool_call", async (event) => {
    // Build the PreToolUse JSON payload the shell hook expects, tagging it as
    // a PreToolUse event so the hook's dispatch takes the injection branch.
    const base = JSON.parse(preToolUsePayload(event.toolName, event.input));
    base.hook_event_name = "PreToolUse";
    const payload = JSON.stringify(base);

    const result = await runHook("context-reporter.sh", payload);

    const stdout = result.stdout.trim();
    if (stdout) {
      pi.sendMessage(stdout, { deliverAs: "steer" });
    }
  });
}
