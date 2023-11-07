import path from "node:path";
import { pathMarker } from "path-less-traveled";
import type { RunContext } from "first-base";

export const rootDir = pathMarker(path.resolve(__dirname, "../.."));
export const fixturesDir = pathMarker(path.resolve(__dirname, "fixtures"));

export const cliPath = rootDir("dist/cli.js");

export function cleanString(str: string): string {
  return str.replaceAll(rootDir(), "<rootDir>");
}

export function cleanResult(
  result: RunContext["result"]
): RunContext["result"] {
  return {
    ...result,
    stdout: cleanString(result.stdout),
    stderr: cleanString(result.stderr),
  };
}
