import { Path } from "nice-path";

export type PathSeparators = {
  fsPathSeparator: string;
  apiPathSeparator: string;
};

export type RuntimeDelegate = {
  getPathSeparators(): PathSeparators;
  getCwd(): string;
  runFileSync(filename: string): void;
  writeStdout(content: string): void;
  writeFileSync(filename: string, content: string): void;
  globSync(patterns: string | Array<string>, options?: any): Array<string>;
};

export function makeNodeJsRuntimeDelegate(
  cwdOverride?: string,
  pathSeparatorOverride?: Partial<PathSeparators>,
): RuntimeDelegate {
  const { makeModuleEnv } =
    require("make-module-env") as typeof import("make-module-env");
  const fs = require("fs") as typeof import("fs");
  const tinyglobby = require("tinyglobby") as typeof import("tinyglobby");

  function getPathSeparators() {
    const platformSeparator = process.platform === "win32" ? "\\" : "/";
    return {
      fsPathSeparator:
        pathSeparatorOverride?.fsPathSeparator ?? platformSeparator,
      apiPathSeparator:
        pathSeparatorOverride?.apiPathSeparator ?? platformSeparator,
    };
  }

  const separators = getPathSeparators();
  const cwd = cwdOverride ?? process.cwd();
  const cwdPath = new Path(cwd);
  cwdPath.separator = separators.fsPathSeparator;

  const modEnv = makeModuleEnv(cwdPath.concat("<shinobi>").toString());

  return {
    getPathSeparators,
    getCwd() {
      return cwd;
    },
    runFileSync(filename: string) {
      if (Path.isAbsolute(filename)) {
        modEnv.require(filename);
      } else {
        const relativePath = Path.from([
          ".",
          separators.fsPathSeparator,
        ]).concat(filename);

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
