#!/usr/bin/env node
import type * as clefairy from "clefairy";
import { Shinobi } from "./shinobi";
import type { RuntimeDelegate } from "./runtime-delegate";

export async function main({
  flags,
  files,
  runtimeDelegate,
}: {
  flags: {
    help?: boolean;
    h?: boolean;
    out?: clefairy.Path;
    o?: clefairy.Path;
  };
  files: Array<string>;
  runtimeDelegate: RuntimeDelegate;
}) {
  if (flags.help || flags.h) {
    runtimeDelegate.writeStdout(
      `
shinobi - Generate ninja build files from JS scripts

Usage: shinobi [options] <scripts...>
Options:
  --help, -h: Show this text
  --out, -o: Output path (defaults to stdout)
Examples:
  shinobi defs.js rules.js programs.js > build.ninja
  shinobi mybuild.js -o build.ninja
  shinobi ninja/**/*.js -o build.ninja
Notes:
  Add this comment to the top of your JS scripts to get intellisense in VS Code:
  /// <reference types="@suchipi/shinobi/globals.d.ts" />
      `.trim() + "\n",
    );
    return;
  }

  const shinobi = new Shinobi(runtimeDelegate);

  for (const file of files) {
    shinobi.load(file);
  }

  const output = shinobi.render();

  const outputPath = flags.out || flags.o;
  if (outputPath) {
    runtimeDelegate.writeFileSync(outputPath.toString(), output);
  } else {
    runtimeDelegate.writeStdout(output);
  }
}
