import path from "path";
import makeModuleEnv from "make-module-env";
import { makeState, renderState, State } from "./state";
import { Api, makeApi } from "./script-api";
import { addPrimordials } from "./primordials";

const MODULE_ENV = Symbol("MODULE_ENV");

export class Shinobi {
  state: State;
  api: Api;

  private [MODULE_ENV]: any;

  constructor(cwd: string = process.cwd()) {
    this.state = makeState();
    this.api = makeApi(this.state);
    addPrimordials(this.state);
    this[MODULE_ENV] = makeModuleEnv(path.join(cwd, "<shinobi>"));
  }

  load(filename: string) {
    // Make the script API available to scripts as globals
    Object.assign(globalThis, this.api);

    this.state.currentFile = filename;

    const modEnv = this[MODULE_ENV];

    if (path.isAbsolute(filename)) {
      modEnv.require(filename);
    } else {
      modEnv.require("./" + filename);
    }

    this.state.currentFile = null;
  }

  render(): string {
    return renderState(this.state);
  }
}
