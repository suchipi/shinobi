import { expect, test } from "vitest";
import { makeState } from "../src/state";
import { makeApi } from "../src/api";
import { addPrimordials } from "../src/primordials";

test("basic test", () => {
  const state = makeState();
  const api = makeApi(state);
  addPrimordials(state);

  const {
    build,
    builddir,
    declare,
    declareOrAppend,
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
