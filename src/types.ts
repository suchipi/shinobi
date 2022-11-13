export type StringWithVars = string | Array<string | Variable>;

export type Variable = {
  name: string;
  value: string;
  source: string;
};

export type Rule = {
  name: string;
  command: StringWithVars;
  description?: StringWithVars;
  source: string;
};

export type Build = {
  output: string;
  rule: Rule;
  inputs: Array<string>;
  implicitInputs: Array<string>;
  source: string;
};
