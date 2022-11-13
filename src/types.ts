export type Variable = {
  name: string;
  value: string;
  source: string;
};

export type Rule = {
  name: string;
  command: string | Array<string>;
  description?: string | Array<string>;
  source: string;
};

export type Build = {
  output: string;
  rule: string;
  inputs: Array<string>;
  implicitInputs: Array<string>;
  source: string;
};
