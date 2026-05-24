#!/usr/bin/env node
import * as clefairy from "clefairy";
import { main } from "./main";
import { makeNodeJsRuntimeDelegate } from "./runtime-delegate";
import { Flags } from "./flags";

export async function nodeJsCliMain(flags: Flags, ...files: Array<string>) {
  main({
    flags,
    files,
    runtimeDelegate: makeNodeJsRuntimeDelegate(undefined, flags.pathSeparator),
  });
}

clefairy.run(
  {
    help: clefairy.optionalBoolean,
    h: clefairy.optionalBoolean,
    out: clefairy.optionalPath,
    o: clefairy.optionalPath,
    pathSeparator: clefairy.optionalString,
  },
  nodeJsCliMain,
);
