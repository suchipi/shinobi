import { expect, test } from "vitest";
import { makeState, renderState } from "../src/state";
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

  declare("cc", "gcc");
  declare("ar", "gcc-ar");
  declare("cflags", "-Wall");
  declare("ldflags", "");
  declare("libs", "-lm");

  declareOrAppend("libs", "-lpthread");
  declareOrAppend("cflags", "-g");

  expect(getVar("cflags")).toBe("-Wall -g");

  rule("cc", {
    command: "$cc $cflags $in -o $out",
    description: "CC $out",
  });

  rule("ar", {
    command: "rm -f $out && $ar crs $out $in",
    description: "AR $out",
  });

  rule("link", {
    command: "$cc $ldflags -o $out $in $libs",
    description: "CC $out",
  });

  build({
    output: builddir("something.o"),
    inputs: [rel("something.c")],
    rule: "cc",
  });

  build({
    output: builddir("something_else.o"),
    inputs: [rel("something_else.c")],
    rule: "cc",
  });

  build({
    output: builddir("myprog.o"),
    inputs: [rel("myprog.c")],
    rule: "cc",
  });

  build({
    output: builddir("myprog"),
    inputs: [builddir("something.o"), builddir("myprog.o")],
    rule: "link",
  });

  build({
    output: builddir("somethings.a"),
    inputs: [builddir("something.o"), builddir("something_else.o")],
    rule: "ar",
  });

  rule("something_with_args", {
    command: "cat $in > $out && echo $message >> $out",
    description: "SOMETHING_WITH_ARGS $out",
  });

  build({
    output: builddir("hi.txt"),
    inputs: [rel("something.txt")],
    rule: "something_with_args",
    ruleVariables: {
      message: "hi",
    },
  });

  expect(renderState(state)).toMatchInlineSnapshot(`
    "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from /tmp/blah.test/something.js
    cc = gcc
    # variable 'ar' from /tmp/blah.test/something.js
    ar = gcc-ar
    # variable 'cflags' from /tmp/blah.test/something.js
    cflags = -Wall -g
    # variable 'ldflags' from /tmp/blah.test/something.js
    ldflags = 
    # variable 'libs' from /tmp/blah.test/something.js
    libs = -lm -lpthread

    # rule 'cc' from /tmp/blah.test/something.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from /tmp/blah.test/something.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from /tmp/blah.test/something.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from /tmp/blah.test/something.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from /tmp/blah.test/something.js
    build $builddir/something.o: cc /tmp/blah.test/something.c
    # build for '$builddir/something_else.o' from /tmp/blah.test/something.js
    build $builddir/something_else.o: cc /tmp/blah.test/something_else.c
    # build for '$builddir/myprog.o' from /tmp/blah.test/something.js
    build $builddir/myprog.o: cc /tmp/blah.test/myprog.c
    # build for '$builddir/myprog' from /tmp/blah.test/something.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from /tmp/blah.test/something.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from /tmp/blah.test/something.js
    build $builddir/hi.txt: something_with_args /tmp/blah.test/something.txt
      message = hi
    "
  `);
});
