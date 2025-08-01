export type RuntimeDelegate = {
  getCwd(): string;
  runFileSync(filename: string): void;
  writeStdout(content: string): void;
  writeFileSync(filename: string, content: string): void;
  globSync(patterns: string | Array<string>, options?: any): Array<string>;
};

export function makeNodeJsRuntimeDelegate(
  cwdOverride?: string,
): RuntimeDelegate {
  const cwd = cwdOverride ?? process.cwd();

  const { makeModuleEnv } =
    require("make-module-env") as typeof import("make-module-env");
  const path = require("path") as typeof import("path");
  const fs = require("fs") as typeof import("fs");
  const tinyglobby = require("tinyglobby") as typeof import("tinyglobby");

  const modEnv = makeModuleEnv(path.join(cwd, "<shinobi>"));

  return {
    getCwd() {
      return cwd;
    },
    runFileSync(filename: string) {
      if (path.isAbsolute(filename)) {
        modEnv.require(filename);
      } else {
        modEnv.require("./" + filename);
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
