import { expect, test } from "vitest";
import { Shinobi } from "..";

test("basic test", () => {
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

  expect(getVar("cflags")).toBe("-Wall");

  declareOrAppend("libs", "-lpthread");
  declareOrAppend("cflags", "-g");

  declare("dotexe", ".exe");

  expect(getVar("dotexe")).toBe(".exe");

  overrideDeclaration("dotexe", "");

  expect(getVar("dotexe")).toBe("");

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

  expect(shinobi.render()).toMatchInlineSnapshot(`
    "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from /tmp/myplace/something.js
    cc = gcc
    # variable 'ar' from /tmp/myplace/something.js
    ar = gcc-ar
    # variable 'cflags' from /tmp/myplace/something.js
    cflags = -Wall -g
    # variable 'ldflags' from /tmp/myplace/something.js
    ldflags = 
    # variable 'libs' from /tmp/myplace/something.js
    libs = -lm -lpthread
    # variable 'dotexe' from /tmp/myplace/something.js
    dotexe = 

    # rule 'cc' from /tmp/myplace/something.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from /tmp/myplace/something.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from /tmp/myplace/something.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from /tmp/myplace/something.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from /tmp/myplace/something.js
    build $builddir/something.o: cc /tmp/myplace/something.c
    # build for '$builddir/something_else.o' from /tmp/myplace/something.js
    build $builddir/something_else.o: cc /tmp/myplace/something_else.c
    # build for '$builddir/myprog.o' from /tmp/myplace/something.js
    build $builddir/myprog.o: cc /tmp/myplace/myprog.c
    # build for '$builddir/myprog' from /tmp/myplace/something.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from /tmp/myplace/something.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from /tmp/myplace/something.js
    build $builddir/hi.txt: something_with_args /tmp/myplace/something.txt
      message = hi
    "
  `);
});

test("cwd override", () => {
  const shinobi = new Shinobi("/tmp/myplace", "/");
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

  expect(getVar("cflags")).toBe("-Wall");

  declareOrAppend("libs", "-lpthread");
  declareOrAppend("cflags", "-g");

  declare("dotexe", ".exe");

  expect(getVar("dotexe")).toBe(".exe");

  overrideDeclaration("dotexe", "");

  expect(getVar("dotexe")).toBe("");

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

  expect(shinobi.render()).toMatchInlineSnapshot(`
    "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from /tmp/myplace/something.js
    cc = gcc
    # variable 'ar' from /tmp/myplace/something.js
    ar = gcc-ar
    # variable 'cflags' from /tmp/myplace/something.js
    cflags = -Wall -g
    # variable 'ldflags' from /tmp/myplace/something.js
    ldflags = 
    # variable 'libs' from /tmp/myplace/something.js
    libs = -lm -lpthread
    # variable 'dotexe' from /tmp/myplace/something.js
    dotexe = 

    # rule 'cc' from /tmp/myplace/something.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from /tmp/myplace/something.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from /tmp/myplace/something.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from /tmp/myplace/something.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from /tmp/myplace/something.js
    build $builddir/something.o: cc /tmp/myplace/something.c
    # build for '$builddir/something_else.o' from /tmp/myplace/something.js
    build $builddir/something_else.o: cc /tmp/myplace/something_else.c
    # build for '$builddir/myprog.o' from /tmp/myplace/something.js
    build $builddir/myprog.o: cc /tmp/myplace/myprog.c
    # build for '$builddir/myprog' from /tmp/myplace/something.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from /tmp/myplace/something.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from /tmp/myplace/something.js
    build $builddir/hi.txt: something_with_args /tmp/myplace/something.txt
      message = hi
    "
  `);
});

test("windows-style paths", () => {
  const shinobi = new Shinobi("C:\\users\\me\\myplace", "\\");
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

  state.currentFile = "C:\\users\\me\\myplace\\something.js";

  declare("cc", "gcc");
  declare("ar", "gcc-ar");
  declare("cflags", "-Wall");
  declare("ldflags", "");
  declare("libs", "-lm");

  expect(getVar("cflags")).toBe("-Wall");

  declareOrAppend("libs", "-lpthread");
  declareOrAppend("cflags", "-g");

  declare("dotexe", ".exe");

  expect(getVar("dotexe")).toBe(".exe");

  overrideDeclaration("dotexe", "");

  expect(getVar("dotexe")).toBe("");

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

  expect(shinobi.render()).toMatchInlineSnapshot(`
    "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from C:\\users\\me\\myplace\\something.js
    cc = gcc
    # variable 'ar' from C:\\users\\me\\myplace\\something.js
    ar = gcc-ar
    # variable 'cflags' from C:\\users\\me\\myplace\\something.js
    cflags = -Wall -g
    # variable 'ldflags' from C:\\users\\me\\myplace\\something.js
    ldflags = 
    # variable 'libs' from C:\\users\\me\\myplace\\something.js
    libs = -lm -lpthread
    # variable 'dotexe' from C:\\users\\me\\myplace\\something.js
    dotexe = 

    # rule 'cc' from C:\\users\\me\\myplace\\something.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from C:\\users\\me\\myplace\\something.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from C:\\users\\me\\myplace\\something.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from C:\\users\\me\\myplace\\something.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir\\something.o' from C:\\users\\me\\myplace\\something.js
    build $builddir\\something.o: cc C$:\\users\\me\\myplace\\something.c
    # build for '$builddir\\something_else.o' from C:\\users\\me\\myplace\\something.js
    build $builddir\\something_else.o: cc C$:\\users\\me\\myplace\\something_else.c
    # build for '$builddir\\myprog.o' from C:\\users\\me\\myplace\\something.js
    build $builddir\\myprog.o: cc C$:\\users\\me\\myplace\\myprog.c
    # build for '$builddir\\myprog' from C:\\users\\me\\myplace\\something.js
    build $builddir\\myprog: link $builddir\\something.o $builddir\\myprog.o
    # build for '$builddir\\somethings.a' from C:\\users\\me\\myplace\\something.js
    build $builddir\\somethings.a: ar $builddir\\something.o $builddir\\something_else.o
    # build for '$builddir\\hi.txt' from C:\\users\\me\\myplace\\something.js
    build $builddir\\hi.txt: something_with_args C$:\\users\\me\\myplace\\something.txt
      message = hi
    "
  `);
});
