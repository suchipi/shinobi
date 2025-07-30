#!/usr/bin/env node
import fs from "node:fs";
import * as clefairy from "clefairy";
import { Shinobi } from "./node-api";

clefairy.run(
  {
    help: clefairy.optionalBoolean,
    h: clefairy.optionalBoolean,
    out: clefairy.optionalPath,
    o: clefairy.optionalPath,
  },
  async function main(flags, ...files) {
    if (flags.help || flags.h) {
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
      `.trim(),
      );
      return;
    }

    const shinobi = new Shinobi();

    for (const file of files) {
      shinobi.load(file);
    }

    const output = shinobi.render();

    const outputPath = flags.out || flags.o;
    if (outputPath) {
      fs.writeFileSync(outputPath.toString(), output);
    } else {
      process.stdout.write(output);
    }
  },
);
