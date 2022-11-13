import path from "path";
import globby from "globby";
import { State } from "./state";

export type Api = ReturnType<typeof makeApi>;

export function makeApi(state: State) {
  const { vars, builds, rules } = state;

  function declare(name: string, value: string) {
    if (vars[name]) {
      throw new Error(
        `Attempt to redefine variable '${name}' in '${state.currentFile}'. Variable was previously defined in '${vars[name].source}'.`
      );
    }

    vars[name] = {
      name,
      value,
      source: state.currentFile!,
    };
  }

  function declareOrAppend(name: string, value: string, sep: string = " ") {
    const existing = vars[name];
    if (existing) {
      existing.value += sep + value;
    } else {
      declare(name, value);
    }
  }

  function rule(
    name: string,
    opts: {
      command: string | Array<string>;
      description?: string | Array<string>;
    }
  ) {
    if (rules[name]) {
      throw new Error(
        `Attempt to redefine rule '${name}' in '${state.currentFile}'. Rule was previously defined in '${rules[name].source}'.`
      );
    }

    if (!opts.command) {
      throw new Error(
        `No command specified for rule '${name}'. Command is required.`
      );
    }

    if (Array.isArray(opts.command)) {
      if (opts.command.some((entry) => entry == null)) {
        throw new Error(
          `null or undefined command component specified. This is not allowed. Received: ${JSON.stringify(
            opts.command
          )}`
        );
      }
    }

    if (Array.isArray(opts.description)) {
      if (opts.description.some((entry) => entry == null)) {
        throw new Error(
          `null or undefined description component specified. This is not allowed. Received: ${JSON.stringify(
            opts.description
          )}`
        );
      }
    }

    rules[name] = {
      name,
      command: opts.command,
      description: opts.description,
      source: state.currentFile!,
    };
  }

  function build(
    output: string,
    rule: string,
    inputs: Array<string>,
    implicitInputs: Array<string> = []
  ) {
    if (typeof output !== "string") {
      throw new Error("output should be a string");
    }

    if (rule == null) {
      throw new Error("rule was null or undefined");
    }

    if (!Array.isArray(inputs)) {
      throw new Error("inputs should be an array");
    }

    if (inputs.some((input) => typeof input !== "string")) {
      throw new Error(
        `an element in the inputs array wasn't a string. received: ${JSON.stringify(
          inputs
        )}`
      );
    }

    if (!Array.isArray(implicitInputs)) {
      throw new Error("implicitInputs should be an array");
    }

    if (implicitInputs.some((input) => typeof input !== "string")) {
      throw new Error(
        `an element in the implicitInputs array wasn't a string. received: ${JSON.stringify(
          implicitInputs
        )}`
      );
    }

    builds.push({
      output,
      rule,
      inputs,
      implicitInputs,
      source: state.currentFile!,
    });
  }

  function rel(somePath?: string): string {
    const dir = path.dirname(state.currentFile!);
    if (somePath) {
      return path.resolve(dir, "./" + somePath);
    } else {
      return dir;
    }
  }

  function builddir(somePath?: string): string {
    if (somePath) {
      return path.join("$builddir", somePath);
    } else {
      return "$builddir";
    }
  }

  const env = process.env;

  function glob(patterns: string | Array<string>, options?: any) {
    const results = globby.sync(patterns, options);
    return results;
  }

  return {
    declare,
    declareOrAppend,
    rule,
    build,
    rel,
    builddir,
    env,
    glob,
  };
}
