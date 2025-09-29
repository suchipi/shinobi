import { Path } from "nice-path";
import * as t from "pheno";
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

const t_Value = t.union(
  t.string,
  t.boolean,
  t.number,
  t.undefined,
  t.null,
  t.arrayOf(t.union(t.string, t.boolean, t.number, t.undefined, t.null)),
);

const t_ValueObject = t.record(t.string, t_Value);

function valueToStringOrNull(input: Value): null | string {
  if (input == null) {
    return null;
  } else if (Array.isArray(input)) {
    return input.filter((value) => value != null).join(" ");
  } else {
    return String(input);
  }
}

function valueToStringsArray(input: Value): Array<string> {
  if (Array.isArray(input)) {
    return input
      .map((value) => valueToStringOrNull(value))
      .filter((value) => value != null) as Array<string>;
  } else {
    const stringified = valueToStringOrNull(input);
    if (stringified == null) {
      return [];
    } else {
      return [stringified];
    }
  }
}

function valuesObjectToStringsObject(input: { [key: string]: Value }): {
  [key: string]: string;
} {
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [key, valueToStringOrNull(value)])
      .filter(([key, value]) => value != null),
  );
}

export function makeApi(state: State, runtimeDelegate: RuntimeDelegate) {
  const { vars, builds, rules } = state;
  const pathSeparator = runtimeDelegate.getPathSeparator();

  function declare(name: string, value: Value) {
    t.assertType(name, t.string);
    t.assertType(value, t_Value);

    if (name === "in" || name === "out") {
      throw new Error(
        `'${name}' is a reserved variable name in ninja (used for rule ${name}puts)`,
      );
    }

    if (vars[name]) {
      throw new Error(
        `Attempt to redeclare variable '${name}' in '${state.currentFile}'. Variable was previously declared in '${vars[name].source}'. Maybe instead you want to use 'declareOrAppend', or 'overrideDeclaration'?`,
      );
    }

    vars[name] = {
      name,
      value: valueToStringOrNull(value) ?? "",
      source: state.currentFile!,
    };

    return name;
  }

  function overrideDeclaration(name: string, value: Value) {
    t.assertType(name, t.string);
    t.assertType(value, t_Value);

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
      value: valueToStringOrNull(value) ?? "",
      source: state.currentFile!,
    };

    return name;
  }

  function declareOrAppend(name: string, value: Value, sep: string = " ") {
    t.assertType(name, t.string);
    t.assertType(value, t_Value);
    t.assertType(sep, t.string);

    if (name === "in" || name === "out") {
      throw new Error(
        `'${name}' is a reserved variable name in ninja (used for rule ${name}puts)`,
      );
    }

    const stringified = valueToStringOrNull(value);
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
    t.assertType(name, t.string);
    t.assertType(properties, t_ValueObject);

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
      properties: valuesObjectToStringsObject(others),
      implicitInputs: valueToStringsArray(implicitInputs),
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

    t.assertType(output, t.string);
    t.assertType(rule, t.string);
    t.assertType(inputs, t_Value);
    t.assertType(implicitInputs, t_Value);
    t.assertType(ruleVariables, t_ValueObject);

    builds.push({
      output,
      rule,
      inputs: valueToStringsArray(inputs),
      implicitInputs: valueToStringsArray(implicitInputs),
      ruleVariables: valuesObjectToStringsObject(ruleVariables),
      source: state.currentFile!,
    });

    return output;
  }

  function rel(somePath?: string): string {
    t.assertType(somePath, t.maybe(t.string));

    const currentFilePath = new Path(state.currentFile!);
    currentFilePath.separator = pathSeparator;
    const dir = currentFilePath.dirname();
    if (somePath) {
      return dir.concat(somePath).normalize().toString();
    } else {
      return dir.toString();
    }
  }

  function builddir(somePath?: string): string {
    t.assertType(somePath, t.maybe(t.string));

    if (somePath) {
      const builddirPath = new Path("$builddir");
      builddirPath.separator = pathSeparator;
      return builddirPath.concat(somePath).toString();
    } else {
      return "$builddir";
    }
  }

  const env = process.env;

  function glob(patterns: string | Array<string>, options?: any) {
    t.assertType(patterns, t.union(t.string, t.arrayOf(t.string)));

    const results = runtimeDelegate.globSync(patterns, options);
    const resultsWithSeparator = results.map((result) => {
      const path = new Path(result);
      path.separator = pathSeparator;
      return path.toString();
    });
    return resultsWithSeparator;
  }

  function getVar(name: string): string | null {
    t.assertType(name, t.string);

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
