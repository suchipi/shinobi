import * as std from "quickjs:std";
import { State } from "./state";

export function addPrimordials(state: State) {
  const vars = state.vars;

  // Variable used by `builddir` api function
  vars.builddir = {
    name: "builddir",
    value: std.getenv("BUILDDIR") || "./build",
    source: "builtin (override with env var BUILDDIR)",
  };
}
