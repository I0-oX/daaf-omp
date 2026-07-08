// daaf-hook-runner.ts — Shared helper that runs DAAF shell hooks from OMP extensions.
//
// DAAF's shell hooks (ported from Claude Code) expect JSON on stdin:
//   PreToolUse:  { tool_name, tool_input: { command, ... } }
//   PostToolUse: { tool_response: "..." }
//
// Exit codes (Claude Code PreToolUse convention, preserved):
//   0 = allow / pass-through; stdout content may carry warnings to inject
//   2 = BLOCK (stderr is the block reason shown to the model)
//
// OMP extension events provide the same data under different field names.
// This helper bridges the two so each extension stays a thin adapter.

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the .omp/hooks directory relative to this module so the wrapper
// works regardless of the session cwd.
const HOOKS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "hooks",
);

export interface HookResult {
  stdout: string;
  stderr: string;
  code: number;
}

/**
 * Run a DAAF shell hook, piping `jsonInput` to its stdin.
 * Resolves with captured stdout, stderr, and exit code.
 */
export async function runHook(
  scriptName: string,
  jsonInput: string,
): Promise<HookResult> {
  const scriptPath = resolve(HOOKS_DIR, scriptName);

  const proc = Bun.spawn(["bash", scriptPath], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  // Write stdin via Bun's WritableStream .write() (not getWriter, which is the
  // web-streams API not exposed on Bun's stdin pipe) and close it to signal EOF.
  const encoded = new TextEncoder().encode(jsonInput);
  proc.stdin.write(encoded);
  await proc.stdin.end();

  // Read stdout/stderr and await exit concurrently with Promise.withResolvers.
  const stdoutPromise = new Response(proc.stdout).text();
  const stderrPromise = new Response(proc.stderr).text();
  const { promise, resolve: done } = Promise.withResolvers<HookResult>();
  void proc.exited.then((code) => {
    Promise.all([stdoutPromise, stderrPromise]).then(([stdout, stderr]) => {
      done({ stdout, stderr, code });
    });
  });
  return promise;
}

/**
 * Build the PreToolUse JSON payload that DAAF shell hooks expect for a Bash
 * tool call. Field names match the original Claude Code contract.
 */
export function preToolUsePayload(
  toolName: string,
  input: Record<string, unknown>,
): string {
  return JSON.stringify({ tool_name: toolName, tool_input: input });
}

/**
 * Build the PostToolUse JSON payload from an OMP tool_result event.
 * The shell hooks read `.tool_response` as a string; OMP gives structured
 * content, so we flatten text chunks into a single string.
 */
export function postToolUsePayload(
  content: Array<{ type: string; text?: string } | Record<string, unknown>>,
): string {
  const text = content
    .map((chunk) => {
      const c = chunk as { type?: string; text?: string };
      return c?.type === "text" ? (c.text ?? "") : JSON.stringify(chunk);
    })
    .join("\n");
  return JSON.stringify({ tool_response: text });
}
