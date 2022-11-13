import { State } from "./state";

export function addPrimordials(state: State) {
  const vars = state.vars;

  // Synthetic variables for rules to use
  vars.in = { name: "in", value: "", source: "builtin" };
  vars.out = { name: "out", value: "", source: "builtin" };

  // Variable used by `builddir` api function
  vars.builddir = {
    name: "builddir",
    value: process.env.BUILDDIR || "./build",
    source: "builtin (override with env var BUILDDIR)",
  };
}

export function cleanPrimordials(state: State) {
  const vars = state.vars;

  // Only present so rules can use them
  delete vars.in;
  delete vars.out;
}
