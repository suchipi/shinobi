declare type StringWithVars = string | Array<string | Variable>;

declare type Variable = {
  name: string;
  value: string;
};

declare type Rule = {
  name: string;
  command: StringWithVars;
  description?: StringWithVars;
};

declare type Build = {
  output: string;
  rule: Rule;
  inputs: Array<string>;
  implicitInputs: Array<string>;
};

declare var vars: Record<string, Variable>;
declare var rules: Record<string, Rule>;
declare var builds: Array<Build>;

declare function declare(name: string, value: string): void;

declare function declareOrAppend(
  name: string,
  value: string,
  sep?: string
): void;

declare function rule(
  name: string,
  opts: { command: StringWithVars; description?: StringWithVars }
): void;

declare function build(
  output: string,
  rule: Rule,
  inputs: Array<string>,
  implicitInputs?: Array<string>
): void;

declare function rel(path?: string): string;

declare function builddir(path?: string): string;

declare const env: { [key: string]: string | null | undefined };
