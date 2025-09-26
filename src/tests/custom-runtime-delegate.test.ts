/// <reference path="../../globals.d.ts" />

import { expect, test } from "vitest";
import { Path, RuntimeDelegate, Shinobi, main } from "..";

function makeTestRuntimeDelegate() {
  const stdout: Array<string> = [];
  const virtualFs: { [filename: string]: string | Function } = {};
  const globCalls: Array<any /* args */> = [];

  const runtimeDelegate: RuntimeDelegate = {
    getPathSeparators() {
      return {
        fsPathSeparator: "/",
        apiPathSeparator: "/",
      };
    },
    getCwd() {
      return "/tmp/somewhere";
    },
    runFileSync(filename) {
      if (typeof virtualFs[filename] === "function") {
        virtualFs[filename]();
      } else {
        throw new Error(
          "Attempting to run file which isn't in the virtual FS: " + filename,
        );
      }
    },
    writeFileSync(filename, content) {
      virtualFs[filename] = content;
    },
    writeStdout(content) {
      stdout.push(content);
    },
    globSync(patterns, options) {
      globCalls.push([patterns, options]);
      return [];
    },
  };

  return {
    runtimeDelegate,
    stdout,
    virtualFs,
    globCalls,
  };
}

test("as arg to Shinobi constructor", () => {
  const { runtimeDelegate, stdout, virtualFs, globCalls } =
    makeTestRuntimeDelegate();

  const shinobi = new Shinobi(runtimeDelegate);
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

  state.currentFile = "/tmp/somewhere/something.js";

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

  glob("*.*", {});

  expect(shinobi.render()).toMatchInlineSnapshot(`
    "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from /tmp/somewhere/something.js
    cc = gcc
    # variable 'ar' from /tmp/somewhere/something.js
    ar = gcc-ar
    # variable 'cflags' from /tmp/somewhere/something.js
    cflags = -Wall -g
    # variable 'ldflags' from /tmp/somewhere/something.js
    ldflags = 
    # variable 'libs' from /tmp/somewhere/something.js
    libs = -lm -lpthread
    # variable 'dotexe' from /tmp/somewhere/something.js
    dotexe = 

    # rule 'cc' from /tmp/somewhere/something.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from /tmp/somewhere/something.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from /tmp/somewhere/something.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from /tmp/somewhere/something.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from /tmp/somewhere/something.js
    build $builddir/something.o: cc /tmp/somewhere/something.c
    # build for '$builddir/something_else.o' from /tmp/somewhere/something.js
    build $builddir/something_else.o: cc /tmp/somewhere/something_else.c
    # build for '$builddir/myprog.o' from /tmp/somewhere/something.js
    build $builddir/myprog.o: cc /tmp/somewhere/myprog.c
    # build for '$builddir/myprog' from /tmp/somewhere/something.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from /tmp/somewhere/something.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from /tmp/somewhere/something.js
    build $builddir/hi.txt: something_with_args /tmp/somewhere/something.txt
      message = hi
    "
  `);

  expect({ stdout, virtualFs, globCalls }).toMatchInlineSnapshot(`
    {
      "globCalls": [
        [
          "*.*",
          {},
        ],
      ],
      "stdout": [],
      "virtualFs": {},
    }
  `);
});

test("provided to main function", () => {
  const { runtimeDelegate, stdout, virtualFs, globCalls } =
    makeTestRuntimeDelegate();

  virtualFs["/tmp/decls.js"] = () => {
    declare("cc", "gcc");
    declare("ar", "gcc-ar");
    declare("cflags", "-Wall");
    declare("ldflags", "");
    declare("libs", "-lm");

    declareOrAppend("libs", "-lpthread");
    declareOrAppend("cflags", "-g");

    declare("dotexe", ".exe");

    overrideDeclaration("dotexe", "");
  };

  virtualFs["/tmp/rules.js"] = () => {
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

    rule("something_with_args", {
      command: "cat $in > $out && echo $message >> $out",
      description: "SOMETHING_WITH_ARGS $out",
    });
  };

  virtualFs["/tmp/builds.js"] = () => {
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

    build({
      output: builddir("hi.txt"),
      inputs: [rel("something.txt")],
      rule: "something_with_args",
      ruleVariables: {
        message: "hi",
      },
    });

    glob("*.*", {});
  };

  main({
    flags: {},
    files: ["/tmp/decls.js", "/tmp/builds.js", "/tmp/rules.js"],
    runtimeDelegate,
  });

  expect({
    stdout,
    virtualFs,
    globCalls,
  }).toMatchInlineSnapshot(`
    {
      "globCalls": [
        [
          "*.*",
          {},
        ],
      ],
      "stdout": [
        "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from /tmp/decls.js
    cc = gcc
    # variable 'ar' from /tmp/decls.js
    ar = gcc-ar
    # variable 'cflags' from /tmp/decls.js
    cflags = -Wall -g
    # variable 'ldflags' from /tmp/decls.js
    ldflags = 
    # variable 'libs' from /tmp/decls.js
    libs = -lm -lpthread
    # variable 'dotexe' from /tmp/decls.js
    dotexe = 

    # rule 'cc' from /tmp/rules.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from /tmp/rules.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from /tmp/rules.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from /tmp/rules.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from /tmp/builds.js
    build $builddir/something.o: cc /tmp/something.c
    # build for '$builddir/something_else.o' from /tmp/builds.js
    build $builddir/something_else.o: cc /tmp/something_else.c
    # build for '$builddir/myprog.o' from /tmp/builds.js
    build $builddir/myprog.o: cc /tmp/myprog.c
    # build for '$builddir/myprog' from /tmp/builds.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from /tmp/builds.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from /tmp/builds.js
    build $builddir/hi.txt: something_with_args /tmp/something.txt
      message = hi
    ",
      ],
      "virtualFs": {
        "/tmp/builds.js": [Function],
        "/tmp/decls.js": [Function],
        "/tmp/rules.js": [Function],
      },
    }
  `);
});

test("provided to main function (--out)", () => {
  const { runtimeDelegate, stdout, virtualFs, globCalls } =
    makeTestRuntimeDelegate();

  virtualFs["/tmp/decls.js"] = () => {
    declare("cc", "gcc");
    declare("ar", "gcc-ar");
    declare("cflags", "-Wall");
    declare("ldflags", "");
    declare("libs", "-lm");

    declareOrAppend("libs", "-lpthread");
    declareOrAppend("cflags", "-g");

    declare("dotexe", ".exe");

    overrideDeclaration("dotexe", "");
  };

  virtualFs["/tmp/rules.js"] = () => {
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

    rule("something_with_args", {
      command: "cat $in > $out && echo $message >> $out",
      description: "SOMETHING_WITH_ARGS $out",
    });
  };

  virtualFs["/tmp/builds.js"] = () => {
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

    build({
      output: builddir("hi.txt"),
      inputs: [rel("something.txt")],
      rule: "something_with_args",
      ruleVariables: {
        message: "hi",
      },
    });

    glob("*.*", {});
  };

  main({
    flags: {
      out: new Path("/tmp/build.ninja"),
    },
    files: ["/tmp/decls.js", "/tmp/builds.js", "/tmp/rules.js"],
    runtimeDelegate,
  });

  expect({
    stdout,
    virtualFs,
    globCalls,
  }).toMatchInlineSnapshot(`
    {
      "globCalls": [
        [
          "*.*",
          {},
        ],
      ],
      "stdout": [],
      "virtualFs": {
        "/tmp/build.ninja": "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from /tmp/decls.js
    cc = gcc
    # variable 'ar' from /tmp/decls.js
    ar = gcc-ar
    # variable 'cflags' from /tmp/decls.js
    cflags = -Wall -g
    # variable 'ldflags' from /tmp/decls.js
    ldflags = 
    # variable 'libs' from /tmp/decls.js
    libs = -lm -lpthread
    # variable 'dotexe' from /tmp/decls.js
    dotexe = 

    # rule 'cc' from /tmp/rules.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from /tmp/rules.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from /tmp/rules.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from /tmp/rules.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from /tmp/builds.js
    build $builddir/something.o: cc /tmp/something.c
    # build for '$builddir/something_else.o' from /tmp/builds.js
    build $builddir/something_else.o: cc /tmp/something_else.c
    # build for '$builddir/myprog.o' from /tmp/builds.js
    build $builddir/myprog.o: cc /tmp/myprog.c
    # build for '$builddir/myprog' from /tmp/builds.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from /tmp/builds.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from /tmp/builds.js
    build $builddir/hi.txt: something_with_args /tmp/something.txt
      message = hi
    ",
        "/tmp/builds.js": [Function],
        "/tmp/decls.js": [Function],
        "/tmp/rules.js": [Function],
      },
    }
  `);
});

test("provided to main function (-o)", () => {
  const { runtimeDelegate, stdout, virtualFs, globCalls } =
    makeTestRuntimeDelegate();

  virtualFs["/tmp/decls.js"] = () => {
    declare("cc", "gcc");
    declare("ar", "gcc-ar");
    declare("cflags", "-Wall");
    declare("ldflags", "");
    declare("libs", "-lm");

    declareOrAppend("libs", "-lpthread");
    declareOrAppend("cflags", "-g");

    declare("dotexe", ".exe");

    overrideDeclaration("dotexe", "");
  };

  virtualFs["/tmp/rules.js"] = () => {
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

    rule("something_with_args", {
      command: "cat $in > $out && echo $message >> $out",
      description: "SOMETHING_WITH_ARGS $out",
    });
  };

  virtualFs["/tmp/builds.js"] = () => {
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

    build({
      output: builddir("hi.txt"),
      inputs: [rel("something.txt")],
      rule: "something_with_args",
      ruleVariables: {
        message: "hi",
      },
    });

    glob("*.*", {});
  };

  main({
    flags: {
      o: new Path("/tmp/build.ninja"),
    },
    files: ["/tmp/decls.js", "/tmp/builds.js", "/tmp/rules.js"],
    runtimeDelegate,
  });

  expect({
    stdout,
    virtualFs,
    globCalls,
  }).toMatchInlineSnapshot(`
    {
      "globCalls": [
        [
          "*.*",
          {},
        ],
      ],
      "stdout": [],
      "virtualFs": {
        "/tmp/build.ninja": "# variable 'builddir' from builtin (override with env var BUILDDIR)
    builddir = ./build
    # variable 'cc' from /tmp/decls.js
    cc = gcc
    # variable 'ar' from /tmp/decls.js
    ar = gcc-ar
    # variable 'cflags' from /tmp/decls.js
    cflags = -Wall -g
    # variable 'ldflags' from /tmp/decls.js
    ldflags = 
    # variable 'libs' from /tmp/decls.js
    libs = -lm -lpthread
    # variable 'dotexe' from /tmp/decls.js
    dotexe = 

    # rule 'cc' from /tmp/rules.js
    rule cc
      command = $cc $cflags $in -o $out
      description = CC $out
    # rule 'ar' from /tmp/rules.js
    rule ar
      command = rm -f $out && $ar crs $out $in
      description = AR $out
    # rule 'link' from /tmp/rules.js
    rule link
      command = $cc $ldflags -o $out $in $libs
      description = CC $out
    # rule 'something_with_args' from /tmp/rules.js
    rule something_with_args
      command = cat $in > $out && echo $message >> $out
      description = SOMETHING_WITH_ARGS $out

    # build for '$builddir/something.o' from /tmp/builds.js
    build $builddir/something.o: cc /tmp/something.c
    # build for '$builddir/something_else.o' from /tmp/builds.js
    build $builddir/something_else.o: cc /tmp/something_else.c
    # build for '$builddir/myprog.o' from /tmp/builds.js
    build $builddir/myprog.o: cc /tmp/myprog.c
    # build for '$builddir/myprog' from /tmp/builds.js
    build $builddir/myprog: link $builddir/something.o $builddir/myprog.o
    # build for '$builddir/somethings.a' from /tmp/builds.js
    build $builddir/somethings.a: ar $builddir/something.o $builddir/something_else.o
    # build for '$builddir/hi.txt' from /tmp/builds.js
    build $builddir/hi.txt: something_with_args /tmp/something.txt
      message = hi
    ",
        "/tmp/builds.js": [Function],
        "/tmp/decls.js": [Function],
        "/tmp/rules.js": [Function],
      },
    }
  `);
});

test("provided to main function (--help)", () => {
  const { runtimeDelegate, stdout, virtualFs, globCalls } =
    makeTestRuntimeDelegate();

  main({
    flags: {
      help: true,
    },
    files: [],
    runtimeDelegate,
  });

  expect({
    stdout,
    virtualFs,
    globCalls,
  }).toMatchInlineSnapshot(`
    {
      "globCalls": [],
      "stdout": [
        "shinobi - Generate ninja build files from JS scripts

    Usage: shinobi [options] <scripts...>
    Options:
      --help, -h: Show this text
      --out, -o: Output path (defaults to stdout)
      --fs-path-separator: The path separator to use for Node.js fs module
                           operations during shinobi execution. Defaults to "\\" on
                           Windows and "/" on other platforms.
      --api-path-separator: The path separator to use in path strings returned by
                            shinobi API functions like 'rel' and 'glob'. Defaults
                            to "\\" on Windows and "/" on other platforms.
    Examples:
      shinobi defs.js rules.js programs.js > build.ninja
      shinobi mybuild.js -o build.ninja
      shinobi ninja/**/*.js -o build.ninja
    Notes:
      Add this comment to the top of your JS scripts to get intellisense in VS Code:
      /// <reference types="@suchipi/shinobi/globals.d.ts" />
    ",
      ],
      "virtualFs": {},
    }
  `);
});

test("provided to main function (-h)", () => {
  const { runtimeDelegate, stdout, virtualFs, globCalls } =
    makeTestRuntimeDelegate();

  main({
    flags: {
      h: true,
    },
    files: [],
    runtimeDelegate,
  });

  expect({
    stdout,
    virtualFs,
    globCalls,
  }).toMatchInlineSnapshot(`
    {
      "globCalls": [],
      "stdout": [
        "shinobi - Generate ninja build files from JS scripts

    Usage: shinobi [options] <scripts...>
    Options:
      --help, -h: Show this text
      --out, -o: Output path (defaults to stdout)
      --fs-path-separator: The path separator to use for Node.js fs module
                           operations during shinobi execution. Defaults to "\\" on
                           Windows and "/" on other platforms.
      --api-path-separator: The path separator to use in path strings returned by
                            shinobi API functions like 'rel' and 'glob'. Defaults
                            to "\\" on Windows and "/" on other platforms.
    Examples:
      shinobi defs.js rules.js programs.js > build.ninja
      shinobi mybuild.js -o build.ninja
      shinobi ninja/**/*.js -o build.ninja
    Notes:
      Add this comment to the top of your JS scripts to get intellisense in VS Code:
      /// <reference types="@suchipi/shinobi/globals.d.ts" />
    ",
      ],
      "virtualFs": {},
    }
  `);
});
