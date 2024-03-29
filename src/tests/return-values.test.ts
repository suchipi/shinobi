import { expect, test } from "vitest";
import { Shinobi } from "..";

test("return values", () => {
  const shinobi = new Shinobi();
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

  state.currentFile = "/tmp/blah.test/something.js";

  const ccVar = declare("cc", "gcc");
  expect(ccVar).toBe("cc");

  const libs = declareOrAppend("libs", "-lpthread");
  expect(libs).toBe("libs");

  const ccVar2 = overrideDeclaration("cc", "clang");
  expect(ccVar2).toBe("cc");

  const ccRule = rule("cc", {
    command: "$cc $cflags $in -o $out",
    description: "CC $out",
  });
  expect(ccRule).toBe("cc");

  const arRule = rule("ar", {
    command: "rm -f $out && $ar crs $out $in",
    description: "AR $out",
  });
  expect(arRule).toBe("ar");

  const buildRet = build({
    output: builddir("something.o"),
    inputs: [rel("something.c")],
    rule: "cc",
  });
  expect(buildRet).toBe("$builddir/something.o");
});
