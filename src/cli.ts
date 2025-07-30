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
  },
  ...files: Array<string>
) {
  main({
    flags,
    files,
    runtimeDelegate: makeNodeJsRuntimeDelegate(),
  });
}

clefairy.run(
  {
    help: clefairy.optionalBoolean,
    h: clefairy.optionalBoolean,
    out: clefairy.optionalPath,
    o: clefairy.optionalPath,
  },
  nodeJsCliMain,
);
