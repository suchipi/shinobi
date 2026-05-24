import * as clefairy from "clefairy";

export type Flags = {
  help?: boolean;
  h?: boolean;
  out?: clefairy.Path;
  o?: clefairy.Path;
  pathSeparator?: string;
};

export const USAGE =
  `
shinobi - Generate ninja build files from JS scripts

Usage: shinobi [options] <scripts...>
Options:
  --help, -h: Show this text
  --out, -o: Output path (defaults to stdout)
  --path-separator: The path separator to use in all places where string paths
                    are synthesized. Defaults to "\\" on Windows and "/" on
                    other platforms.
Examples:
  shinobi defs.js rules.js programs.js > build.ninja
  shinobi mybuild.js -o build.ninja
  shinobi ninja/**/*.js -o build.ninja
Notes:
  Add this comment to the top of your JS scripts to get intellisense in VS Code:
  /// <reference types="@suchipi/shinobi/globals.d.ts" />
      `.trim() + "\n";
