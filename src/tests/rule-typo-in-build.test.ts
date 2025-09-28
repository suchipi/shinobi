import { expect, test } from "vitest";
import { Shinobi } from "..";

test("rule typo in build declaration", () => {
  const shinobi = new Shinobi(undefined, "/");
  const { state, api } = shinobi;

  const {
    build,
    builddir,
    declare,
    declareOrAppend,
    overrideDeclaration,
    env,
    getVar,
    glob,
    rel,
    rule,
  } = api;

  state.currentFile = "/tmp/myplace/something.js";

  declare("cc", "gcc");
  declare("ar", "gcc-ar");
  declare("cflags", "-Wall");
  declare("ldflags", "");
  declare("libs", "-lm");

  declareOrAppend("libs", "-lpthread");
  declareOrAppend("cflags", "-g");

  rule("cc", {
    command: "$cc $cflags $in -o $out",
    description: "CC $out",
  });

  rule("ar", {
    command: "rm -f $out && $ar crs $out $in",
    description: "AR $out",
  });

  build({
    output: builddir("something.o"),
    inputs: [rel("something.c")],
    rule: "cc",
  });

  build({
    output: builddir("something_else.o"),
    inputs: [rel("something_else.c")],
    rule: "ccc", // typo!
  });

  expect(() => shinobi.render()).toThrowErrorMatchingInlineSnapshot(
    `[Error: Build for "$builddir/something_else.o" asked for rule "ccc", but no such rule had been defined! The rules we had were: ["cc","ar"].]`,
  );
});
