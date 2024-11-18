import * as os from "quickjs:os";
import * as engine from "quickjs:engine";
import { makeState, renderState, State } from "./state";
import { Api, makeApi } from "./script-api";
import { addPrimordials } from "./primordials";

export class Shinobi {
  state: State;
  api: Api;

  private _workDir: string;

  constructor(cwd: string = os.getcwd()) {
    this.state = makeState();
    this.api = makeApi(this.state);
    addPrimordials(this.state);
    this._workDir = cwd;
  }

  load(filename: string) {
    // Make the script API available to scripts as globals
    Object.assign(globalThis, this.api);

    this.state.currentFile = filename;

    engine.importModule(filename, `${this._workDir}/<shinobi>`);

    this.state.currentFile = null;
  }

  render(): string {
    return renderState(this.state);
  }
}
