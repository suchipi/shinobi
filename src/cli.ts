#!/usr/bin/env node
import * as clefairy from "clefairy";
import { main } from "./main";
import { makeNodeJsRuntimeDelegate } from "./runtime-delegate";

export async function nodeJsCliMain(
  flags: {
    help?: boolean;
    h?: boolean;
    out?: clefairy.Path;
    o?: clefairy.Path;
    fsPathSeparator?: string;
    apiPathSeparator?: string;
  },
  ...files: Array<string>
) {
  main({
    flags,
    files,
    runtimeDelegate: makeNodeJsRuntimeDelegate(undefined, {
      fsPathSeparator: flags.fsPathSeparator,
      apiPathSeparator: flags.apiPathSeparator,
    }),
  });
}

clefairy.run(
  {
    help: clefairy.optionalBoolean,
    h: clefairy.optionalBoolean,
    out: clefairy.optionalPath,
    o: clefairy.optionalPath,
    fsPathSeparator: clefairy.optionalString,
    apiPathSeparator: clefairy.optionalString,
  },
  nodeJsCliMain,
);
