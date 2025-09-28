import { makeState, renderState, State } from "./state";
import { Api, makeApi } from "./script-api";
import { addPrimordials } from "./primordials";
import { makeNodeJsRuntimeDelegate, RuntimeDelegate } from "./runtime-delegate";
import { Path } from "nice-path";

const RUNTIME_DELEGATE = Symbol("RUNTIME_DELEGATE");

export class Shinobi {
  state: State;
  api: Api;

  private [RUNTIME_DELEGATE]: RuntimeDelegate;

  constructor(cwdOverride?: string, pathSeparatorOverride?: string);
  constructor(runtimeDelegate?: RuntimeDelegate);
  constructor(...args: Array<any>) {
    let runtimeDelegate: RuntimeDelegate;
    if (args.length === 2) {
      const [cwd, separators] = args;
      runtimeDelegate = makeNodeJsRuntimeDelegate(cwd, separators);
    } else if (args.length === 1) {
      const arg = args[0];
      if (typeof arg === "string") {
        runtimeDelegate = makeNodeJsRuntimeDelegate(arg);
      } else if (arg != null) {
        runtimeDelegate = arg;
      } else {
        runtimeDelegate = makeNodeJsRuntimeDelegate();
      }
    } else {
      runtimeDelegate = makeNodeJsRuntimeDelegate();
    }

    this.state = makeState();
    this.api = makeApi(this.state, runtimeDelegate);
    this[RUNTIME_DELEGATE] = runtimeDelegate;
    addPrimordials(this.state);
  }

  load(filename: string) {
    // Make the script API available to scripts as globals
    Object.assign(globalThis, this.api);

    const filenamePath = new Path(filename);
    filenamePath.separator = this[RUNTIME_DELEGATE].getPathSeparator();

    this.state.currentFile = filenamePath.toString();

    this[RUNTIME_DELEGATE].runFileSync(filename);

    this.state.currentFile = null;
  }

  render(): string {
    return renderState(this.state);
  }
}
