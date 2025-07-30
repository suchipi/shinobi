import path from "path";
import { State } from "./state";
import { RuntimeDelegate } from "./runtime-delegate";

export type Api = ReturnType<typeof makeApi>;

export type Value =
  | string
  | boolean
  | number
  | undefined
  | null
  | Array<string | boolean | number | undefined | null>;

function stringifyValue(input: Value): null | string {
  if (input == null) {
    return null;
  } else if (Array.isArray(input)) {
    return input.filter((value) => value != null).join(" ");
  } else {
    return String(input);
  }
}

function arrayifyValue(input: Value): Array<string> {
  if (Array.isArray(input)) {
    return input
      .map((value) => stringifyValue(value))
      .filter((value) => value != null) as Array<string>;
  } else {
    const stringified = stringifyValue(input);
    if (stringified == null) {
      return [];
    } else {
      return [stringified];
    }
  }
}

function objectifyValues(input: { [key: string]: Value }): {
  [key: string]: string;
} {
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [key, stringifyValue(value)])
      .filter(([key, value]) => value != null),
  );
}

export function makeApi(state: State, runtimeDelegate: RuntimeDelegate) {
  const { vars, builds, rules } = state;

  function declare(name: string, value: Value) {
    if (name === "in" || name === "out") {
      throw new Error(
        `'${name}' is a reserved variable name in ninja (used for rule ${name}puts)`,
      );
    }

    if (vars[name]) {
      throw new Error(
        `Attempt to redefine variable '${name}' in '${state.currentFile}'. Variable was previously defined in '${vars[name].source}'.`,
      );
    }

    vars[name] = {
      name,
      value: stringifyValue(value) ?? "",
      source: state.currentFile!,
    };

    return name;
  }

  function overrideDeclaration(name: string, value: Value) {
    if (name === "in" || name === "out") {
      throw new Error(
        `'${name}' is a reserved variable name in ninja (used for rule ${name}puts)`,
      );
    }

    if (!Object.prototype.hasOwnProperty.call(vars, name)) {
      throw new Error(
        `Attempting to override declaration of variable '${name}' in '${state.currentFile}', but variable was never previously defined. Use 'declare' instead.`,
      );
    }

    vars[name] = {
      name,
      value: stringifyValue(value) ?? "",
      source: state.currentFile!,
    };

    return name;
  }

  function declareOrAppend(name: string, value: Value, sep: string = " ") {
    if (name === "in" || name === "out") {
      throw new Error(
        `'${name}' is a reserved variable name in ninja (used for rule ${name}puts)`,
      );
    }

    const stringified = stringifyValue(value);
    const existing = vars[name];
    if (existing) {
      if (stringified) {
        existing.value += sep + stringified;
      } else {
        // Don't append anything
      }
    } else {
      declare(name, value);
    }

    return name;
  }

  function rule(name: string, properties: { [key: string]: Value }) {
    if (rules[name]) {
      throw new Error(
        `Attempt to redefine rule '${name}' in '${state.currentFile}'. Rule was previously defined in '${rules[name].source}'.`,
      );
    }

    if (!properties.command) {
      throw new Error(
        `No command specified for rule '${name}'. Command is required.`,
      );
    }

    const { implicitInputs, ...others } = properties;

    rules[name] = {
      name,
      properties: objectifyValues(others),
      implicitInputs: arrayifyValue(implicitInputs),
      source: state.currentFile!,
    };

    return name;
  }

  function build(config: {
    output: string;
    rule: string;
    inputs: Value;
    implicitInputs?: Value;
    ruleVariables?: { [name: string]: Value };
  }) {
    const {
      output,
      rule,
      inputs,
      implicitInputs = [],
      ruleVariables = {},
    } = config;

    if (typeof output !== "string") {
      throw new Error("output should be a string");
    }

    if (rule == null) {
      throw new Error("rule was null or undefined");
    }

    builds.push({
      output,
      rule,
      inputs: arrayifyValue(inputs),
      implicitInputs: arrayifyValue(implicitInputs),
      ruleVariables: objectifyValues(ruleVariables),
      source: state.currentFile!,
    });

    return output;
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
    const results = runtimeDelegate.globSync(patterns, options);
    return results;
  }

  function getVar(name: string): string | null {
    const maybeVar = vars[name];
    if (maybeVar) {
      return maybeVar.value;
    } else {
      return null;
    }
  }

  return {
    declare,
    overrideDeclaration,
    declareOrAppend,
    getVar,
    rule,
    build,
    rel,
    builddir,
    env,
    glob,
  };
}
