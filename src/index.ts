#!/usr/bin/env node
import makeModuleEnv from "make-module-env";
import path from "path";
import { makeState, renderState } from "./state";
import { makeApi } from "./api";
import { addPrimordials } from "./primordials";

const modEnv = makeModuleEnv(path.join(process.cwd(), "<shinobi cli>"));

function load(file: string) {
  if (path.isAbsolute(file)) {
    modEnv.require(file);
  } else {
    modEnv.require("./" + file);
  }
}

function main(files: Array<string>) {
  const state = makeState();
  const api = makeApi(state);

  Object.assign(globalThis, api);

  addPrimordials(state);

  for (const file of files) {
    state.currentFile = file;
    load(file);
  }

  const output = renderState(state);
  console.log(output);
}

main(process.argv.slice(2));
