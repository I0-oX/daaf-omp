// daaf-statusline.ts — OMP extension that replaces DAAF's context-bar.sh statusline.
//
// DAAF's original context-bar.sh was a Claude Code statusline command that read
// session JSON from stdin and output an ANSI-colored status bar. OMP extensions
// set persistent status via `ctx.ui.setStatus(key, text)` — this extension
// replicates the same information: model, working directory, git branch, and
// a context-utilization indicator derived from the context-reporter cache.
//
// Updated on session_start and on each tool_call (the same cadence the original
// hook used). The status line is sanitized by OMP's status line handler (ANSI
// escapes stripped, whitespace collapsed), so we emit plain text segments.
//
// This is a visual aid only — it never blocks or modifies tool behavior.

import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

export default function (pi: ExtensionAPI): void {
  pi.setLabel("DAAF Statusline");

  async function updateStatus(ctx: { cwd?: string; model?: { id?: string; name?: string }; ui: { setStatus?: (key: string, text: string) => void }; hasUI?: boolean }): Promise<void> {
    if (!ctx.hasUI || !ctx.ui?.setStatus) return;

    const modelId = ctx.model?.name ?? ctx.model?.id ?? "?";
    const cwd = ctx.cwd ?? process.cwd();

    // Derive a short directory label from cwd
    const dirLabel = cwd.split("/").pop() || cwd;

    // Read context utilization from the DAAF cache (written by context-reporter.sh).
    // Format: "UTIL:<pct>:" — best-effort; absent cache means NOMINAL.
    let ctxIndicator = "";
    try {
      const proc = Bun.spawn(["bash", "-c", "cat /tmp/claude-ctx-window-* 2>/dev/null | tail -1"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const out = await new Response(proc.stdout).text();
      const pct = parseInt(out.trim(), 10);
      if (!isNaN(pct) && pct > 0) {
        const barLen = 20;
        const filled = Math.round((pct / 100) * barLen);
        const bar = "█".repeat(filled) + "░".repeat(barLen - filled);
        const label = pct >= 75 ? "CRIT" : pct >= 60 ? "HIGH" : pct >= 40 ? "ELEV" : "OK";
        ctxIndicator = ` | ctx ${bar} ${pct}% ${label}`;
      }
    } catch {
      // Cache absent — no utilization data yet, that's fine.
    }

    // Read git branch (best-effort, non-fatal if not a git repo)
    let branch = "";
    try {
      const proc = Bun.spawn(["bash", "-c", `cd "${cwd}" 2>/dev/null && git branch --show-current 2>/dev/null`], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const out = await new Response(proc.stdout).text();
      branch = out.trim();
      if (branch) branch = ` (${branch})`;
    } catch {
      // Not a git repo — skip branch display.
    }

    const text = `DAAF | ${modelId} | ${dirLabel}${branch}${ctxIndicator}`;
    ctx.ui.setStatus("daaf-statusline", text);
  }

  pi.on("session_start", async (_event, ctx) => {
    await updateStatus(ctx);
  });

  pi.on("tool_call", async (_event, ctx) => {
    await updateStatus(ctx);
  });

  pi.on("tool_result", async (_event, ctx) => {
    await updateStatus(ctx);
  });
}
