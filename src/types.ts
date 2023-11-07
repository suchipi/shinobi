export type Variable = {
  name: string;
  value: string;
  source: string;
};

export type Rule = {
  name: string;
  properties: { [key: string]: string };
  source: string;
  implicitInputs: Array<string>;
};

export type Build = {
  output: string;
  rule: string;
  inputs: Array<string>;
  implicitInputs: Array<string>;
  ruleVariables: { [name: string]: string | number | boolean };
  source: string;
};
