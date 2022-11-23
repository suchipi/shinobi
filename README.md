# @suchipi/shinobi

generate ninja build files from js scripts

## Usage

- Install nodejs
- Install shinobi:

```
npm install -D @suchipi/shinobi
```

- Write scripts using the global functions documented in [`node_modules/@suchipi/shinobi/globals.d.ts`](https://github.com/suchipi/shinobi/blob/main/globals.d.ts), for example:

```js
// variables to be used in rules
declare("compiler", "gcc");
declareOrAppend("cflags", "-Wall");
declareOrAppend("cflags", "-g");

// rules for building things
rule("cc", {
  command: "$compiler $cflags $in -o $out", // $in and $out are builtin variables
  description: "CC $out",
});

// things to build
build({
  output: builddir("something.o"), // builddir defaults to `build/` but can be overridden
  inputs: [rel("something.c")], // rel resolves paths relative to the current file
  rule: "cc", // name of rule as defined above
});
```

- Pass those scripts to the shinobi CLI (maybe using a glob). It will output the contents of a ninja file

```bash
shopt -s globstar

npx shinobi ./**/*.ninja.js > build.ninja
```

For instance, the example script from above outputs something like this:

```ninja
# variable 'builddir' from builtin (override with env var BUILDDIR)
builddir = ./build
# variable 'compiler' from myscript.js
compiler = gcc
# variable 'cflags' from myscript.js
cflags = -Wall -g

# rule 'cc' from myscript.js
rule cc
  command = $compiler $cflags $in -o $out
  description = CC $out

# build for '$builddir/something.o' from myscript.js
build $builddir/something.o: cc /tmp/mycode/something.c
```

## License

MIT
