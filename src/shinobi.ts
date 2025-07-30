import { makeState, renderState, State } from "./state";
import { Api, makeApi } from "./script-api";
import { addPrimordials } from "./primordials";
import { makeNodeJsRuntimeDelegate, RuntimeDelegate } from "./runtime-delegate";

const RUNTIME_DELEGATE = Symbol("RUNTIME_DELEGATE");

export class Shinobi {
  state: State;
  api: Api;

  private [RUNTIME_DELEGATE]: RuntimeDelegate;

  constructor(cwd?: string);
  constructor(runtimeDelegate?: RuntimeDelegate);
  constructor(arg: any) {
    let runtimeDelegate: RuntimeDelegate;
    if (typeof arg === "string") {
      const cwd: string = arg;
      runtimeDelegate = makeNodeJsRuntimeDelegate(cwd);
    } else if (arg != null) {
      runtimeDelegate = arg;
    } else {
      runtimeDelegate = makeNodeJsRuntimeDelegate();
    }

    this.state = makeState();
    this.api = makeApi(this.state);
    this[RUNTIME_DELEGATE] = runtimeDelegate;
    addPrimordials(this.state);
  }

  load(filename: string) {
    // Make the script API available to scripts as globals
    Object.assign(globalThis, this.api);

    this.state.currentFile = filename;

    this[RUNTIME_DELEGATE].runFileSync(filename);

    this.state.currentFile = null;
  }

  render(): string {
    return renderState(this.state);
  }
}
