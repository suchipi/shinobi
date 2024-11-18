import { Path } from "./Path";

export function basename(path: string | Path): string {
  if (typeof path !== "string") {
    path = path.toString();
  }

  const parts = Path.splitToSegments(path);
  return parts[parts.length - 1];
}
