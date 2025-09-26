import { expect, test } from "vitest";
import { Shinobi } from "..";

test("implicit inputs on rule are inherited by builds using that rule", () => {
  const shinobi = new Shinobi(undefined, {
    apiPathSeparator: "/",
    fsPathSeparator: "/",
  });
  const { state, api } = shinobi;

  const { build, rule } = api;

  state.currentFile = "/tmp/blah.test/something.js";

  rule("echo", {
    command: "echo $in > $out",
    description: "echo to $out",
  });

  rule("myscript", {
    command: "myscript.sh -i $in -o $out",
    description: "myscript $out",
    implicitInputs: "myscript.sh",
  });

  rule("myscript-with-config", {
    command: "myscript.sh --config config.json -i $in -o $out",
    description: "myscript $out",
    implicitInputs: ["myscript.sh", "config.json"],
  });

  build({
    rule: "echo",
    inputs: "hello there",
    output: "blah.txt",
  });

  build({
    rule: "myscript",
    inputs: "something.txt",
    output: "out.txt",
  });

  build({
    rule: "myscript-with-config",
    inputs: "something2.txt",
    output: "out2.txt",
  });

  expect(shinobi.render()).toMatchInlineSnapshot(`
    "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build

    # rule 'echo' from /tmp/blah.test/something.js
    rule echo
      command = echo $in > $out
      description = echo to $out
    # rule 'myscript' from /tmp/blah.test/something.js
    rule myscript
      command = myscript.sh -i $in -o $out
      description = myscript $out
      # with implicit inputs: myscript.sh
    # rule 'myscript-with-config' from /tmp/blah.test/something.js
    rule myscript-with-config
      command = myscript.sh --config config.json -i $in -o $out
      description = myscript $out
      # with implicit inputs: myscript.sh config.json

    # build for 'blah.txt' from /tmp/blah.test/something.js
    build blah.txt: echo hello there
    # build for 'out.txt' from /tmp/blah.test/something.js
    build out.txt: myscript something.txt | myscript.sh
    # build for 'out2.txt' from /tmp/blah.test/something.js
    build out2.txt: myscript-with-config something2.txt | myscript.sh config.json
    "
  `);
});
