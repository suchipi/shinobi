import { Variable, Rule, Build } from "./types";
import { renderStringWithVars } from "./util";

export type State = ReturnType<typeof makeState>;

export enum WriteMode {
  VARS = 1,
  RULES = 2,
  BUILDS = 4,
}

export function makeState() {
  const vars: Record<string, Variable> = {};
  const rules: Record<string, Rule> = {};
  const builds: Array<Build> = [];

  const writeMode = 0;

  return {
    public: {
      vars,
      rules,
      builds,
    },
    private: {
      currentFile: null as string | null,
      writeMode,
    },
  };
}

export function renderState(state: State): string {
  const { vars, builds, rules } = state.public;

  const outputLines: Array<string> = [];

  for (const variable of Object.values(vars)) {
    outputLines.push(`# variable '${variable.name}' from ${variable.source}`);
    outputLines.push(`${variable.name} = ${variable.value}`);
  }

  outputLines.push("");

  for (const rule of Object.values(rules)) {
    outputLines.push(`# rule '${rule.name}' from ${rule.source}`);
    outputLines.push(`rule ${rule.name}`);
    outputLines.push(`  command = ${renderStringWithVars(rule.command)}`);
    if (rule.description) {
      outputLines.push(
        `  description = ${renderStringWithVars(rule.description)}`
      );
    }
  }

  outputLines.push("");

  for (const build of builds) {
    outputLines.push(`# build for '${build.output}' from ${build.source}`);
    let line = `build ${build.output}: ${build.rule.name} ${build.inputs.join(
      " "
    )}`;
    if (build.implicitInputs.length > 0) {
      line += "| " + build.implicitInputs.join(" ");
    }

    outputLines.push(line);
  }

  return outputLines.join("\n");
}
