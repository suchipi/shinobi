import * as os from "quickjs:os";
import { Path } from "./Path";

export function pwd(): Path {
  return new Path(os.getcwd());
}

const initialPwd = pwd();
Object.freeze(initialPwd);
Object.freeze(initialPwd.segments);
Object.defineProperty(initialPwd, "separator", {
  configurable: false,
  writable: false,
  enumerable: true,

  value: initialPwd.separator,
});

Object.defineProperty(pwd, "initial", {
  configurable: false,
  writable: false,
  enumerable: true,

  value: initialPwd,
});
