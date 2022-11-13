import { StringWithVars } from "./types";

export function renderStringWithVars(input: StringWithVars, sep: string = " ") {
  if (typeof input === "string") {
    return input;
  }

  return input
    .map((item) => {
      if (typeof item === "string") {
        return item;
      } else {
        return "$" + item.name;
      }
    })
    .join(sep);
}

export function times(num: number, callback: () => void) {
  if (num < 1) {
    throw new Error("number passed to 'times' must be >=1");
  }

  for (let i = 0; i < num; i++) {
    callback();
  }
}
