#!/usr/bin/env quickjs-run
import * as std from "quickjs:std";
import { Shinobi } from "./api";

type Flags = {
  help: boolean;
  out?: string;
};

function parseArgv(): [Flags, Array<string>] {
  const flags: Partial<Flags> = {};
  const files: Array<string> = [];

  const len = scriptArgs.length;
  for (let i = 0; i < len; i++) {
    const arg = scriptArgs[i];
    switch (arg) {
      case "--help":
      case "-h": {
        flags.help = true;
        break;
      }
      case "--out":
      case "-o": {
        const nextArg = arg[i + 1];
        if (nextArg == null) {
          throw new Error(
            `'${arg}' requires an argument: the output file path.`
          );
        }
        flags.out = nextArg;
        break;
      }
      default: {
        files.push(arg);
      }
    }
  }

  return [flags as Flags, files];
}

async function main(flags: Flags, ...files: Array<string>) {
  if (flags.help) {
    console.log(
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
      `.trim()
    );
    return;
  }

  const shinobi = new Shinobi();

  for (const file of files) {
    shinobi.load(file);
  }

  const output = shinobi.render();

  const outputPath = flags.out;
  if (outputPath) {
    const file = std.open(outputPath, "w");
    file.puts(output);
    file.close();
  } else {
    std.out.puts(output);
  }
}

try {
  const [flags, files] = parseArgv();
  main(flags, ...files).catch((err) => {
    console.error(err);
    std.exit(1);
  });
} catch (err) {
  console.error(err);
  std.exit(1);
}
