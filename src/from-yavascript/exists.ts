import * as os from "quickjs:os";
import { Path } from "./Path";
import { appendSlashIfWindowsDriveLetter } from "./_win32Helpers";

export function exists(path: string | Path): boolean {
  if (typeof path !== "string") {
    path = path.toString();
  }

  path = appendSlashIfWindowsDriveLetter(path);

  try {
    os.access(path, os.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}
