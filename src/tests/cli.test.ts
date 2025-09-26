import { expect, test, describe, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import { spawn } from "first-base";
import {
  rootDir,
  cliPath,
  cleanResult,
  cleanString,
  fixturesDir,
} from "./utils";
import path from "node:path";

test("cli - output to stdout", async () => {
  const run = spawn(
    // current node binary
    process.argv0,
    [
      cliPath,
      "--path-separator",
      "/",
      fixturesDir("env.js"),
      fixturesDir("rules.js"),
      fixturesDir("stuff.js"),
    ],
    { cwd: rootDir() },
  );
  await run.completion;

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from <rootDir>/src/tests/fixtures/env.js
    cc = gcc
    # variable 'ar' from <rootDir>/src/tests/fixtures/env.js
    ar = gcc-ar
    # variable 'cflags' from <rootDir>/src/tests/fixtures/env.js
    cflags = -Wall -g
    # variable 'ldflags' from <rootDir>/src/tests/fixtures/env.js
    ldflags = 
    # variable 'libs' from <rootDir>/src/tests/fixtures/env.js
    libs = -lm -lpthread
    # variable 'dotexe' from <rootDir>/src/tests/fixtures/env.js
    dotexe = 

    # rule 'cc' from <rootDir>/src/tests/fixtures/rules.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from <rootDir>/src/tests/fixtures/rules.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from <rootDir>/src/tests/fixtures/rules.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from <rootDir>/src/tests/fixtures/rules.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from <rootDir>/src/tests/fixtures/stuff.js
    build $builddir/something.o: cc <rootDir>/src/tests/fixtures/something.c
    # build for '$builddir/something_else.o' from <rootDir>/src/tests/fixtures/stuff.js
    build $builddir/something_else.o: cc <rootDir>/src/tests/fixtures/something_else.c
    # build for '$builddir/myprog.o' from <rootDir>/src/tests/fixtures/stuff.js
    build $builddir/myprog.o: cc <rootDir>/src/tests/fixtures/myprog.c
    # build for '$builddir/myprog' from <rootDir>/src/tests/fixtures/stuff.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from <rootDir>/src/tests/fixtures/stuff.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from <rootDir>/src/tests/fixtures/stuff.js
    build $builddir/hi.txt: something_with_args <rootDir>/src/tests/fixtures/something.txt
      message = hi
    ",
    }
  `);
});

describe("writing output to file", () => {
  const cliOutputTxt = rootDir("dist/tests/cli-output.txt");

  beforeEach(() => {
    if (fs.existsSync(cliOutputTxt)) {
      fs.unlinkSync(cliOutputTxt);
    }
    fs.mkdirSync(path.dirname(cliOutputTxt), { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(cliOutputTxt)) {
      fs.unlinkSync(cliOutputTxt);
    }
  });

  test("via -o", async () => {
    const run = spawn(
      // current node binary
      process.argv0,
      [
        cliPath,
        "--path-separator",
        "/",
        fixturesDir("env.js"),
        fixturesDir("rules.js"),
        fixturesDir("stuff.js"),
        "-o",
        cliOutputTxt,
      ],
      { cwd: rootDir() },
    );
    await run.completion;

    expect(cleanResult(run.result)).toMatchInlineSnapshot(`
      {
        "code": 0,
        "error": false,
        "stderr": "",
        "stdout": "",
      }
    `);

    const cliOutput = fs.readFileSync(cliOutputTxt, "utf-8");
    expect(cleanString(cliOutput)).toMatchInlineSnapshot(`
      "# variable 'builddir' from builtin (override with env var BUILDDIR)
      builddir = ./build
      # variable 'cc' from <rootDir>/src/tests/fixtures/env.js
      cc = gcc
      # variable 'ar' from <rootDir>/src/tests/fixtures/env.js
      ar = gcc-ar
      # variable 'cflags' from <rootDir>/src/tests/fixtures/env.js
      cflags = -Wall -g
      # variable 'ldflags' from <rootDir>/src/tests/fixtures/env.js
      ldflags = 
      # variable 'libs' from <rootDir>/src/tests/fixtures/env.js
      libs = -lm -lpthread
      # variable 'dotexe' from <rootDir>/src/tests/fixtures/env.js
      dotexe = 

      # rule 'cc' from <rootDir>/src/tests/fixtures/rules.js
      rule cc
        command = $cc $cflags $in -o $out
        description = CC $out
      # rule 'ar' from <rootDir>/src/tests/fixtures/rules.js
      rule ar
        command = rm -f $out && $ar crs $out $in
        description = AR $out
      # rule 'link' from <rootDir>/src/tests/fixtures/rules.js
      rule link
        command = $cc $ldflags -o $out $in $libs
        description = CC $out
      # rule 'something_with_args' from <rootDir>/src/tests/fixtures/rules.js
      rule something_with_args
        command = cat $in > $out && echo $message >> $out
        description = SOMETHING_WITH_ARGS $out

      # build for '$builddir/something.o' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/something.o: cc <rootDir>/src/tests/fixtures/something.c
      # build for '$builddir/something_else.o' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/something_else.o: cc <rootDir>/src/tests/fixtures/something_else.c
      # build for '$builddir/myprog.o' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/myprog.o: cc <rootDir>/src/tests/fixtures/myprog.c
      # build for '$builddir/myprog' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
      # build for '$builddir/somethings.a' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
      # build for '$builddir/hi.txt' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/hi.txt: something_with_args <rootDir>/src/tests/fixtures/something.txt
        message = hi
      "
    `);
  });

  test("via --out", async () => {
    const run = spawn(
      // current node binary
      process.argv0,
      [
        cliPath,
        "--path-separator",
        "/",
        fixturesDir("env.js"),
        fixturesDir("rules.js"),
        fixturesDir("stuff.js"),
        "--out",
        cliOutputTxt,
      ],
      { cwd: rootDir() },
    );
    await run.completion;

    expect(cleanResult(run.result)).toMatchInlineSnapshot(`
      {
        "code": 0,
        "error": false,
        "stderr": "",
        "stdout": "",
      }
    `);

    const cliOutput = fs.readFileSync(cliOutputTxt, "utf-8");
    expect(cleanString(cliOutput)).toMatchInlineSnapshot(`
      "# variable 'builddir' from builtin (override with env var BUILDDIR)
      builddir = ./build
      # variable 'cc' from <rootDir>/src/tests/fixtures/env.js
      cc = gcc
      # variable 'ar' from <rootDir>/src/tests/fixtures/env.js
      ar = gcc-ar
      # variable 'cflags' from <rootDir>/src/tests/fixtures/env.js
      cflags = -Wall -g
      # variable 'ldflags' from <rootDir>/src/tests/fixtures/env.js
      ldflags = 
      # variable 'libs' from <rootDir>/src/tests/fixtures/env.js
      libs = -lm -lpthread
      # variable 'dotexe' from <rootDir>/src/tests/fixtures/env.js
      dotexe = 

      # rule 'cc' from <rootDir>/src/tests/fixtures/rules.js
      rule cc
        command = $cc $cflags $in -o $out
        description = CC $out
      # rule 'ar' from <rootDir>/src/tests/fixtures/rules.js
      rule ar
        command = rm -f $out && $ar crs $out $in
        description = AR $out
      # rule 'link' from <rootDir>/src/tests/fixtures/rules.js
      rule link
        command = $cc $ldflags -o $out $in $libs
        description = CC $out
      # rule 'something_with_args' from <rootDir>/src/tests/fixtures/rules.js
      rule something_with_args
        command = cat $in > $out && echo $message >> $out
        description = SOMETHING_WITH_ARGS $out

      # build for '$builddir/something.o' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/something.o: cc <rootDir>/src/tests/fixtures/something.c
      # build for '$builddir/something_else.o' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/something_else.o: cc <rootDir>/src/tests/fixtures/something_else.c
      # build for '$builddir/myprog.o' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/myprog.o: cc <rootDir>/src/tests/fixtures/myprog.c
      # build for '$builddir/myprog' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
      # build for '$builddir/somethings.a' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
      # build for '$builddir/hi.txt' from <rootDir>/src/tests/fixtures/stuff.js
      build $builddir/hi.txt: something_with_args <rootDir>/src/tests/fixtures/something.txt
        message = hi
      "
    `);
  });
});
