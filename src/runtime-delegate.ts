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
  const kame = require("kame") as typeof import("kame");
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
      if (
        process.platform === "win32" &&
        typeof process.env.MSYSTEM === "undefined"
      ) {
        pathSeparator = "\\";
      } else {
        pathSeparator = "/";
      }
    }
  } else {
    if (
      process.platform === "win32" &&
      typeof process.env.MSYSTEM === "undefined"
    ) {
      pathSeparator = "\\";
    } else {
      pathSeparator = "/";
    }
  }

  const cwd = cwdOverride ?? process.cwd();
  const cwdPath = new Path(cwd);
  cwdPath.separator = pathSeparator;
  const cwdWithSeparator = cwdPath.toString();

  const configuredKame = kame.configure({
    resolve(id, fromFilePath) {
      if (fromFilePath.endsWith("/__kame-runtime-load.js")) {
        if (Path.isAbsolute(id) && fs.existsSync(id)) {
          return id;
        } else {
          const absolutePath = cwdPath.concat(id).normalize().toString();
          if (fs.existsSync(absolutePath)) {
            return absolutePath;
          }
        }
      }

      return kame.defaultResolver.resolve(id, fromFilePath);
    },
  });

  const runtime = new configuredKame.Runtime();

  return {
    getPathSeparator() {
      return pathSeparator;
    },
    getCwd() {
      return cwdWithSeparator;
    },
    runFileSync(filename: string) {
      runtime.load(filename);
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
