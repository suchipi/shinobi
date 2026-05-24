import { Shinobi } from "./shinobi";
import type { RuntimeDelegate } from "./runtime-delegate";
import { Flags, USAGE } from "./flags";

export async function main({
  flags,
  files,
  runtimeDelegate,
}: {
  flags: Flags;
  files: Array<string>;
  runtimeDelegate: RuntimeDelegate;
}) {
  if (flags.help || flags.h) {
    runtimeDelegate.writeStdout(USAGE);
    return;
  }

  const shinobi = new Shinobi(runtimeDelegate);

  for (const file of files) {
    shinobi.load(file);
  }

  const output = shinobi.render();

  const outputPath = flags.out || flags.o;
  if (outputPath) {
    if (flags.pathSeparator) {
      outputPath.separator = flags.pathSeparator;
    }
    runtimeDelegate.writeFileSync(outputPath.toString(), output);
  } else {
    runtimeDelegate.writeStdout(output);
  }
}
