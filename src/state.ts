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

    for (const [key, value] of Object.entries(rule.properties)) {
      outputLines.push(`  ${key} = ${value}`);
    }

    if (rule.implicitInputs.length > 0) {
      outputLines.push(
        `  # with implicit inputs: ${rule.implicitInputs.join(" ")}`
      );
    }
  }

  outputLines.push("");

  for (const build of builds) {
    outputLines.push(`# build for '${build.output}' from ${build.source}`);
    let line = `build ${build.output}: ${build.rule} ${build.inputs.join(" ")}`;

    const ruleForBuild = rules[build.rule];
    const implicitInputs = [
      ...build.implicitInputs,
      ...ruleForBuild.implicitInputs,
    ];

    if (implicitInputs.length > 0) {
      line += " | " + implicitInputs.join(" ");
    }

    outputLines.push(line);

    for (const [name, value] of Object.entries(build.ruleVariables)) {
      outputLines.push(`  ${name} = ${value}`);
    }
  }

  return outputLines.join("\n") + "\n";
}
