import path from "path";
import globby from "globby";
import { State, WriteMode } from "./state";
import { Rule, StringWithVars } from "./types";

export type Api = ReturnType<typeof makeApi>;

export function makeApi(state: State) {
  const { vars, builds, rules } = state.public;

  function declare(name: string, value: string) {
    const mode = state.private.writeMode;
    if (!(mode & WriteMode.VARS)) return;

    vars[name] = {
      name,
      value,
      source: state.private.currentFile!,
    };
  }

  function declareOrAppend(name: string, value: string, sep: string = " ") {
    const mode = state.private.writeMode;
    if (!(mode & WriteMode.VARS)) return;

    const existing = vars[name];
    if (existing) {
      existing.value += sep + value;
    } else {
      declare(name, value);
    }
  }

  function rule(
    name: string,
    opts: { command: StringWithVars; description?: StringWithVars }
  ) {
    const mode = state.private.writeMode;

    if (!(mode & WriteMode.RULES)) return;

    if (rules[name]) {
      throw new Error(`There's already a rule named ${name}`);
    }

    rules[name] = {
      name,
      command: opts.command,
      description: opts.description,
      source: state.private.currentFile!,
    };
  }

  function build(
    output: string,
    rule: Rule,
    inputs: Array<string>,
    implicitInputs: Array<string> = []
  ) {
    const mode = state.private.writeMode;
    if (!(mode & WriteMode.BUILDS)) return;

    builds.push({
      output,
      rule,
      inputs,
      implicitInputs,
      source: state.private.currentFile!,
    });
  }

  function rel(somePath?: string): string {
    const dir = path.dirname(state.private.currentFile!);
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
