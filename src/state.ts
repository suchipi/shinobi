import { Variable, Rule, Build } from "./types";

export type State = ReturnType<typeof makeState>;

export function makeState() {
  const vars: Record<string, Variable> = {};
  const rules: Record<string, Rule> = {};
  const builds: Array<Build> = [];

  return {
    vars,
    rules,
    builds,
    currentFile: null as string | null,
  };
}

export function renderState(state: State): string {
  const { vars, builds, rules } = state;

  const outputLines: Array<string> = [];

  for (const variable of Object.values(vars)) {
    outputLines.push(`# variable '${variable.name}' from ${variable.source}`);
    outputLines.push(`${variable.name} = ${variable.value}`);
  }

  outputLines.push("");

  for (const rule of Object.values(rules)) {
    outputLines.push(`# rule '${rule.name}' from ${rule.source}`);
    outputLines.push(`rule ${rule.name}`);
    outputLines.push(
      `  command = ${
        Array.isArray(rule.command) ? rule.command.join(" ") : rule.command
      }`
    );
    if (rule.description) {
      outputLines.push(
        `  description = ${
          Array.isArray(rule.description)
            ? rule.description.join(" ")
            : rule.description
        }`
      );
    }
  }

  outputLines.push("");

  for (const build of builds) {
    outputLines.push(`# build for '${build.output}' from ${build.source}`);
    let line = `build ${build.output}: ${build.rule} ${build.inputs.join(" ")}`;
    if (build.implicitInputs.length > 0) {
      line += " | " + build.implicitInputs.join(" ");
    }

    outputLines.push(line);

    for (const [name, value] of Object.entries(build.ruleVariables)) {
      outputLines.push(`  ${name} = ${value}`);
    }
  }

  return outputLines.join("\n") + "\n";
}
