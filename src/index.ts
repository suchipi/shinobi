#!/usr/bin/env node
import makeModuleEnv from "make-module-env";
import path from "path";
import { makeState, WriteMode, renderState } from "./state";
import { makeApi } from "./api";
import { addPrimordials, cleanPrimordials } from "./primordials";
import { times } from "./util";

const modEnv = makeModuleEnv(path.join(process.cwd(), "<shinobi cli>"));

function clearRequireCache() {
  for (const key in require.cache) {
    delete modEnv.require.cache[key];
  }
}

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

  Object.assign(globalThis, state.public, api);

  addPrimordials(state);

  // First pass: vars. 3 times in case some vars depend on other vars.
  times(3, () => {
    for (const file of files) {
      state.private.writeMode = WriteMode.VARS;
      state.private.currentFile = file;
      load(file);
    }

    clearRequireCache();
  });

  // Second pass: rules (which depend on vars)
  for (const file of files) {
    state.private.writeMode = WriteMode.RULES;
    state.private.currentFile = file;
    load(file);
  }
  clearRequireCache();

  // Third pass: builds (which depend on vars and rules)
  for (const file of files) {
    state.private.writeMode = WriteMode.BUILDS;
    state.private.currentFile = file;
    load(file);
  }

  cleanPrimordials(state);

  const output = renderState(state);
  console.log(output);
}

main(process.argv.slice(2));
