import { Path } from "nice-path";

export type RuntimeDelegate = {
  getPathSeparator(): string;
  getCwd(): string;
  runFileSync(filename: string): void;
  writeStdout(content: string): void;
  writeFileSync(filename: string, content: string): void;
  globSync(patterns: string | Array<string>, options?: any): Array<string>;
};

export function makeNodeJsRuntimeDelegate(
  cwdOverride?: string,
  pathSeparatorOverride?: string,
): RuntimeDelegate {
  const { makeModuleEnv } =
    require("make-module-env") as typeof import("make-module-env");
  const fs = require("fs") as typeof import("fs");
  const tinyglobby = require("tinyglobby") as typeof import("tinyglobby");

  let pathSeparator: string;
  if (pathSeparatorOverride != null) {
    pathSeparator = pathSeparatorOverride;
  } else if (cwdOverride != null) {
    let detectedSeparator = Path.detectSeparator(cwdOverride, null);
    if (detectedSeparator != null) {
      pathSeparator = detectedSeparator;
    } else {
      pathSeparator = process.platform === "win32" ? "\\" : "/";
    }
  } else {
    pathSeparator = process.platform === "win32" ? "\\" : "/";
  }

  const cwd = cwdOverride ?? process.cwd();
  const cwdPath = new Path(cwd);
  cwdPath.separator = pathSeparator;
  const cwdWithSeparator = cwdPath.toString();

  const modEnv = makeModuleEnv(cwdPath.concat("<shinobi>").toString());

  return {
    getPathSeparator() {
      return pathSeparator;
    },
    getCwd() {
      return cwdWithSeparator;
    },
    runFileSync(filename: string) {
      if (Path.isAbsolute(filename)) {
        modEnv.require(filename);
      } else {
        const relativePath = Path.from([".", pathSeparator]).concat(filename);

        modEnv.require(relativePath.toString());
      }
    },
    writeStdout(content) {
      process.stdout.write(content);
    },
    writeFileSync(filename, content) {
      fs.writeFileSync(filename, content);
    },
    globSync(patterns, options) {
      return tinyglobby.globSync(patterns, options);
    },
  };
}
